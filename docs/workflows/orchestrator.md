# orchestrator.ts

**File Path:** `workflows/orchestrator.ts`

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

Start the orchestration service

```typescript
class WorkflowOrchestrator {
// ... implementation
}
```

**Methods:**

#### `start()`

Start the orchestration service

```typescript
start(): Promise<void> {
```

#### `stop()`

Stop the orchestration service

```typescript
stop(): Promise<void> {
```

#### `Date()`

```typescript
Date(Date.now() + this.config.monitoring.healthCheckInterval * 60 * 1000).toISOString() :
```

#### `generateHealingActions()`

Generate healing actions based on health issues

```typescript
generateHealingActions(health: any): Array<{ name: string; execute: () => Promise<void> }
```

#### `countConsecutiveFailures()`

Count consecutive failures from recent runs

```typescript
countConsecutiveFailures(runs: Array<{ conclusion: string }
```

#### `determineOverallHealth()`

Determine overall health status

```typescript
determineOverallHealth(): 'healthy' | 'warning' | 'critical' {
```

#### `logAutomationAction()`

Log automation action

```typescript
logAutomationAction(action: string, reason: string, success: boolean): void {
```

#### `handleWorkflowCompletion()`

Handle workflow completion notification

```typescript
handleWorkflowCompletion(runId: number, status: 'success' | 'failure', duration: number, stats?: any): Promise<void> {
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

### `createWorkflowOrchestrator()`

```typescript
export function createWorkflowOrchestrator(
  repository: {
```

