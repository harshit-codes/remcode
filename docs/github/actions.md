# actions.ts

**File Path:** `github/actions.ts`

## Overview

List workflows in a repository

## Dependencies

- `../utils/logger`
- `./client`

## Classes

### `GitHubActions`

List workflows in a repository

```typescript
class GitHubActions {
// ... implementation
}
```

**Methods:**

#### `listWorkflows()`

List workflows in a repository

```typescript
listWorkflows(owner: string, repo: string): Promise<Workflow[]> {
```

#### `getWorkflow()`

Get workflow by ID or filename

```typescript
getWorkflow(owner: string, repo: string, workflowIdOrFilename: string): Promise<Workflow> {
    // Handle both numeric IDs and filename paths
```

#### `getWorkflowRuns()`

List workflow runs for a specific workflow or all workflows in a repo

```typescript
getWorkflowRuns(owner: string, repo: string, workflowId?: string, options: {
```

#### `triggerWorkflow()`

Trigger a workflow dispatch event

```typescript
triggerWorkflow(owner: string, repo: string, workflowId: string, ref: string = 'main', inputs?: Record<string, any>): Promise<void> {
```

#### `getWorkflowStatus()`

Get the status of a specific workflow run

```typescript
getWorkflowStatus(owner: string, repo: string, runId: number): Promise<WorkflowRun | null> {
```

#### `getWorkflowJobs()`

Get jobs for a specific workflow run

```typescript
getWorkflowJobs(owner: string, repo: string, runId: number): Promise<WorkflowJob[]> {
```

#### `downloadWorkflowLogs()`

Download workflow run logs

```typescript
downloadWorkflowLogs(owner: string, repo: string, runId: number): Promise<Buffer> {
```

#### `cancelWorkflowRun()`

Cancel a workflow run

```typescript
cancelWorkflowRun(owner: string, repo: string, runId: number): Promise<void> {
```

#### `rerunWorkflow()`

Re-run a workflow

```typescript
rerunWorkflow(owner: string, repo: string, runId: number, onlyFailedJobs: boolean = false): Promise<void> {
```

#### `waitForWorkflowCompletion()`

Wait for a workflow run to complete, with polling and timeout

```typescript
waitForWorkflowCompletion(owner: string, repo: string, runId: number, timeoutMs: number = 300000, pollIntervalMs: number = 5000): Promise<WorkflowRun> {
```

## Interfaces

### `WorkflowRun`

```typescript
interface WorkflowRun {
// ... properties
}
```

### `Workflow`

```typescript
interface WorkflowRun {
// ... properties
}
```

### `WorkflowJob`

```typescript
interface WorkflowJob {
// ... properties
}
```

### `WorkflowStep`

```typescript
interface WorkflowStep {
// ... properties
}
```

