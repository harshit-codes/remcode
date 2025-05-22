import { getLogger } from '../utils/logger';
import { GitHubClient } from './client';

const logger = getLogger('GitHubActions');

export interface WorkflowRun {
  id: number;
  name?: string;
  workflow_id?: number;
  head_branch?: string;
  head_sha?: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  html_url?: string;
  jobs_url?: string;
  logs_url?: string;
  run_number?: number;
  run_attempt?: number;
  display_title?: string;
}

export interface Workflow {
  id: number;
  name: string;
  path: string;
  state: string;
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  badge_url: string;
}

export interface WorkflowJob {
  id: number;
  run_id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  steps?: WorkflowStep[];
}

export interface WorkflowStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
  started_at?: string;
  completed_at?: string;
}

export class GitHubActions {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  /**
   * List workflows in a repository
   */
  async listWorkflows(owner: string, repo: string): Promise<Workflow[]> {
    logger.info(`Listing workflows for ${owner}/${repo}`);
    const response = await this.client.makeRequest(`/repos/${owner}/${repo}/actions/workflows`);
    return response.workflows || [];
  }

  /**
   * Get workflow by ID or filename
   */
  async getWorkflow(owner: string, repo: string, workflowIdOrFilename: string): Promise<Workflow> {
    // Handle both numeric IDs and filename paths
    const isNumeric = /^\d+$/.test(workflowIdOrFilename);
    const endpoint = `/repos/${owner}/${repo}/actions/workflows/${workflowIdOrFilename}`;
    
    logger.info(`Getting workflow ${workflowIdOrFilename} for ${owner}/${repo}`);
    return this.client.makeRequest(endpoint);
  }
  
  /**
   * List workflow runs for a specific workflow or all workflows in a repo
   */
  async getWorkflowRuns(owner: string, repo: string, workflowId?: string, options: { 
    branch?: string, 
    status?: 'completed' | 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'skipped' | 'stale' | 'success' | 'timed_out' | 'in_progress' | 'queued' | 'requested' | 'waiting'
  } = {}): Promise<WorkflowRun[]> {
    let endpoint = workflowId 
      ? `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs` 
      : `/repos/${owner}/${repo}/actions/runs`;
    
    // Add query parameters for branch and status filtering
    const queryParams: string[] = [];
    if (options.branch) {
      queryParams.push(`branch=${options.branch}`);
    }
    if (options.status) {
      queryParams.push(`status=${options.status}`);
    }
    
    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }
    
    logger.info(`Getting workflow runs for ${owner}/${repo}${workflowId ? `/${workflowId}` : ''}`);
    const response = await this.client.makeRequest(endpoint);
    return response.workflow_runs || [];
  }

  /**
   * Trigger a workflow dispatch event
   */
  async triggerWorkflow(owner: string, repo: string, workflowId: string, ref: string = 'main', inputs?: Record<string, any>): Promise<void> {
    logger.info(`Triggering workflow: ${workflowId} on ref ${ref}`);
    await this.client.createWorkflowDispatch(owner, repo, workflowId, ref, inputs);
    logger.info(`Successfully triggered workflow ${workflowId}`);
  }

  /**
   * Get the status of a specific workflow run
   */
  async getWorkflowStatus(owner: string, repo: string, runId: number): Promise<WorkflowRun | null> {
    try {
      logger.info(`Getting workflow run status: ${runId}`);
      const workflowRun = await this.client.makeRequest(`/repos/${owner}/${repo}/actions/runs/${runId}`);
      return workflowRun;
    } catch (error) {
      logger.error(`Failed to get workflow run status: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Get jobs for a specific workflow run
   */
  async getWorkflowJobs(owner: string, repo: string, runId: number): Promise<WorkflowJob[]> {
    logger.info(`Getting jobs for workflow run: ${runId}`);
    const response = await this.client.makeRequest(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`);
    return response.jobs || [];
  }

  /**
   * Download workflow run logs
   */
  async downloadWorkflowLogs(owner: string, repo: string, runId: number): Promise<Buffer> {
    logger.info(`Downloading logs for workflow run: ${runId}`);
    const response = await this.client.makeRequest(
      `/repos/${owner}/${repo}/actions/runs/${runId}/logs`,
      'GET',
      undefined,
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(response);
  }

  /**
   * Cancel a workflow run
   */
  async cancelWorkflowRun(owner: string, repo: string, runId: number): Promise<void> {
    logger.info(`Cancelling workflow run: ${runId}`);
    await this.client.makeRequest(`/repos/${owner}/${repo}/actions/runs/${runId}/cancel`, 'POST');
    logger.info(`Successfully cancelled workflow run ${runId}`);
  }

  /**
   * Re-run a workflow
   */
  async rerunWorkflow(owner: string, repo: string, runId: number, onlyFailedJobs: boolean = false): Promise<void> {
    const endpoint = onlyFailedJobs
      ? `/repos/${owner}/${repo}/actions/runs/${runId}/rerun-failed-jobs`
      : `/repos/${owner}/${repo}/actions/runs/${runId}/rerun`;
    
    logger.info(`Re-running workflow run: ${runId}${onlyFailedJobs ? ' (failed jobs only)' : ''}`);
    await this.client.makeRequest(endpoint, 'POST');
    logger.info(`Successfully re-ran workflow run ${runId}`);
  }

  /**
   * Wait for a workflow run to complete, with polling and timeout
   */
  async waitForWorkflowCompletion(owner: string, repo: string, runId: number, timeoutMs: number = 300000, pollIntervalMs: number = 5000): Promise<WorkflowRun> {
    logger.info(`Waiting for workflow completion: ${runId} (timeout: ${timeoutMs}ms, polling: ${pollIntervalMs}ms)`);
    
    const startTime = Date.now();
    let lastStatus = '';
    
    while (true) {
      // Check if we've timed out
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`Workflow run ${runId} did not complete within the timeout period (${timeoutMs}ms)`);
      }
      
      // Get the current status
      const run = await this.getWorkflowStatus(owner, repo, runId);
      
      if (!run) {
        throw new Error(`Workflow run ${runId} not found`);
      }
      
      // Log status changes
      if (run.status !== lastStatus) {
        logger.info(`Workflow run ${runId} status: ${run.status}${run.conclusion ? ` (${run.conclusion})` : ''}`);
        lastStatus = run.status;
      }
      
      // Check if the workflow has completed
      if (run.status === 'completed') {
        return run;
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }
}
