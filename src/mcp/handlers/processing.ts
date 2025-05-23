import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { StateManager, RemcodeState } from '../../processing/state-manager';
import { WorkflowMonitor } from '../../workflows/monitor';
import { WorkflowGenerator } from '../../workflows/generator';
import { WorkflowType } from '../../workflows/templates';

const logger = getLogger('ProcessingMCPHandler');

export interface ProcessingOptions {
  type: 'auto' | 'full' | 'incremental' | 'vectorize' | 'analyze';
  force: boolean;
  repository?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  token?: string;
  timeout?: number;
  dryRun?: boolean;
}

export interface ProcessingStatusResponse {
  status: 'idle' | 'analyzing' | 'vectorizing' | 'updating' | 'completed' | 'failed';
  lastProcessed?: string;
  currentCommit?: string;
  pendingChanges?: boolean;
  lastError?: string;
  stats?: {
    filesProcessed: number;
    chunksCreated: number;
    vectorsStored: number;
    lastDuration?: number;
  };
  workflow?: {
    status: string;
    runId?: number;
    url?: string;
    startedAt?: string;
    completedAt?: string;
  };
}

export class ProcessingMCPHandler {
  private stateManager: StateManager;
  private workflowMonitor: WorkflowMonitor;
  private workflowGenerator: WorkflowGenerator;

  constructor(githubToken?: string) {
    this.stateManager = new StateManager();
    this.workflowMonitor = new WorkflowMonitor(githubToken);
    this.workflowGenerator = new WorkflowGenerator();
  }

