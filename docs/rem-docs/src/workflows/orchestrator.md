# orchestrator.ts

**File Path:** `src/workflows/orchestrator.ts`

## Overview

Orchestrates end-to-end workflow automation including monitoring, 
health checks, notifications, and auto-healing

Start the orchestration service

Stop the orchestration service

Get current orchestration status

Perform comprehensive health check

Handle unhealthy workflow scenarios

Attempt automatic retry of failed workflows

Attempt auto-healing actions

Generate healing actions based on health issues

Set up proactive monitoring

Count consecutive failures from recent runs

Determine overall health status

Log automation action

Handle workflow completion notification

Factory function to create orchestrator with common configurations

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
export function to()
```

### `createWorkflowOrchestrator()`

```typescript
export function createWorkflowOrchestrator()
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

