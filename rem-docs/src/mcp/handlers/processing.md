# processing.ts

**File Path:** `src/mcp/handlers/processing.ts`

## Overview

Trigger repository reprocessing

Get current processing status

Get workflow processing history

Cancel a running workflow

Retry a failed workflow

Get workflow logs

Get processing metrics and analytics

Get workflow analytics and performance metrics

Monitor workflow health and get recommendations

Get automated workflow recommendations

## Dependencies

- `express`
- `../../utils/logger`
- `../../processing/state-manager`
- `../../workflows/monitor`
- `../../workflows/generator`
- `../../workflows/templates`

## Classes

### `ProcessingMCPHandler`

```typescript
class ProcessingMCPHandler {
// ... implementation
}
```

## Interfaces

### `ProcessingOptions`

```typescript
interface ProcessingOptions {
// ... properties
}
```

### `ProcessingStatusResponse`

```typescript
interface ProcessingStatusResponse {
// ... properties
}
```

## Variables

- `logger`
- `options`
- `workflowInputs`
- `workflowId`
- `runId`
- `state`
- `response`
- `workflowRuns`
- `history`
- `state`
- `logs`
- `workflowRuns`
- `cutoffDate`
- `recentRuns`
- `metrics`
- `state`
- `analytics`
- `healthStatus`
- `recommendations`
- `priorityActions`

