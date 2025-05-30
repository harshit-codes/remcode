import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SetupDetector } from '../../setup/detector';
import { SetupInitializer } from '../../setup/initializer';
import { Prerequisites } from '../../setup/prerequisites';
import { RemcodeConfigManager } from '../../setup/remcode-config';
import { SecretsManager } from '../../setup/secrets';
import { WorkflowGenerator } from '../../workflows/generator';
import { WorkflowTemplateType } from '../../setup/workflow-generator';
import { ModelInitializer, ModelInitializationResult } from '../../setup/model-initializer';
import { SimpleValidator } from '../validation/simple-validator';

const logger = getLogger('SetupMCPHandler');

export interface SetupOptions {
  owner: string;
  repo: string;
  token?: string;
  branch?: string;
  configOverrides?: Record<string, any>;
  workflowType?: string;
  skipWorkflows?: boolean;
  skipSecrets?: boolean;
  confirm?: boolean;
}

export class SetupMCPHandler {
  private setupDetector: SetupDetector;
  private setupInitializer: SetupInitializer;
  private prerequisites: Prerequisites;
  private configManager: RemcodeConfigManager;
  private secretsManager: SecretsManager;
  private workflowGenerator: WorkflowGenerator;

  constructor(githubToken?: string) {
    this.setupDetector = new SetupDetector();
    this.setupInitializer = new SetupInitializer();
    this.prerequisites = new Prerequisites();
    this.configManager = new RemcodeConfigManager();
    this.secretsManager = new SecretsManager(githubToken);
    this.workflowGenerator = new WorkflowGenerator();
  }

  /**
   * Handle repository setup request
   */
  async handleSetupRepository(req: Request, res: Response, params?: any): Promise<void> {
    const options: SetupOptions = params || req.body;
    const { 
      owner, 
      repo, 
      token, 
      branch = 'main',
      configOverrides = {},
      workflowType = 'basic',
      skipWorkflows = false,
      skipSecrets = false,
      confirm = false 
    } = options;

    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }

