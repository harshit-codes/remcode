# monitor.ts

**File Path:** `workflows/monitor.ts`

## Overview

Workflow run status type

## Dependencies

- `../utils/logger`
- `../github/actions`
- `../github/client`

## Classes

### `WorkflowMonitor`

**Class Definition:**

```typescript
export class WorkflowMonitor {
  private githubActions: GitHubActions;
  private defaultOptions: MonitoringOptions;

  /**
   * Constructor
   * @param githubToken Optional GitHub token
   * @param options Default monitoring options
   */
  constructor(githubToken?: string, options: Partial<MonitoringOptions> = {}) {
    // Create GitHubClient with proper options object
    const client = new GitHubClient({
      token: githubToken || process.env.GITHUB_TOKEN || ''
    });
    this.githubActions = new GitHubActions(client);
    this.defaultOptions = { ...DEFAULT_MONITORING_OPTIONS, ...options };
  }

  /**
   * Get the current status of a workflow
   * @param owner Repository owner
   * @param repo Repository name
   * @param workflowId Workflow ID or name
   * @returns Workflow status response
   */
  async getWorkflowStatus(
    owner: string, 
    repo: string, 
    workflowId: number | string
  ): Promise<WorkflowStatusResponse> {
    try {
      logger.info(`Checking status of workflow ${workflowId} in ${owner}/${repo}`);
      
      // If workflowId is a string, try to get the workflow ID by name
      let workflowIdStr: string;
      
      if (typeof workflowId === 'string') {
        workflowIdStr = workflowId;
      } else {
        // Convert numeric ID to string as required by the API
        workflowIdStr = workflowId.toString();
      }
      
      // Get workflow runs
      let runs;
      try {
        runs = await this.githubActions.getWorkflowRuns(owner, repo, workflowIdStr);
      } catch (error) {
        logger.error(`Error getting workflow runs: ${error instanceof Error ? error.message : String(error)}`);
        return { 
          status: 'error', 
          message: `Failed to get workflow runs: ${error instanceof Error ? error.message : String(error)}` 
        };
      }
      
      if (runs && runs.length > 0) {
        const latestRun = runs[0];
        
        // Get additional job details if available
        let jobSummary: { [key: string]: string } | undefined;
        let steps: Array<{ name: string; status: string; conclusion?: string }> | undefined;
        
        try {
          // Keep ID as number as required by API
          const jobs = await this.githubActions.getWorkflowJobs(owner, repo, latestRun.id);
          
          if (jobs && jobs.length > 0) {
            jobSummary = {};
            steps = [];
            
            jobs.forEach((job: WorkflowJob) => {
              jobSummary![job.name] = job.conclusion || job.status;
              
              if (job.steps) {
                job.steps.forEach((step: WorkflowStep) => {
                  steps!.push({
                    name: step.name,
                    status: step.status,
                    conclusion: step.conclusion || undefined
                  });
                });
              }
            });
          }
        } catch (error) {
          logger.debug(`Could not get detailed job info: ${error instanceof Error ? error.message : String(error)}`);
          // Non-critical error, continue without job details
        }
        
        const response: WorkflowStatusResponse = {
          status: latestRun.status as WorkflowRunStatus,
          conclusion: latestRun.conclusion as WorkflowRunConclusion,
          createdAt: latestRun.created_at,
          updatedAt: latestRun.updated_at,
          runId: latestRun.id,
          url: latestRun.html_url
        };
        
        if (jobSummary) response.jobSummary = jobSummary;
        if (steps) response.steps = steps;
        
        return response;
      } else {
        logger.warn(`No workflow runs found for workflow ${workflowId}`);
        return { 
          status: 'unknown', 
          message: 'No workflow runs found' 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error checking workflow status: ${errorMessage}`);
      return { 
        status: 'error', 
        message: `Failed to check status: ${errorMessage}` 
      };
    }
  }

  /**
   * Monitor a workflow until completion or timeout
   * @param owner Repository owner
   * @param repo Repository name
   * @param workflowId Workflow ID or name
   * @param options Monitoring options
   * @returns Final workflow status
   */
  async monitorWorkflowCompletion(
    owner: string, 
    repo: string, 
    workflowId: number | string, 
    options: Partial<MonitoringOptions> = {}
  ): Promise<WorkflowStatusResponse> {
    const monitorOptions = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let status: WorkflowStatusResponse = { status: 'unknown' };
    let lastStatusUpdate = '';
    let checkCount = 0;

    logger.info(`Started monitoring workflow ${workflowId} in ${owner}/${repo}`);

    while (Date.now() - startTime < monitorOptions.timeoutMs!) {
      checkCount++;
      status = await this.getWorkflowStatus(owner, repo, workflowId);

      // Only log if status changed
      const statusUpdate = `${status.status}${status.conclusion ? `/${status.conclusion}` : ''}`;
      if (statusUpdate !== lastStatusUpdate) {
        logger.info(`Workflow ${workflowId} status: ${statusUpdate}`);
        lastStatusUpdate = statusUpdate;
      }

      // Terminal states
      if (status.status === 'completed') {
        logger.info(`Workflow ${workflowId} completed with conclusion: ${status.conclusion}`);
        
        // Log to file if requested
        if (monitorOptions.logToFile) {
          await this.logStatusToFile(owner, repo, workflowId, status, monitorOptions.logDirectory!);
        }
        
        return status;
      }

      if (status.status === 'error') {
        logger.error(`Error monitoring workflow: ${status.message}`);
        
        // Log to file if requested
        if (monitorOptions.logToFile && monitorOptions.logErrors) {
          await this.logStatusToFile(owner, repo, workflowId, status, monitorOptions.logDirectory!);
        }
        
        return status;
      }

      // Non-terminal states, continue polling
      if (checkCount % 5 === 0) { // Log every 5 checks to avoid spam
        logger.debug(`Workflow ${workflowId} status: ${status.status}, check #${checkCount}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, monitorOptions.pollIntervalMs!));
    }

    const timeoutMessage = `Monitoring workflow ${workflowId} timed out after ${monitorOptions.timeoutMs}ms`;
    logger.warn(timeoutMessage);
    
    const timeoutStatus = { 
      ...status, 
      timedOut: true, 
      message: 'Monitoring timed out' 
    };
    
    // Log to file if requested
    if (monitorOptions.logToFile && monitorOptions.logErrors) {
      await this.logStatusToFile(owner, repo, workflowId, timeoutStatus, monitorOptions.logDirectory!);
    }
    
    return timeoutStatus;
  }

  /**
   * Get logs for a workflow run
   * @param owner Repository owner
   * @param repo Repository name
   * @param runId Run ID
   * @returns Workflow run logs or null if error
   */
  async getWorkflowRunLogs(
    owner: string, 
    repo: string, 
    runId: number
  ): Promise<Buffer | null> {
    try {
      logger.info(`Fetching logs for workflow run ${runId} in ${owner}/${repo}`);
      // Keep ID as number as required by API
      const logs = await this.githubActions.downloadWorkflowLogs(owner, repo, runId);
      return logs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error fetching workflow run logs: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Find workflow by name
   * @param owner Repository owner
   * @param repo Repository name
   * @param workflowName Workflow name or filename
   * @returns Workflow ID or null if not found
   */
  async findWorkflowByName(
    owner: string, 
    repo: string, 
    workflowName: string
  ): Promise<number | null> {
    try {
      logger.info(`Finding workflow ID for ${workflowName} in ${owner}/${repo}`);
      
      const workflows = await this.githubActions.listWorkflows(owner, repo);
      
      // Match by name (case insensitive) or filename
      const workflow = workflows.find(w => 
        w.name.toLowerCase() === workflowName.toLowerCase() || 
        w.path.endsWith(`/${workflowName}.yml`) || 
        w.path.endsWith(`/${workflowName}.yaml`)
      );
      
      if (workflow) {
        logger.info(`Found workflow ID ${workflow.id} for ${workflowName}`);
        return workflow.id;
      } else {
        logger.warn(`No workflow found with name: ${workflowName}`);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error finding workflow by name: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Trigger a workflow
   * @param owner Repository owner
   * @param repo Repository name
   * @param workflowId Workflow ID or name
   * @param ref Branch or tag to run workflow on
   * @param inputs Workflow inputs
   * @returns Workflow run ID or null if error
   */
  async triggerWorkflow(
    owner: string, 
    repo: string, 
    workflowId: number | string, 
    ref: string = 'main',
    inputs: Record<string, string> = {}
  ): Promise<number | null> {
    try {
      // If workflowId is a string name (not a file path), try to get the workflow ID
      let workflowIdStr: string;
      
      if (typeof workflowId === 'string') {
        // Check if it's a filename path or just a name
        if (!workflowId.includes('.yml') && !workflowId.includes('.yaml')) {
          const foundId = await this.findWorkflowByName(owner, repo, workflowId);
          
          if (!foundId) {
            logger.error(`Cannot trigger workflow, no workflow found with name: ${workflowId}`);
            return null;
          }
          
          workflowIdStr = foundId.toString();
        } else {
          workflowIdStr = workflowId;
        }
      } else {
        workflowIdStr = workflowId.toString();
      }
      
      logger.info(`Triggering workflow ${workflowIdStr} in ${owner}/${repo} on ref: ${ref}`);
      
      // GitHubActions.triggerWorkflow doesn't return a runId, so we need to check for recently created runs
      const beforeRuns = await this.githubActions.getWorkflowRuns(owner, repo, workflowIdStr);
      
      // Trigger the workflow
      await this.githubActions.triggerWorkflow(owner, repo, workflowIdStr, ref, inputs);
      
      // Wait a moment for the run to be created
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for new runs
      const afterRuns = await this.githubActions.getWorkflowRuns(owner, repo, workflowIdStr);
      
      if (afterRuns.length > beforeRuns.length) {
        // Find the new run (should be the first one)
        const newRun = afterRuns[0];
        logger.info(`Triggered workflow run ${newRun.id}`);
        return newRun.id;
      } else {
        logger.warn(`Workflow was triggered, but couldn't find the new run ID`);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error triggering workflow: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Check if any workflow in a repository has succeeded within a time period
   * @param owner Repository owner
   * @param repo Repository name
   * @param workflowNamePattern Optional pattern to match workflow names
   * @param timeWindowMs Time window in milliseconds to check (default: 24 hours)
   * @returns Boolean indicating if any successful workflow was found
   */
  async hasSuccessfulWorkflow(
    owner: string, 
    repo: string, 
    workflowNamePattern?: RegExp, 
    timeWindowMs: number = 86400000 // 24 hours
  ): Promise<boolean> {
    try {
      logger.info(`Checking for successful workflows in ${owner}/${repo}`);
      
      const workflows = await this.githubActions.listWorkflows(owner, repo);
      const cutoffDate = new Date(Date.now() - timeWindowMs);
      
      // Filter workflows by name pattern if provided
      const filteredWorkflows = workflowNamePattern 
        ? workflows.filter(w => workflowNamePattern.test(w.name))
        : workflows;
      
      // Check each workflow for successful runs
      for (const workflow of filteredWorkflows) {
        const runs = await this.githubActions.getWorkflowRuns(owner, repo, workflow.id.toString());
        
        // Look for successful runs within the time window
        const recentSuccessfulRun = runs.find(run => {
          const runDate = new Date(run.created_at);
          return (
            run.conclusion === 'success' && 
            runDate > cutoffDate
          );
        });
        
        if (recentSuccessfulRun) {
          logger.info(`Found successful workflow: ${workflow.name}, run: ${recentSuccessfulRun.id}`);
          return true;
        }
      }
      
      logger.info(`No successful workflows found in ${owner}/${repo} within the time window`);
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error checking for successful workflows: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get all runs for a specific workflow with detailed information
   * @param owner Repository owner
   * @param repo Repository name
   * @param workflowId Workflow ID or name
   * @param limit Maximum number of runs to return
   * @returns Array of workflow run details
   */
  async getWorkflowRunsDetailed(
    owner: string, 
    repo: string, 
    workflowId: number | string, 
    limit: number = 10
  ): Promise<Array<WorkflowStatusResponse>> {
    try {
      // Convert workflowId to string as required by the API
      let workflowIdStr: string = typeof workflowId === 'string' 
        ? workflowId 
        : workflowId.toString();
      
      logger.info(`Getting detailed runs for workflow ${workflowIdStr} in ${owner}/${repo}`);
      
      const runs = await this.githubActions.getWorkflowRuns(owner, repo, workflowIdStr);
      const limitedRuns = runs.slice(0, limit);
      
      const detailedRuns: Array<WorkflowStatusResponse> = [];
      
      for (const run of limitedRuns) {
        let jobSummary: { [key: string]: string } | undefined;
        let steps: Array<{ name: string; status: string; conclusion?: string }> | undefined;
        
        try {
          // Keep ID as number as required by API
          const jobs = await this.githubActions.getWorkflowJobs(owner, repo, run.id);
          
          if (jobs && jobs.length > 0) {
            jobSummary = {};
            steps = [];
            
            jobs.forEach((job: WorkflowJob) => {
              jobSummary![job.name] = job.conclusion || job.status;
              
              if (job.steps) {
                job.steps.forEach((step: WorkflowStep) => {
                  steps!.push({
                    name: step.name,
                    status: step.status,
                    conclusion: step.conclusion || undefined
                  });
                });
              }
            });
          }
        } catch (error) {
          logger.debug(`Could not get detailed job info for run ${run.id}: ${error instanceof Error ? error.message : String(error)}`);
          // Non-critical error, continue without job details
        }
        
        const detailedRun: WorkflowStatusResponse = {
          status: run.status as WorkflowRunStatus,
          conclusion: run.conclusion as WorkflowRunConclusion,
          createdAt: run.created_at,
          updatedAt: run.updated_at,
          runId: run.id,
          url: run.html_url
        };
        
        if (jobSummary) detailedRun.jobSummary = jobSummary;
        if (steps) detailedRun.steps = steps;
        
        detailedRuns.push(detailedRun);
      }
      
      return detailedRuns;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error getting detailed workflow runs: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Log workflow status to a file
   * @param owner Repository owner
   * @param repo Repository name
   * @param workflowId Workflow ID or name
   * @param status Workflow status
   * @param logDir Directory to store logs
   */
  private async logStatusToFile(
    owner: string, 
    repo: string, 
    workflowId: number | string,
    status: WorkflowStatusResponse,
    logDir: string
  ): Promise<void> {
    try {
      // Create log directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const workflowIdStr = typeof workflowId === 'string' ? workflowId : `id-${workflowId}`;
      const logFileName = `workflow-${owner}-${repo}-${workflowIdStr}-${timestamp}.json`;
      const logFilePath = path.join(logDir, logFileName);
      
      const logData = {
        timestamp: new Date().toISOString(),
        owner,
        repo,
        workflowId,
        ...status
      };
      
      fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2), 'utf8');
      logger.debug(`Logged workflow status to ${logFilePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error logging workflow status to file: ${errorMessage}`);
      // Non-critical error, continue without logging to file
    }
  }
}
```

**Methods:**

#### `getWorkflowStatus()`

Get the current status of a workflow
@param owner Repository owner
@param repo Repository name
@param workflowId Workflow ID or name
@returns Workflow status response

```typescript
getWorkflowStatus(
```

#### `monitorWorkflowCompletion()`

Monitor a workflow until completion or timeout
@param owner Repository owner
@param repo Repository name
@param workflowId Workflow ID or name
@param options Monitoring options
@returns Final workflow status

```typescript
monitorWorkflowCompletion(
```

#### `getWorkflowRunLogs()`

Get logs for a workflow run
@param owner Repository owner
@param repo Repository name
@param runId Run ID
@returns Workflow run logs or null if error

```typescript
getWorkflowRunLogs(
```

#### `findWorkflowByName()`

Find workflow by name
@param owner Repository owner
@param repo Repository name
@param workflowName Workflow name or filename
@returns Workflow ID or null if not found

```typescript
findWorkflowByName(
```

#### `triggerWorkflow()`

Trigger a workflow
@param owner Repository owner
@param repo Repository name
@param workflowId Workflow ID or name
@param ref Branch or tag to run workflow on
@param inputs Workflow inputs
@returns Workflow run ID or null if error

```typescript
triggerWorkflow(
```

#### `hasSuccessfulWorkflow()`

Check if any workflow in a repository has succeeded within a time period
@param owner Repository owner
@param repo Repository name
@param workflowNamePattern Optional pattern to match workflow names
@param timeWindowMs Time window in milliseconds to check (default: 24 hours)
@returns Boolean indicating if any successful workflow was found

```typescript
hasSuccessfulWorkflow(
```

#### `getWorkflowRunsDetailed()`

Get all runs for a specific workflow with detailed information
@param owner Repository owner
@param repo Repository name
@param workflowId Workflow ID or name
@param limit Maximum number of runs to return
@returns Array of workflow run details

```typescript
getWorkflowRunsDetailed(
```

## Interfaces

### `WorkflowStatusResponse`

**Interface Definition:**

```typescript
export interface WorkflowStatusResponse {
  status: WorkflowRunStatus;
  conclusion?: WorkflowRunConclusion;
  createdAt?: string;
  updatedAt?: string;
  runId?: number;
  url?: string;
  message?: string;
  timedOut?: boolean;
  jobSummary?: { [key: string]: string };
  steps?: Array<{ name: string; status: string; conclusion?: string }>;
}
```

### `MonitoringOptions`

**Interface Definition:**

```typescript
export interface MonitoringOptions {
  timeoutMs?: number;
  pollIntervalMs?: number;
  detailed?: boolean;
  logErrors?: boolean;
  logToFile?: boolean;
  logDirectory?: string;
}
```

