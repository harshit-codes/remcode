# orchestrator.ts

**File Path:** `src/workflows/orchestrator.ts`

## Overview

Orchestrates end-to-end workflow automation including monitoring, 
health checks, notifications, and auto-healing

## Dependencies

- `../utils/logger`
- `../workflows/monitor`
- `../notifications/service`
- `../processing/state-manager`

## Classes

### `WorkflowOrchestrator`

```typescript
class WorkflowOrchestrator {
  // ... implementation
}
```

## Interfaces

### `OrchestrationConfig`

```typescript
interface OrchestrationConfig {
  // ... properties
}
```

### `OrchestrationStatus`

```typescript
interface OrchestrationStatus {
  // ... properties
}
```

## Functions

### `to()`

```typescript
function to() {
  // ... implementation
}
```

### `createWorkflowOrchestrator()`

```typescript
function createWorkflowOrchestrator() {
  // ... implementation
}
```

## Variables

- `logger`
- `intervalMs`
- `lastAction`
- `health`
- `notification`
- `recentRuns`
- `consecutiveFailures`
- `healingActions`
- `action`
- `actions`
- `count`
- `run`
- `recentActions`
- `healthChecks`
- `failures`
- `entry`
- `notification`
- `config`

## Additional Documentation

### Comment 1

Start the orchestration service

### Comment 2

Stop the orchestration service

### Comment 3

Get current orchestration status

### Comment 4

Perform comprehensive health check

### Comment 5

Handle unhealthy workflow scenarios

### Comment 6

Attempt automatic retry of failed workflows

### Comment 7

Attempt auto-healing actions

### Comment 8

Generate healing actions based on health issues

### Comment 9

Set up proactive monitoring

### Comment 10

Count consecutive failures from recent runs

### Comment 11

Determine overall health status

### Comment 12

Log automation action

### Comment 13

Handle workflow completion notification

### Comment 14

Factory function to create orchestrator with common configurations

## File Statistics

- **Lines of Code**: 431
- **File Size**: 13104 bytes
- **Last Modified**: 2025-05-23T18:23:42.073Z

