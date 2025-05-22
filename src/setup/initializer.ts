import { getLogger } from '../utils/logger';
import { SetupDetector, SetupStatus, GitRemoteInfo, SetupReason } from './detector';
import { Prerequisites, PrerequisiteCheck } from './prerequisites';
import { SecretsManager, SecretsOperationSummary } from './secrets';
import { WorkflowGenerator, WorkflowGenerationResult, WorkflowTemplateOptions, WorkflowTemplateType } from './workflow-generator';
import { RemcodeConfigManager, RemcodeConfig, ProcessingStatus } from './remcode-config';

const logger = getLogger('SetupInitializer');

/**
 * Setup options
 */
export interface SetupOptions {
  // Repository options
  owner: string;
  repo: string;
  
  // Optional parameters
  token?: string;
  defaultBranch?: string;
  skipSecrets?: boolean;
  skipWorkflow?: boolean;
  forceUpdate?: boolean;
  workflowType?: WorkflowTemplateType;
  customSecrets?: Record<string, string>;
}

/**
 * Setup result
 */
export interface SetupResult {
  success: boolean;
  setupStatus: SetupStatus;
  prerequisites?: PrerequisiteCheck[];
  secretsResult?: SecretsOperationSummary;
  workflowResult?: WorkflowGenerationResult;
  configResult?: RemcodeConfig;
  error?: string;
  duration: number;
}

/**
 * Class for initializing Remcode in a repository
 */
export class SetupInitializer {
  private detector: SetupDetector;
  private prerequisites: Prerequisites;
  private secretsManager: SecretsManager;
  private workflowGenerator: WorkflowGenerator;
  private configManager: RemcodeConfigManager;
  private repoPath: string;

  /**
   * Constructor
   * @param repoPath Path to the repository
   * @param githubToken GitHub API token
   */
  constructor(repoPath: string = process.cwd(), githubToken?: string) {
    this.repoPath = repoPath;
    this.detector = new SetupDetector(repoPath);
    this.prerequisites = new Prerequisites(repoPath);
    this.secretsManager = new SecretsManager(githubToken);
    this.workflowGenerator = new WorkflowGenerator(repoPath);
    this.configManager = new RemcodeConfigManager(repoPath);
    
    logger.debug(`SetupInitializer initialized for path: ${repoPath}`);
  }

  /**
   * Initialize a repository with Remcode
   * @param options Setup options
   * @returns Setup result
   */
  async initializeRepository(options: SetupOptions): Promise<SetupResult> {
    const startTime = Date.now();
    
    const { owner, repo, forceUpdate = false } = options;
    logger.info(`Initializing remcode for ${owner}/${repo}`);
    
    try {
      // Phase 0: Detect current setup status
      const setupStatus = await this.detector.detectSetupNeeds();
      
      // If setup is already complete and not forcing update, return early
      if (!setupStatus.needsSetup && !forceUpdate) {
        logger.info('Repository already set up, no changes needed');
        return {
          success: true,
          setupStatus,
          duration: Date.now() - startTime
        };
      }
      
      // Phase 1: Check prerequisites
      logger.info('Phase 1: Checking prerequisites');
      const prerequisiteChecks = await this.prerequisites.checkAll();
      const prerequisitesPass = prerequisiteChecks.every((check: PrerequisiteCheck) => check.passed);
      
      if (!prerequisitesPass) {
        const failedChecks = prerequisiteChecks.filter((check: PrerequisiteCheck) => !check.passed);
        const errors = failedChecks.map((check: PrerequisiteCheck) => check.message).join(', ');
        throw new Error(`Prerequisites check failed: ${errors}`);
      }
      
      // Use Git info from detector if available
      const gitInfo = setupStatus.gitInfo;
      const defaultBranch = options.defaultBranch || gitInfo?.defaultBranch || 'main';
      
      // Phase 2: Configure repository secrets (if not skipped)
      let secretsResult: SecretsOperationSummary | undefined;
      
      if (!options.skipSecrets) {
        logger.info('Phase 2: Configuring repository secrets');
        secretsResult = await this.secretsManager.configureRepositorySecrets(owner, repo);
        
        if (secretsResult.failed > 0 && secretsResult.results.some(r => !r.success && r.secretName.includes('REQUIRED'))) {
          throw new Error('Failed to configure required secrets');
        }
      } else {
        logger.info('Phase 2: Skipping repository secrets configuration');
      }
      
      // Phase 3: Generate workflow (if not skipped)
      let workflowResult: WorkflowGenerationResult | undefined;
      
      if (!options.skipWorkflow) {
        logger.info('Phase 3: Generating GitHub Actions workflow');
        
        const workflowOptions: WorkflowTemplateOptions = {
          repoName: repo,
          owner,
          branches: [defaultBranch],
          customSecrets: options.customSecrets
        };
        
        workflowResult = await this.workflowGenerator.generateWorkflow(
          workflowOptions,
          options.workflowType || WorkflowTemplateType.BASIC
        );
        
        if (!workflowResult.success) {
          throw new Error(`Failed to generate workflow: ${workflowResult.error}`);
        }
      } else {
        logger.info('Phase 3: Skipping workflow generation');
      }
      
      // Phase 4: Create or update .remcode configuration
      logger.info('Phase 4: Creating .remcode configuration');
      
      const configOptions: Partial<RemcodeConfig> = {
        repository: {
          name: repo,
          owner,
          url: `https://github.com/${owner}/${repo}`,
          defaultBranch
        }
      };
      
      const configResult = await this.configManager.createInitialConfig(owner, repo, configOptions);
      
      // Final phase: Update setup status
      const updatedStatus = await this.detector.detectSetupNeeds();
      
      logger.info('Repository initialization complete');
      
      return {
        success: true,
        setupStatus: updatedStatus,
        prerequisites: prerequisiteChecks,
        secretsResult,
        workflowResult,
        configResult,
        duration: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Repository initialization failed: ${errorMessage}`);
      
      const finalStatus = await this.detector.detectSetupNeeds().catch(() => ({ 
        needsSetup: true,
        hasRemcodeFile: false,
        hasGitRepo: false,
        hasGitHubRepo: false,
        hasWorkflow: false,
        hasRequiredSecrets: false,
        hasValidConfig: false,
        reason: SetupReason.NO_GITHUB_REPO,
        detectionTimestamp: new Date().toISOString()
      } as SetupStatus));
      
      return {
        success: false,
        setupStatus: finalStatus,
        error: errorMessage,
        duration: Date.now() - startTime
      };
    }
  }
  
  /**
   * Check if a repository needs setup
   * @returns Setup status
   */
  async checkSetupNeeds(): Promise<SetupStatus> {
    return this.detector.detectSetupNeeds();
  }
  
  /**
   * Update an existing Remcode setup
   * @param options Setup options
   * @returns Setup result
   */
  async updateSetup(options: SetupOptions): Promise<SetupResult> {
    // Force update
    return this.initializeRepository({
      ...options,
      forceUpdate: true
    });
  }
  
  /**
   * Clean up Remcode setup
   * @returns True if cleanup was successful
   */
  async cleanupSetup(): Promise<boolean> {
    try {
      // Delete configuration file
      const configDeleted = this.configManager.deleteConfig();
      
      // Could also remove workflow and secrets, but that's potentially destructive
      // so we'll leave that for manual cleanup
      
      return configDeleted;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Cleanup failed: ${errorMessage}`);
      return false;
    }
  }
}
