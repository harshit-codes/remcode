# processing.ts

**File Path:** `mcp/handlers/processing.ts`

## Overview

Trigger repository reprocessing

## Dependencies

- `express`
- `../../utils/logger`
- `../../processing/state-manager`
- `../../workflows/monitor`
- `../../workflows/generator`
- `../../workflows/templates`

## Classes

### `ProcessingMCPHandler`

**Class Definition:**

```typescript
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
    const { type = 'incremental', force = false, owner, repo, branch = 'main' } = options;

    try {
      logger.info(`Triggering ${type} reprocessing (force: ${force})`);
      
      if (!owner || !repo) {
        res.status(400).json({ error: 'Owner and repo are required for processing' });
        return;
      }
      
      // Update processing status - use 'analyzing' as the initial processing state
      await this.stateManager.updateProcessingStatus('analyzing');
      
      // Generate appropriate workflow based on processing type
      let workflowResult;
      
      if (type === 'full') {
        workflowResult = await this.workflowGenerator.generateAdvancedWorkflow(
          `${owner}/${repo}`,
          {
            parameters: {
              forceFullReprocess: force
            }
          }
        );
      } else if (type === 'vectorize') {
        workflowResult = await this.workflowGenerator.generateCustomWorkflow(
          'remcode-vectorize',
          WorkflowType.REMCODE_ADVANCED,
          {
            repoName: `${owner}/${repo}`,
            parameters: {
              skipAnalysis: true,
              forceFullReprocess: force
            }
          }
        );
      } else {
        // Default incremental workflow
        workflowResult = await this.workflowGenerator.generateRemcodeWorkflow(
          `${owner}/${repo}`
        );
      }
      
      if (!workflowResult.success) {
        throw new Error(`Failed to generate workflow: ${workflowResult.error}`);
      }
      
      // Trigger workflow if available
      let runId: number | null = null;
      try {
        runId = await this.workflowMonitor.triggerWorkflow(
          owner, 
          repo, 
          'remcode.yml', // Default workflow name
          branch,
          { force: force.toString() }
        );
      } catch (triggerError) {
        logger.error(`Error triggering workflow: ${triggerError instanceof Error ? triggerError.message : String(triggerError)}`);
      }
      
      res.status(200).json({
        message: `${type} reprocessing triggered`,
        status: 'processing',
        workflowGenerated: workflowResult.success,
        workflowTriggered: !!runId,
        runId: runId
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Reprocessing failed: ${errorMessage}`);
      await this.stateManager.updateProcessingStatus('failed');
      res.status(500).json({ error: errorMessage });
    }
  }

  /**
   * Get current processing status
   */
  async handleGetProcessingStatus(req: Request, res: Response, params?: any): Promise<void> {
    const { owner, repo, runId } = params || req.body || {};
    
    try {
      // Get state from state manager
      const state = await this.stateManager.loadState();
      const baseStatus = {
        status: state?.processing?.status || 'idle',
        lastUpdated: state?.processing?.lastUpdated || null,
        stats: state?.processing?.stats || {}
      };
      
      // If workflow runId, owner and repo are provided, get workflow status
      if (runId && owner && repo) {
        try {
          const workflowStatus = await this.workflowMonitor.getWorkflowStatus(owner, repo, parseInt(runId));
          
          res.status(200).json({
            ...baseStatus,
            workflow: {
              runId,
              status: workflowStatus.status,
              conclusion: workflowStatus.conclusion,
              url: workflowStatus.url,
              details: workflowStatus.jobSummary || {},
              steps: workflowStatus.steps || []
            }
          });
        } catch (workflowError) {
          logger.warn(`Failed to get workflow status: ${workflowError instanceof Error ? workflowError.message : String(workflowError)}`);
          // Continue to return base status
        }
      }
      
      res.status(200).json(baseStatus);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to get processing status: ${errorMessage}`);
      res.status(500).json({ error: 'Failed to get processing status' });
    }
  }
  
  /**
   * Get workflow processing history
   */
  async handleGetProcessingHistory(req: Request, res: Response, params?: any): Promise<void> {
    const { owner, repo, limit = 5 } = params || req.body || {};
    
    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }
    
    try {
      // Look for recent workflow runs
      const workflowPattern = /remcode/i; // Match any remcode workflow
      const hasSuccessful = await this.workflowMonitor.hasSuccessfulWorkflow(
        owner, repo, workflowPattern, 604800000 // 7 days
      );
      
      // Get detailed runs for remcode workflows
      const remcodeRuns = await this.workflowMonitor.getWorkflowRunsDetailed(
        owner, repo, 'remcode', typeof limit === 'string' ? parseInt(limit) : limit
      );
      
      res.status(200).json({
        hasSuccessfulRun: hasSuccessful,
        recentRuns: remcodeRuns.map(run => ({
          runId: run.runId,
          status: run.status,
          conclusion: run.conclusion,
          createdAt: run.createdAt,
          url: run.url
        }))
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to get processing history: ${errorMessage}`);
      res.status(500).json({ error: 'Failed to get processing history' });
    }
  }
}
```

**Methods:**

#### `handleTriggerReprocessing()`

Trigger repository reprocessing

```typescript
handleTriggerReprocessing(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGetProcessingStatus()`

Get current processing status

```typescript
handleGetProcessingStatus(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGetProcessingHistory()`

Get workflow processing history

```typescript
handleGetProcessingHistory(req: Request, res: Response, params?: any): Promise<void> {
```

## Interfaces

### `ProcessingOptions`

**Interface Definition:**

```typescript
export interface ProcessingOptions {
  type: 'full' | 'incremental' | 'vectorize' | 'analyze';
  force: boolean;
  repository?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  token?: string;
}
```

