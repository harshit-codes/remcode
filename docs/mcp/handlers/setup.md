# setup.ts

**File Path:** `mcp/handlers/setup.ts`

## Overview

Handle repository setup request

## Dependencies

- `express`
- `../../utils/logger`
- `../../setup/detector`
- `../../setup/initializer`
- `../../setup/prerequisites`
- `../../setup/remcode-config`
- `../../setup/secrets`
- `../../workflows/generator`
- `../../workflows/templates`

## Classes

### `SetupMCPHandler`

**Class Definition:**

```typescript
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

      // Initialize repository
      const initResult = await this.setupInitializer.initializeRepository(owner, repo);
      
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
            // Write updated config
            await this.configManager.writeConfig(newConfig);
            configResult = { success: true, created: false, config: newConfig };
          } else {
            // Create new config
            await this.configManager.writeConfig(configOverrides);
            configResult = { success: true, created: true, config: configOverrides };
          }
        } else {
          // Ensure default config exists
          const exists = await this.configManager.configExists();
          if (!exists) {
            // Create default config
            const defaultConfig = { version: '1.0.0' };
            await this.configManager.writeConfig(defaultConfig);
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
          // Create a public key for the repository
          const publicKeyResult = await this.secretsManager.getRepoPublicKey(owner, repo);
          
          if (publicKeyResult) {
            // Set common secrets
            const secrets = {
              GITHUB_TOKEN: token
            };
            
            let successCount = 0;
            let failureCount = 0;
            
            // Create each secret
            for (const [name, value] of Object.entries(secrets)) {
              try {
                await this.secretsManager.createOrUpdateSecret(
                  owner,
                  repo,
                  name,
                  value,
                  publicKeyResult.key,
                  publicKeyResult.key_id
                );
                successCount++;
              } catch (e) {
                failureCount++;
                logger.error(`Failed to create secret ${name}: ${e instanceof Error ? e.message : String(e)}`);
              }
            }
            
            secretsResult = { 
              success: successCount > 0,
              successCount,
              failureCount
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
        workflows: workflowResult?.success ? 'generated' : (skipWorkflows ? 'skipped' : 'failed'),
        secrets: secretsResult?.success ? 'configured' : (skipSecrets ? 'skipped' : 'failed')
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
      let created = false;
      
      if (exists) {
        // Update existing config
        const currentConfig = await this.configManager.readConfig();
        const newConfig = { ...currentConfig, ...config };
        await this.configManager.writeConfig(newConfig);
        created = false;
        
        res.status(200).json({
          message: 'Configuration updated',
          config: newConfig,
          created: false
        });
      } else {
        // Create new config
        await this.configManager.writeConfig(config);
        created = true;
        
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
      // Create a public key for the repository
      const publicKeyResult = await this.secretsManager.getRepoPublicKey(owner, repo);
      
      if (!publicKeyResult) {
        throw new Error('Failed to get repository public key');
      }
      
      let successCount = 0;
      let failureCount = 0;
      
      // Create each secret
      for (const [name, value] of Object.entries(secrets)) {
        try {
          await this.secretsManager.createOrUpdateSecret(
            owner,
            repo,
            name,
            value,
            publicKeyResult.key,
            publicKeyResult.key_id
          );
          successCount++;
        } catch (e) {
          failureCount++;
          logger.error(`Failed to create secret ${name}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      
      res.status(200).json({
        message: 'Secrets configured successfully',
        secretsConfigured: successCount,
        secretsFailed: failureCount
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
```

**Methods:**

#### `handleSetupRepository()`

Handle repository setup request

```typescript
handleSetupRepository(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleCheckPrerequisites()`

Check repository prerequisites

```typescript
handleCheckPrerequisites(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleConfigureRepository()`

Configure repository settings

```typescript
handleConfigureRepository(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleSetupSecrets()`

Set up repository secrets

```typescript
handleSetupSecrets(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGenerateWorkflows()`

Generate repository workflows

```typescript
handleGenerateWorkflows(req: Request, res: Response, params?: any): Promise<void> {
```

## Interfaces

### `SetupOptions`

**Interface Definition:**

```typescript
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
```

