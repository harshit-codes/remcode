# orchestrator.ts

**File Path**: `workflows/orchestrator.ts`

## Description

Orchestrates end-to-end workflow automation including monitoring, 
 health checks, notifications, and auto-healing

## Classes

- `WorkflowOrchestrator`

## Interfaces

- `OrchestrationConfig`
- `OrchestrationStatus`

## Functions

- `createWorkflowOrchestrator`

## Documentation Comments

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

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { WorkflowMonitor } from '../workflows/monitor';
import { NotificationService, NotificationConfig, NotificationPayload } from '../notifications/service';
import { StateManager } from '../processing/state-manager';

// Key exports:
export class WorkflowOrchestrator { ... }
export interface OrchestrationConfig { ... }
export interface OrchestrationStatus { ... }
export function createWorkflowOrchestrator(...) { ... }
```

## File Statistics

- **Lines of Code**: 431
- **File Size**: 13104 bytes
- **Last Modified**: 2025-05-23T18:23:42.073Z

