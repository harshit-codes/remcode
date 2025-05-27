# actions.ts

**File Path**: `github/actions.ts`

## Description

List workflows in a repository

## Classes

- `GitHubActions`

## Interfaces

- `WorkflowRun`
- `Workflow`
- `WorkflowJob`
- `WorkflowStep`

## Documentation Comments

### Comment 1

Get workflow by ID or filename

### Comment 2

List workflow runs for a specific workflow or all workflows in a repo

### Comment 3

Trigger a workflow dispatch event

### Comment 4

Get the status of a specific workflow run

### Comment 5

Get jobs for a specific workflow run

### Comment 6

Download workflow run logs

### Comment 7

Cancel a workflow run

### Comment 8

Re-run a workflow

### Comment 9

Wait for a workflow run to complete, with polling and timeout

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { GitHubClient } from './client';

// Key exports:
export class GitHubActions { ... }
export interface WorkflowRun { ... }
export interface Workflow { ... }
export interface WorkflowJob { ... }
export interface WorkflowStep { ... }
```

## File Statistics

- **Lines of Code**: 219
- **File Size**: 7089 bytes
- **Last Modified**: 2025-05-22T09:54:26.185Z

