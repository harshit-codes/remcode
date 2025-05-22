import { getLogger } from '../utils/logger';
import { GitHubActions, WorkflowRun } from '../github/actions';

const logger = getLogger('WorkflowMonitor');

export interface WorkflowStatus {
  isRunning: boolean;
  lastRun?: WorkflowRun;
  status: 'success' | 'failure' | 'in_progress' | 'pending' | 'unknown';
  message: string;
}

export class WorkflowMonitor {
  private githubActions: GitHubActions;

  constructor(githubActions: GitHubActions) {
    this.githubActions = githubActions;
  }

  async getWorkflowStatus(owner: string, repo: string, workflowId: string): Promise<WorkflowStatus> {
    logger.info(`Checking workflow status for ${owner}/${repo}/${workflowId}`);
    
    try {
      const runs = await this.githubActions.getWorkflowRuns(owner, repo, workflowId);
      const lastRun = runs[0]; // Most recent run
      
      if (!lastRun) {
        return {
          isRunning: false,
          status: 'pending',
          message: 'No workflow runs found'
        };
      }

      return {
        isRunning: lastRun.status === 'in_progress',
        lastRun,
        status: this.mapWorkflowStatus(lastRun.status, lastRun.conclusion),
        message: `Last run: ${lastRun.conclusion || lastRun.status}`
      };
    } catch (error) {
      logger.error(`Failed to get workflow status: ${error}`);
      return {
        isRunning: false,
        status: 'unknown',
        message: 'Failed to check workflow status'
      };
    }
  }

  private mapWorkflowStatus(status: string, conclusion: string): WorkflowStatus['status'] {
    if (status === 'in_progress') return 'in_progress';
    if (conclusion === 'success') return 'success';
    if (conclusion === 'failure') return 'failure';
    return 'unknown';
  }
}
