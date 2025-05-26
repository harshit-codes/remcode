# generator.ts

**File Path:** `src/workflows/generator.ts`

## Overview

Result of workflow generation

Class for generating GitHub Actions workflows

Constructor
@param repoPath Path to the repository

Generate a standard Remcode workflow for code analysis and vectorization
@param repoName Repository name
@param options Additional workflow options
@returns Workflow generation result

Generate a scheduled Remcode workflow for periodic processing
@param repoName Repository name
@param schedule Schedule configuration (cron expression)
@param options Additional workflow options
@returns Workflow generation result

Generate an advanced Remcode workflow with detailed steps
@param repoName Repository name
@param options Additional workflow options
@returns Workflow generation result

Generate a custom workflow with specified options
@param name Workflow name (filename without extension)
@param type Workflow template type
@param options Template options
@returns Workflow generation result

Generate all common Remcode workflows
@param repoName Repository name
@param options Additional template options
@returns Map of workflow names to generation results

Update an existing workflow
@param workflowPath Path to the workflow file
@param type Workflow template type
@param options Template options
@returns Workflow generation result

Ensure .github/workflows directory exists
@returns Path to workflows directory

## Dependencies

- `../utils/logger`
- `./templates`

## Classes

### `WorkflowGenerator`

```typescript
class WorkflowGenerator {
// ... implementation
}
```

## Interfaces

### `WorkflowGenerationResult`

```typescript
interface WorkflowGenerationResult {
// ... properties
}
```

## Variables

- `logger`
- `templateOptions`
- `workflowContent`
- `workflowPath`
- `errorMessage`
- `templateOptions`
- `workflowContent`
- `workflowPath`
- `errorMessage`
- `templateOptions`
- `workflowContent`
- `workflowPath`
- `errorMessage`
- `workflowContent`
- `workflowPath`
- `errorMessage`
- `results`
- `successCount`
- `workflowContent`
- `errorMessage`
- `workflowDir`
- `errorMessage`