    try {
      // Validation is now handled globally in the main MCP router
      logger.info(`Setting up repository: ${owner}/${repo}`);

      // Check prerequisites
      const prereqChecks = await this.prerequisites.checkAll();
      const allPassed = prereqChecks.every(check => check.passed);
      const criticalFailed = prereqChecks.some(check => check.critical && !check.passed);
      const errors = prereqChecks.filter(check => !check.passed).map(check => check.message);
      
      if (criticalFailed) {
        res.status(400).json({
          message: 'Critical prerequisites check failed',
          prerequisites: prereqChecks,
          errors: errors,
          allPassed: false,
          criticalFailed: true
        });
        return;
      }
      
      // Detect setup needs
      const setupStatus = await this.setupDetector.detectSetupNeeds();
      
      if (!setupStatus.needsSetup) {
        res.status(200).json({ 
          message: 'Repository already set up', 
          status: setupStatus,
          prerequisites: prereqChecks,
          allPassed: allPassed
        });
        return;
      }

      // If confirmation is required and not provided, return setup needs
      if (!confirm) {
        res.status(200).json({
          message: 'Setup required. Confirm to proceed.',
          setupRequired: setupStatus,
          prerequisites: prereqChecks,
          allPassed: allPassed,
          confirmationNeeded: true
        });
        return;
      }

      // Initialize repository with proper options
      const initResult = await this.setupInitializer.initializeRepository({
        owner,
        repo,
        token: token || '',
        defaultBranch: branch,
        skipSecrets: skipSecrets || false,
        skipWorkflow: skipWorkflows || false,
        forceUpdate: false,
        workflowType: workflowType === 'all' ? WorkflowTemplateType.ADVANCED : (workflowType === 'advanced' ? WorkflowTemplateType.ADVANCED : WorkflowTemplateType.BASIC),
        customSecrets: {}
      });
      
      // Create or update config with overrides if provided
      let configResult = { success: false, created: false, config: {} };
      try {
        if (Object.keys(configOverrides).length > 0) {
          const exists = await this.configManager.configExists();
          if (exists) {
            // Read existing config
            const currentConfig = await this.configManager.readConfig();
            // Merge with overrides
            const newConfig = { ...currentConfig, ...configOverrides };
            // Write updated config using updateConfig method
            await this.configManager.updateConfig(newConfig);
            configResult = { success: true, created: false, config: newConfig };
          } else {
            // Create new config
            await this.configManager.updateConfig(configOverrides);
            configResult = { success: true, created: true, config: configOverrides };
          }
        } else {
          // Ensure default config exists
          const exists = await this.configManager.configExists();
          if (!exists) {
            // Create default config
            const defaultConfig = { version: '1.0.0' };
            await this.configManager.updateConfig(defaultConfig);
            configResult = { success: true, created: true, config: defaultConfig };
          } else {
            // Config already exists
            const currentConfig = await this.configManager.readConfig();
            configResult = { success: true, created: false, config: currentConfig };
          }
        }
      } catch (configError) {
        logger.error(`Config setup failed: ${configError instanceof Error ? configError.message : String(configError)}`);
        // Non-fatal, continue with setup
      }
      
      // Initialize embedding model (critical for vectorization)
      let modelInitResult: ModelInitializationResult = { 
        success: false, 
        modelId: '', 
        modelName: '', 
        embeddingDimension: 0, 
        isHealthy: false,
        error: undefined,
        availableModels: []
      };
      try {
        const huggingfaceToken = process.env.HUGGINGFACE_TOKEN;
        if (huggingfaceToken) {
          logger.info('🔧 Initializing embedding model for codebase vectorization...');
          
          const modelInitializer = new ModelInitializer(huggingfaceToken);
          modelInitResult = await modelInitializer.initializeEmbeddingModel({
            token: huggingfaceToken,
            preferredModel: 'microsoft/codebert-base',
            testEmbedding: true
          });

          if (modelInitResult.success) {
            logger.info(`✅ Embedding model initialized: ${modelInitResult.modelName} (${modelInitResult.modelId})`);
            
            // Update config with model information
            try {
              const modelConfig = ModelInitializer.getModelConfiguration(modelInitResult);
              const currentConfig = await this.configManager.readConfig();
              const updatedConfig = {
                ...currentConfig,
                vectorization: {
                  ...currentConfig.vectorization,
                  ...modelConfig
                }
              };
              await this.configManager.updateConfig(updatedConfig);
              logger.info('📝 Model configuration saved to .remcode file');
            } catch (configUpdateError) {
              logger.warn(`Warning: Could not update config with model info: ${configUpdateError instanceof Error ? configUpdateError.message : String(configUpdateError)}`);
            }
          } else {
            logger.warn(`⚠️ Model initialization failed: ${modelInitResult.error || 'Unknown error'}`);
            logger.warn('🔄 Proceeding with setup - embeddings may use fallback models');
          }
        } else {
          logger.warn('⚠️ No HuggingFace token found. Skipping model initialization.');
          logger.info('💡 Add HUGGINGFACE_TOKEN to environment variables for embedding functionality');
        }
      } catch (modelError) {
        logger.error(`❌ Model initialization failed: ${modelError instanceof Error ? modelError.message : String(modelError)}`);
        logger.warn('🔄 Proceeding with setup - embeddings will use fallback models');
      }
      
      // Generate workflows if not skipped
      let workflowResult;
      if (!skipWorkflows) {
        try {
          // Determine which workflow type to generate
          if (workflowType === 'scheduled') {
            workflowResult = await this.workflowGenerator.generateScheduledWorkflow(`${owner}/${repo}`);
          } else if (workflowType === 'advanced') {
            workflowResult = await this.workflowGenerator.generateAdvancedWorkflow(`${owner}/${repo}`);
          } else if (workflowType === 'all') {
            workflowResult = await this.workflowGenerator.generateAllWorkflows(`${owner}/${repo}`);
          } else {
            // Default to basic workflow
            workflowResult = await this.workflowGenerator.generateRemcodeWorkflow(`${owner}/${repo}`);
          }
        } catch (workflowError) {
          logger.error(`Workflow generation failed: ${workflowError instanceof Error ? workflowError.message : String(workflowError)}`);
          // Non-fatal, continue with setup
        }
      }
      
      // Set up secrets if not skipped
      let secretsResult = { success: false, successCount: 0, failureCount: 0 };
      if (!skipSecrets && token) {
        try {
          // Configure repository secrets using the secrets manager
          const secretsOperationResult = await this.secretsManager.configureRepositorySecrets(owner, repo);
          
          if (secretsOperationResult) {
            secretsResult = { 
              success: secretsOperationResult.successful > 0,
              successCount: secretsOperationResult.successful,
              failureCount: secretsOperationResult.failed
            };
          }
        } catch (secretsError) {
          logger.error(`Secrets setup failed: ${secretsError instanceof Error ? secretsError.message : String(secretsError)}`);
          // Non-fatal, continue with setup
        }
      }
      
      res.status(200).json({ 
        message: 'Repository setup completed', 
        status: 'initialized',
        repository: { owner, repo, branch },
        config: configResult?.success ? 'configured' : 'skipped',
        workflows: workflowResult && 'success' in workflowResult && workflowResult.success ? 'generated' : (skipWorkflows ? 'skipped' : 'failed'),
        secrets: secretsResult?.success ? 'configured' : (skipSecrets ? 'skipped' : 'failed'),
        embeddings: {
          status: modelInitResult.success ? 'initialized' : 'failed',
          modelId: modelInitResult.modelId,
          modelName: modelInitResult.modelName,
          dimension: modelInitResult.embeddingDimension,
          healthy: modelInitResult.isHealthy,
          availableModels: modelInitResult.availableModels?.length || 0
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Setup failed: ${errorMessage}`);
      res.status(500).json({ error: errorMessage });
    }
  }
  
  /**
   * Check repository prerequisites
   */
  async handleCheckPrerequisites(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const prereqCheck = await this.prerequisites.checkAll();
      res.status(200).json(prereqCheck);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Prerequisites check failed: ${errorMessage}`);
      res.status(500).json({ error: errorMessage });
    }
  }
  
  /**
   * Configure repository settings
   */
  async handleConfigureRepository(req: Request, res: Response, params?: any): Promise<void> {
    const { config = {} } = params || req.body;
    
    try {
      const exists = await this.configManager.configExists();
      
      if (exists) {
        // Update existing config
        const currentConfig = await this.configManager.readConfig();
        const newConfig = { ...currentConfig, ...config };
        await this.configManager.updateConfig(newConfig);
        
        res.status(200).json({
          message: 'Configuration updated',
          config: newConfig,
          created: false
        });
      } else {
        // Create new config
        await this.configManager.updateConfig(config);
        
        res.status(200).json({
          message: 'Configuration created',
          config: config,
          created: true
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Configuration failed: ${errorMessage}`);
      res.status(500).json({ error: errorMessage });
    }
  }
  
  /**
   * Set up repository secrets
   */
  async handleSetupSecrets(req: Request, res: Response, params?: any): Promise<void> {
    const { owner, repo, secrets = {} } = params || req.body;
    
    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }
    
    try {
      // Configure repository secrets using the secrets manager
      const secretsOperationResult = await this.secretsManager.configureRepositorySecrets(owner, repo);
      
      if (!secretsOperationResult) {
        throw new Error('Failed to configure repository secrets');
      }
      
      res.status(200).json({
        message: 'Secrets configured successfully',
        secretsConfigured: secretsOperationResult.successful,
        secretsFailed: secretsOperationResult.failed,
        total: secretsOperationResult.total
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Secrets setup failed: ${errorMessage}`);
      res.status(500).json({ error: errorMessage });
    }
  }
  
  /**
   * Generate repository workflows
   */
  async handleGenerateWorkflows(req: Request, res: Response, params?: any): Promise<void> {
    const { owner, repo, type = 'basic' } = params || req.body;
    
    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }
    
    try {
      let result;
      const repoName = `${owner}/${repo}`;
      
      switch (type) {
        case 'scheduled':
          result = await this.workflowGenerator.generateScheduledWorkflow(repoName);
          break;
        case 'advanced':
          result = await this.workflowGenerator.generateAdvancedWorkflow(repoName);
          break;
        case 'all':
          result = await this.workflowGenerator.generateAllWorkflows(repoName);
          break;
        case 'basic':
        default:
          result = await this.workflowGenerator.generateRemcodeWorkflow(repoName);
      }
      
      // Handle the different result types
      if (type === 'all' && result instanceof Map) {
        // For all workflows, return a summary of each workflow generated
        const workflowResults = Array.from(result.entries());
        const successfulWorkflows = workflowResults.filter(([_, r]) => r.success);
        
        if (successfulWorkflows.length > 0) {
          res.status(200).json({
            message: `${successfulWorkflows.length} workflow(s) generated successfully`,
            workflows: workflowResults.map(([name, _]) => name),
            paths: successfulWorkflows.map(([_, result]) => result.filePath),
            successCount: successfulWorkflows.length,
            totalCount: workflowResults.length
          });
        } else {
          res.status(500).json({
            error: 'Failed to generate workflows',
            details: 'No workflows could be generated successfully'
          });
        }
      } else if (result && 'success' in result) {
        // For single workflow results
        if (result.success) {
          res.status(200).json({
            message: `${type} workflow generated successfully`,
            workflow: type,
            path: result.filePath
          });
        } else {
          res.status(500).json({
            error: 'Failed to generate workflow',
            details: result.error
          });
        }
      } else {
        // Fallback for unknown result type
        res.status(500).json({
          error: 'Failed to generate workflows',
          details: 'Unknown result format'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Workflow generation failed: ${errorMessage}`);
      res.status(500).json({ error: errorMessage });
    }
  }
}
