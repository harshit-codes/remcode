# actions.ts

**File Path:** `src/github/actions.ts`

## Overview

List workflows in a repository

Get workflow by ID or filename

List workflow runs for a specific workflow or all workflows in a repo

Trigger a workflow dispatch event

Get the status of a specific workflow run

Get jobs for a specific workflow run

Download workflow run logs

Cancel a workflow run

Re-run a workflow

Wait for a workflow run to complete, with polling and timeout

## Dependencies

- `../utils/logger`
- `./client`

## Classes

### `GitHubActions`

```typescript
class GitHubActions {
// ... implementation
}
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
interface Workflow {
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

## Variables

- `logger`
- `response`
- `isNumeric`
- `endpoint`
- `endpoint`
- `queryParams`
- `response`
- `workflowRun`
- `response`
- `response`
- `endpoint`
- `startTime`
- `lastStatus`
- `run`

