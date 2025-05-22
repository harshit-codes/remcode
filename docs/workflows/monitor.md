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

**Methods:**

- `GitHubClient()`
- `GitHubActions()`
- `getWorkflowStatus()`
- `if()`
- `catch()`
- `String()`
- `String()`
- `if()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `monitorWorkflowCompletion()`
- `while()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `Promise()`
- `if()`
- `getWorkflowRunLogs()`
- `catch()`
- `String()`
- `findWorkflowByName()`
- `name()`
- `if()`
- `catch()`
- `String()`
- `triggerWorkflow()`
- `name()`
- `if()`
- `if()`
- `if()`
- `Promise()`
- `if()`
- `run()`
- `catch()`
- `String()`
- `check()`
- `hasSuccessfulWorkflow()`
- `Date()`
- `for()`
- `Date()`
- `return()`
- `if()`
- `catch()`
- `String()`
- `getWorkflowRunsDetailed()`
- `for()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `logStatusToFile()`
- `if()`
- `Date()`
- `Date()`
- `catch()`
- `String()`

## Interfaces

### `WorkflowStatusResponse`

**Properties:**

- `status: WorkflowRunStatus;`
- `conclusion?: WorkflowRunConclusion;`
- `createdAt?: string;`
- `updatedAt?: string;`
- `runId?: number;`
- `url?: string;`
- `message?: string;`
- `timedOut?: boolean;`
- `jobSummary?: { [key: string]: string };`
- `steps?: Array<{ name: string; status: string; conclusion?: string }>;`

### `MonitoringOptions`

**Properties:**

- `timeoutMs?: number;`
- `pollIntervalMs?: number;`
- `detailed?: boolean;`
- `logErrors?: boolean;`
- `logToFile?: boolean;`
- `logDirectory?: string;`

