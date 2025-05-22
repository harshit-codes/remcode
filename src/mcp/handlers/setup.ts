import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SetupDetector } from '../../setup/detector';
import { SetupInitializer } from '../../setup/initializer';

const logger = getLogger('SetupMCPHandler');

export class SetupMCPHandler {
  private setupDetector: SetupDetector;
  private setupInitializer: SetupInitializer;

  constructor() {
    this.setupDetector = new SetupDetector();
    this.setupInitializer = new SetupInitializer();
  }

  async handleSetupRepository(req: Request, res: Response, params?: any): Promise<void> {
    const { owner, repo, confirm = false } = params || req.body;

    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }

    try {
      const setupStatus = await this.setupDetector.detectSetupNeeds();
      
      if (!setupStatus.needsSetup) {
        res.status(200).json({ message: 'Repository already set up', status: setupStatus });
        return;
      }

      if (!confirm) {
        res.status(200).json({
          message: 'Setup required. Confirm to proceed.',
          setupRequired: setupStatus,
          confirmationNeeded: true
        });
        return;
      }

      await this.setupInitializer.initializeRepository(owner, repo);
      res.status(200).json({ message: 'Repository setup completed', status: 'initialized' });
    } catch (error) {
      logger.error(`Setup failed: ${error}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Setup failed' });
    }
  }
}