  /**
   * Trigger repository reprocessing
   */
  async handleTriggerReprocessing(req: Request, res: Response, params?: any): Promise<void> {
    const options: ProcessingOptions = params || req.body;
    const { 
      type = 'auto', 
      force = false, 
      owner, 
      repo, 
      branch = 'main',
      timeout = 3600,
      dryRun = false
    } = options;

    try {
      logger.info(`Triggering ${type} reprocessing`, { force, owner, repo, branch, dryRun });
      
      if (!owner || !repo) {
        res.status(400).json({ 
          error: 'Owner and repo are required for processing',
          received: { owner, repo }
        });
        return;
      }
      
      // Update processing status
      await this.stateManager.updateProcessingStatus('analyzing');
      
      // Prepare workflow dispatch inputs
      const workflowInputs: Record<string, any> = {
        force_full_reprocess: force,
        processing_type: type,
        debug_mode: false
      };

      if (dryRun) {
        res.json({
          success: true,
          message: 'Dry run completed - configuration is valid',
          type,
          inputs: workflowInputs,
          repository: `${owner}/${repo}`,
          branch
        });
        return;
      }

      // Trigger GitHub Actions workflow
      const workflowId = await this.workflowMonitor.findWorkflowByName(owner, repo, 'remcode.yml');
      
      if (!workflowId) {
        throw new Error('Remcode workflow not found. Please run repository setup first.');
      }

      const runId = await this.workflowMonitor.triggerWorkflow(
        owner, 
        repo, 
        workflowId.toString(), 
        branch, 
        workflowInputs
      );

      if (!runId) {
        throw new Error('Failed to trigger workflow run');
      }

      logger.info(`Triggered workflow run ${runId} for ${owner}/${repo}`);

      res.json({
        success: true,
        message: `${type} processing triggered successfully`,
        workflowRunId: runId,
        workflowUrl: `https://github.com/${owner}/${repo}/actions/runs/${runId}`,
        estimatedDuration: type === 'full' ? '10-30 minutes' : '2-10 minutes'
      });

    } catch (error: any) {
      logger.error('Failed to trigger reprocessing', error);
      await this.stateManager.updateProcessingStatus('failed');
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        type,
        repository: `${owner}/${repo}`
      });
    }
  }

  /**
   * Get current processing status
   */
  async handleGetProcessingStatus(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const { owner, repo, runId } = params || req.query;
      const state = await this.stateManager.loadState();
      
      const response: ProcessingStatusResponse = {
        status: state?.processing?.status || 'idle',
        lastProcessed: state?.processing?.lastUpdated,
        currentCommit: state?.repository?.commit,
        stats: state?.processing?.stats ? {
          filesProcessed: state.processing.stats.filesProcessed || 0,
          chunksCreated: state.processing.stats.chunksCreated || 0,
          vectorsStored: state.processing.stats.vectorsStored || 0,
          lastDuration: state.processing.stats.lastProcessingDuration
        } : undefined
      };

      logger.info('Retrieved processing status', { status: response.status, owner, repo, runId });
      res.json(response);

    } catch (error: any) {
      logger.error('Failed to get processing status', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
        status: 'unknown'
      });
    }
  }

  /**
   * Get workflow processing history
   */
  async handleGetProcessingHistory(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const { owner, repo, limit = 10 } = params || req.query;
      
      if (!owner || !repo) {
        res.status(400).json({ 
          error: 'Owner and repo are required for processing history',
          received: { owner, repo }
        });
        return;
      }

      logger.info(`Getting processing history for ${owner}/${repo}`, { limit });

      const workflowRuns = await this.workflowMonitor.getWorkflowRunsDetailed(
        owner, 
        repo, 
        'remcode.yml', 
        parseInt(limit as string)
      );

      const history = workflowRuns.map(run => ({
        runId: run.runId,
        status: run.status,
        conclusion: run.conclusion,
        startedAt: run.createdAt,
        completedAt: run.updatedAt,
        url: run.url,
        message: run.message
      }));

      const state = await this.stateManager.loadState();
      
      res.json({
        success: true,
        repository: `${owner}/${repo}`,
        currentState: {
          status: state?.processing?.status || 'idle',
          lastProcessed: state?.processing?.lastUpdated,
          statistics: state?.processing?.stats
        },
        history,
        totalRuns: history.length
      });

    } catch (error: any) {
      logger.error('Failed to get processing history', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Cancel a running workflow
   */
  async handleCancelProcessing(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const { owner, repo, runId } = params || req.body;
      
      if (!owner || !repo || !runId) {
        res.status(400).json({ 
          error: 'Owner, repo, and runId are required to cancel processing'
        });
        return;
      }

      await this.workflowMonitor.cancelWorkflowRun(owner, repo, parseInt(runId));
      await this.stateManager.updateProcessingStatus('idle');

      res.json({
        success: true,
        message: `Processing run ${runId} cancelled successfully`,
        runId: parseInt(runId),
        repository: `${owner}/${repo}`
      });

    } catch (error: any) {
      logger.error('Failed to cancel processing', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Retry a failed workflow
   */
  async handleRetryProcessing(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const { owner, repo, runId, onlyFailedJobs = false } = params || req.body;
      
      if (!owner || !repo || !runId) {
        res.status(400).json({ 
          error: 'Owner, repo, and runId are required to retry processing'
        });
        return;
      }

      await this.workflowMonitor.retryWorkflowRun(owner, repo, parseInt(runId), onlyFailedJobs);
      await this.stateManager.updateProcessingStatus('analyzing');

      res.json({
        success: true,
        message: `Processing run ${runId} retry triggered successfully`,
        originalRunId: parseInt(runId),
        retryType: onlyFailedJobs ? 'failed_jobs_only' : 'all_jobs',
        repository: `${owner}/${repo}`,
        statusUrl: `https://github.com/${owner}/${repo}/actions/runs/${runId}`
      });

    } catch (error: any) {
      logger.error('Failed to retry processing', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get workflow logs
   */
  async handleGetProcessingLogs(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const { owner, repo, runId } = params || req.query;
      
      if (!owner || !repo || !runId) {
        res.status(400).json({ 
          error: 'Owner, repo, and runId are required to get processing logs'
        });
        return;
      }

      const logs = await this.workflowMonitor.getWorkflowRunLogs(owner, repo, parseInt(runId));

      if (!logs) {
        res.status(404).json({
          error: 'Logs not found or not yet available'
        });
        return;
      }

      res.json({
        success: true,
        runId: parseInt(runId),
        logs: logs.toString('utf8')
      });

    } catch (error: any) {
      logger.error('Failed to get processing logs', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get processing metrics and analytics
   */
  async handleGetProcessingMetrics(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const { owner, repo, days = 30 } = params || req.query;
      
      if (!owner || !repo) {
        res.status(400).json({ 
          error: 'Owner and repo are required for processing metrics'
        });
        return;
      }

      const workflowRuns = await this.workflowMonitor.getWorkflowRunsDetailed(
        owner, 
        repo, 
        'remcode.yml', 
        100
      );

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string));
      
      const recentRuns = workflowRuns.filter(run => 
        run.createdAt && new Date(run.createdAt) >= cutoffDate
      );

      const metrics = {
        totalRuns: recentRuns.length,
        successful: recentRuns.filter(r => r.conclusion === 'success').length,
        failed: recentRuns.filter(r => r.conclusion === 'failure').length,
        successRate: recentRuns.length > 0 ? 
          (recentRuns.filter(r => r.conclusion === 'success').length / recentRuns.length * 100).toFixed(2) + '%' : 
          'N/A'
      };

      const state = await this.stateManager.loadState();

      res.json({
        success: true,
        repository: `${owner}/${repo}`,
        period: `${days} days`,
        metrics,
        currentState: {
          status: state?.processing?.status || 'idle',
          statistics: state?.processing?.stats
        }
      });

    } catch (error: any) {
      logger.error('Failed to get processing metrics', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get workflow analytics and performance metrics
   */
  async handleGetWorkflowAnalytics(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const { owner, repo, days = 30 } = params || req.query;
      
      if (!owner || !repo) {
        res.status(400).json({ 
          error: 'Owner and repo are required for workflow analytics'
        });
        return;
      }

      logger.info(`Getting workflow analytics for ${owner}/${repo}`, { days });

      const analytics = await this.workflowMonitor.getWorkflowAnalytics(
        owner, 
        repo, 
        parseInt(days as string)
      );

      res.json({
        success: true,
        repository: `${owner}/${repo}`,
        period: `${days} days`,
        analytics,
        generatedAt: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to get workflow analytics', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Monitor workflow health and get recommendations
   */
  async handleMonitorWorkflowHealth(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const { 
        owner, 
        repo, 
        maxFailureRate = 50,
        maxConsecutiveFailures = 3,
        alertOnSlowRuns = true,
        maxDurationMinutes = 60
      } = params || req.query;
      
      if (!owner || !repo) {
        res.status(400).json({ 
          error: 'Owner and repo are required for workflow health monitoring'
        });
        return;
      }

      logger.info(`Monitoring workflow health for ${owner}/${repo}`);

      const healthStatus = await this.workflowMonitor.monitorWorkflowHealth(
        owner, 
        repo, 
        {
          maxFailureRate: parseInt(maxFailureRate as string),
          maxConsecutiveFailures: parseInt(maxConsecutiveFailures as string),
          alertOnSlowRuns: alertOnSlowRuns === 'true',
          maxDurationMinutes: parseInt(maxDurationMinutes as string)
        }
      );

      res.json({
        success: true,
        repository: `${owner}/${repo}`,
        health: healthStatus,
        checkedAt: new Date().toISOString(),
        actionRequired: !healthStatus.healthy
      });

    } catch (error: any) {
      logger.error('Failed to monitor workflow health', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get automated workflow recommendations
   */
  async handleGetWorkflowRecommendations(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const { owner, repo } = params || req.query;
      
      if (!owner || !repo) {
        res.status(400).json({ 
          error: 'Owner and repo are required for workflow recommendations'
        });
        return;
      }

      logger.info(`Generating workflow recommendations for ${owner}/${repo}`);

      // Get analytics and health data for recommendations
      const [analytics, health] = await Promise.all([
        this.workflowMonitor.getWorkflowAnalytics(owner, repo, 30),
        this.workflowMonitor.monitorWorkflowHealth(owner, repo)
      ]);

      // Generate recommendations based on data
      const recommendations = [];
      const priorityActions = [];

      // Performance recommendations
      if (analytics.averageDuration > 1800) { // 30 minutes
        recommendations.push({
          type: 'performance',
          priority: 'medium',
          title: 'Optimize workflow performance',
          description: `Average duration of ${Math.round(analytics.averageDuration / 60)} minutes is above optimal`,
          actions: [
            'Enable workflow caching for dependencies',
            'Use matrix builds for parallel processing',
            'Optimize chunking strategy for large repositories'
          ]
        });
      }

      // Reliability recommendations
      if (analytics.successRate < 90) {
        priorityActions.push({
          type: 'reliability',
          priority: 'high',
          title: 'Improve workflow reliability',
          description: `Success rate of ${analytics.successRate}% needs improvement`,
          actions: [
            'Review and fix common failure patterns',
            'Add retry logic for transient failures',
            'Improve error handling and logging'
          ]
        });
      }

      // Frequency recommendations
      if (analytics.totalRuns > 100) {
        recommendations.push({
          type: 'efficiency',
          priority: 'low',
          title: 'Optimize workflow triggers',
          description: 'High workflow frequency detected',
          actions: [
            'Consider path-based workflow triggers',
            'Implement smart change detection',
            'Use scheduled processing for non-critical updates'
          ]
        });
      }

      // Health-based recommendations
      if (!health.healthy) {
        priorityActions.push({
          type: 'health',
          priority: 'critical',
          title: 'Address workflow health issues',
          description: 'Workflow health check failed',
          actions: health.recommendations
        });
      }

      res.json({
        success: true,
        repository: `${owner}/${repo}`,
        summary: {
          totalRecommendations: recommendations.length + priorityActions.length,
          criticalIssues: priorityActions.filter(a => a.priority === 'critical').length,
          highPriority: priorityActions.filter(a => a.priority === 'high').length,
          healthStatus: health.healthy ? 'healthy' : 'needs_attention'
        },
        priorityActions,
        recommendations,
        basedOn: {
          analyticsFromDays: 30,
          totalRuns: analytics.totalRuns,
          successRate: analytics.successRate,
          avgDuration: analytics.averageDuration
        },
        generatedAt: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('Failed to generate workflow recommendations', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
