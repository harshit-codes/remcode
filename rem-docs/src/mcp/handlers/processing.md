# processing.ts

**File Path:** `src/mcp/handlers/processing.ts`

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

## Additional Documentation

### Comment 1

Get current processing status

### Comment 2

Get workflow processing history

### Comment 3

Cancel a running workflow

### Comment 4

Retry a failed workflow

### Comment 5

Get workflow logs

### Comment 6

Get processing metrics and analytics

### Comment 7

Get workflow analytics and performance metrics

### Comment 8

Monitor workflow health and get recommendations

### Comment 9

Get automated workflow recommendations

## File Statistics

- **Lines of Code**: 591
- **File Size**: 17803 bytes
- **Last Modified**: 2025-05-23T18:20:58.502Z

