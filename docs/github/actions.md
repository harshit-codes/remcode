# actions.ts

**File Path:** `github/actions.ts`

## Overview

List workflows in a repository

## Dependencies

- `../utils/logger`
- `./client`

## Classes

### `GitHubActions`

**Methods:**

- `listWorkflows()`
- `getWorkflow()`
- `getWorkflowRuns()`
- `if()`
- `if()`
- `if()`
- `triggerWorkflow()`
- `getWorkflowStatus()`
- `catch()`
- `String()`
- `getWorkflowJobs()`
- `downloadWorkflowLogs()`
- `cancelWorkflowRun()`
- `rerunWorkflow()`
- `waitForWorkflowCompletion()`
- `while()`
- `if()`
- `Error()`
- `if()`
- `Error()`
- `if()`
- `if()`
- `Promise()`

## Interfaces

### `WorkflowRun`

**Properties:**

- `id: number;`
- `name?: string;`
- `workflow_id?: number;`
- `head_branch?: string;`
- `head_sha?: string;`
- `status: string;`
- `conclusion: string | null;`
- `created_at: string;`
- `updated_at: string;`
- `html_url?: string;`
- `jobs_url?: string;`
- `logs_url?: string;`
- `run_number?: number;`
- `run_attempt?: number;`
- `display_title?: string;`

### `Workflow`

**Properties:**

- `id: number;`
- `name?: string;`
- `workflow_id?: number;`
- `head_branch?: string;`
- `head_sha?: string;`
- `status: string;`
- `conclusion: string | null;`
- `created_at: string;`
- `updated_at: string;`
- `html_url?: string;`
- `jobs_url?: string;`
- `logs_url?: string;`
- `run_number?: number;`
- `run_attempt?: number;`
- `display_title?: string;`

### `WorkflowJob`

**Properties:**

- `id: number;`
- `run_id: number;`
- `name: string;`
- `status: string;`
- `conclusion: string | null;`
- `started_at: string | null;`
- `completed_at: string | null;`
- `steps?: WorkflowStep[];`

### `WorkflowStep`

**Properties:**

- `name: string;`
- `status: string;`
- `conclusion: string | null;`
- `number: number;`
- `started_at?: string;`
- `completed_at?: string;`

