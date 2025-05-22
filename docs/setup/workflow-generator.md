# workflow-generator.ts

**File Path:** `setup/workflow-generator.ts`

## Overview

Workflow template options

## Dependencies

- `../utils/logger`

## Classes

### `WorkflowGenerator`

**Methods:**

- `generateWorkflow()`
- `catch()`
- `String()`
- `ensureDirectoryExists()`
- `if()`
- `catch()`
- `String()`
- `generateWorkflowContent()`
- `Date()`
- `if()`
- `switch()`
- `generateBasicWorkflow()`
- `generateAdvancedWorkflow()`
- `always()`
- `generateEnterpriseWorkflow()`
- `hashFiles()`
- `always()`
- `always()`
- `always()`

## Interfaces

### `WorkflowTemplateOptions`

**Properties:**

- `repoName: string;`
- `owner?: string;`
- `branches?: string[];`
- `embeddingModel?: string;`
- `nodeVersion?: string;`
- `cronSchedule?: string;`
- `customSecrets?: Record<string, string>;`
- `includeSchedule?: boolean;`
- `workflowVersion?: string;`

### `WorkflowGenerationResult`

**Properties:**

- `success: boolean;`
- `filePath?: string;`
- `error?: string;`
- `workflowContent?: string;`
- `workflowVersion: string;`

