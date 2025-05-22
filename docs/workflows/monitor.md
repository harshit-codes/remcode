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

Constructor

```typescript
class WorkflowMonitor {
// ... implementation
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

