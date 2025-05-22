import { getLogger } from '../utils/logger';
import { SetupDetector } from './detector';
import { Prerequisites } from './prerequisites';
import { SecretsManager } from './secrets';
import { WorkflowGenerator } from './workflow-generator';
import { RemcodeConfigManager } from './remcode-config';

const logger = getLogger('SetupInitializer');

export class SetupInitializer {
  private detector: SetupDetector;
  private prerequisites: Prerequisites;
  private secretsManager: SecretsManager;
  private workflowGenerator: WorkflowGenerator;
  private configManager: RemcodeConfigManager;

  constructor() {
    this.detector = new SetupDetector();
    this.prerequisites = new Prerequisites();
    this.secretsManager = new SecretsManager();
    this.workflowGenerator = new WorkflowGenerator();
    this.configManager = new RemcodeConfigManager();
  }

  async initializeRepository(owner: string, repo: string): Promise<void> {
    logger.info(`Initializing remcode for ${owner}/${repo}`);
    
    // Phase 1: Check prerequisites
    const prerequisitesPass = await this.prerequisites.checkAll();
    if (!prerequisitesPass) {
      throw new Error('Prerequisites check failed');
    }

    // Phase 2: Configure repository secrets
    await this.secretsManager.configureRepositorySecrets(owner, repo);
    
    // Phase 3: Generate workflow
    await this.workflowGenerator.generateWorkflow(repo);
    
    // Phase 4: Create .remcode configuration
    await this.configManager.createInitialConfig(owner, repo);
    
    logger.info('Repository initialization complete');
  }
}
