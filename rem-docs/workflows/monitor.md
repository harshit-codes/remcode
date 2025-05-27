# monitor.ts

**File Path**: `workflows/monitor.ts`

## Description

Workflow run status type

## Classes

- `WorkflowMonitor`

## Interfaces

- `WorkflowStatusResponse`
- `MonitoringOptions`

## Documentation Comments

### Comment 1

Workflow run conclusion type

### Comment 2

Workflow status response interface

### Comment 3

Workflow monitoring options

### Comment 4

Default monitoring options

### Comment 5

Class for monitoring GitHub Actions workflows

### Comment 6

Constructor
 @param githubToken Optional GitHub token
 @param options Default monitoring options

### Comment 7

Get the current status of a workflow
 @param owner Repository owner
 @param repo Repository name
 @param workflowId Workflow ID or name
 @returns Workflow status response

### Comment 8

Monitor a workflow until completion or timeout
 @param owner Repository owner
 @param repo Repository name
 @param workflowId Workflow ID or name
 @param options Monitoring options
 @returns Final workflow status

### Comment 9

Get logs for a workflow run
 @param owner Repository owner
 @param repo Repository name
 @param runId Run ID
 @returns Workflow run logs or null if error

### Comment 10

Find workflow by name
 @param owner Repository owner
 @param repo Repository name
 @param workflowName Workflow name or filename
 @returns Workflow ID or null if not found

### Comment 11

Trigger a workflow
 @param owner Repository owner
 @param repo Repository name
 @param workflowId Workflow ID or name
 @param ref Branch or tag to run workflow on
 @param inputs Workflow inputs
 @returns Workflow run ID or null if error

### Comment 12

Check if any workflow in a repository has succeeded within a time period
 @param owner Repository owner
 @param repo Repository name
 @param workflowNamePattern Optional pattern to match workflow names
 @param timeWindowMs Time window in milliseconds to check (default: 24 hours)
 @returns Boolean indicating if any successful workflow was found

### Comment 13

Get all runs for a specific workflow with detailed information
 @param owner Repository owner
 @param repo Repository name
 @param workflowId Workflow ID or name
 @param limit Maximum number of runs to return
 @returns Array of workflow run details

### Comment 14

Log workflow status to a file
 @param owner Repository owner
 @param repo Repository name
 @param workflowId Workflow ID or name
 @param status Workflow status
 @param logDir Directory to store logs

### Comment 15

Cancel a workflow run
 @param owner Repository owner
 @param repo Repository name 
 @param runId Workflow run ID
 @returns Promise that resolves when cancellation is complete

### Comment 16

Retry a failed workflow run
 @param owner Repository owner
 @param repo Repository name
 @param runId Workflow run ID
 @param onlyFailedJobs Whether to retry only failed jobs
 @returns Promise that resolves when retry is triggered

### Comment 17

Get comprehensive workflow analytics
 @param owner Repository owner
 @param repo Repository name
 @param days Number of days to analyze
 @returns Promise with workflow analytics

### Comment 18

Monitor workflow health and send alerts if needed
 @param owner Repository owner
 @param repo Repository name
 @param options Monitoring options
 @returns Promise with health status

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { GitHubActions, WorkflowJob, WorkflowStep } from '../github/actions';
import * as path from 'path';
import * as fs from 'fs';
import { GitHubClient } from '../github/client';

// Key exports:
export class WorkflowMonitor { ... }
export interface WorkflowStatusResponse { ... }
export interface MonitoringOptions { ... }
```

## File Statistics

- **Lines of Code**: 835
- **File Size**: 28280 bytes
- **Last Modified**: 2025-05-23T18:23:00.361Z

