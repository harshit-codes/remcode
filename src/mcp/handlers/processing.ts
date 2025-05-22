import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { StateManager } from '../../processing/state-manager';

const logger = getLogger('ProcessingMCPHandler');

export class ProcessingMCPHandler {
  private stateManager: StateManager;

  constructor() {
    this.stateManager = new StateManager();
  }

  async handleTriggerReprocessing(req: Request, res: Response, params?: any): Promise<void> {
    const { type = 'incremental', force = false } = params || req.body;

    try {
      logger.info(`Triggering ${type} reprocessing (force: ${force})`);
      
      // Stub implementation - would trigger actual reprocessing
      await this.stateManager.updateProcessingStatus('processing');
      
      res.status(200).json({
        message: `${type} reprocessing triggered`,
        status: 'processing'
      });
    } catch (error) {
      res.status(500).json({ error: 'Reprocessing failed' });
    }
  }

  async handleGetProcessingStatus(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const state = await this.stateManager.loadState();
      
      res.status(200).json({
        status: state?.processing?.status || 'unknown',
        lastUpdate: state?.processing?.lastUpdate || null,
        statistics: state?.statistics || {}
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get processing status' });
    }
  }
}
