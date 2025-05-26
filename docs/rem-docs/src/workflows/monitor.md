# monitor.ts

**File Path:** `src/workflows/monitor.ts`

## Overview

Workflow run status type

Workflow run conclusion type

Workflow status response interface

Workflow monitoring options

Default monitoring options

Class for monitoring GitHub Actions workflows

Constructor
@param githubToken Optional GitHub token
@param options Default monitoring options

Get the current status of a workflow
@param owner Repository owner
@param repo Repository name
@param workflowId Workflow ID or name
@returns Workflow status response

Monitor a workflow until completion or timeout
@param owner Repository owner
@param repo Repository name
@param workflowId Workflow ID or name
@param options Monitoring options
@returns Final workflow status

Get logs for a workflow run
@param owner Repository owner
@param repo Repository name
@param runId Run ID
@returns Workflow run logs or null if error

Find workflow by name
@param owner Repository owner
@param repo Repository name
@param workflowName Workflow name or filename
@returns Workflow ID or null if not found

Trigger a workflow
@param owner Repository owner
@param repo Repository name
@param workflowId Workflow ID or name
@param ref Branch or tag to run workflow on
@param inputs Workflow inputs
@returns Workflow run ID or null if error

Check if any workflow in a repository has succeeded within a time period
@param owner Repository owner
@param repo Repository name
@param workflowNamePattern Optional pattern to match workflow names
@param timeWindowMs Time window in milliseconds to check (default: 24 hours)
@returns Boolean indicating if any successful workflow was found

Get all runs for a specific workflow with detailed information
@param owner Repository owner
@param repo Repository name
@param workflowId Workflow ID or name
@param limit Maximum number of runs to return
@returns Array of workflow run details

Log workflow status to a file
@param owner Repository owner
@param repo Repository name
@param workflowId Workflow ID or name
@param status Workflow status
@param logDir Directory to store logs

Cancel a workflow run
@param owner Repository owner
@param repo Repository name 
@param runId Workflow run ID
@returns Promise that resolves when cancellation is complete

Retry a failed workflow run
@param owner Repository owner
@param repo Repository name
@param runId Workflow run ID
@param onlyFailedJobs Whether to retry only failed jobs
@returns Promise that resolves when retry is triggered

Get comprehensive workflow analytics
@param owner Repository owner
@param repo Repository name
@param days Number of days to analyze
@returns Promise with workflow analytics

Monitor workflow health and send alerts if needed
@param owner Repository owner
@param repo Repository name
@param options Monitoring options
@returns Promise with health status

## Dependencies

- `../utils/logger`
- `../github/actions`
- `../github/client`

## Classes

### `WorkflowMonitor`

```typescript
class WorkflowMonitor {
// ... implementation
}
```

## Interfaces

### `WorkflowStatusResponse`

```typescript
interface WorkflowStatusResponse {
// ... properties
}
```

### `MonitoringOptions`

```typescript
interface MonitoringOptions {
// ... properties
}
```

## Variables

- `logger`
- `DEFAULT_MONITORING_OPTIONS`
- `client`
- `workflowIdStr`
- `runs`
- `latestRun`
- `jobSummary`
- `steps`
- `jobs`
- `response`
- `errorMessage`
- `monitorOptions`
- `startTime`
- `status`
- `lastStatusUpdate`
- `checkCount`
- `statusUpdate`
- `timeoutMessage`
- `timeoutStatus`
- `logs`
- `errorMessage`
- `workflows`
- `workflow`
- `errorMessage`
- `workflowIdStr`
- `foundId`
- `beforeRuns`
- `afterRuns`
- `newRun`
- `errorMessage`
- `workflows`
- `cutoffDate`
- `filteredWorkflows`
- `workflow`
- `runs`
- `recentSuccessfulRun`
- `runDate`
- `errorMessage`
- `workflowIdStr`
- `runs`
- `limitedRuns`
- `detailedRuns`
- `run`
- `jobSummary`
- `steps`
- `jobs`
- `detailedRun`
- `errorMessage`
- `timestamp`
- `workflowIdStr`
- `logFileName`
- `logFilePath`
- `logData`
- `errorMessage`
- `runs`
- `cutoffDate`
- `recentRuns`
- `totalRuns`
- `successfulRuns`
- `successRate`
- `durations`
- `averageDuration`
- `failureReasons`
- `reason`
- `dailyData`
- `date`
- `existing`
- `dailyRuns`
- `performanceData`
- `date`
- `duration`
- `existing`
- `performanceOverTime`
- `recentRuns`
- `issues`
- `recommendations`
- `failedRuns`
- `failureRate`
- `consecutiveFailures`
- `run`
- `slowRuns`
- `duration`
- `lastRuns`
- `healthy`

