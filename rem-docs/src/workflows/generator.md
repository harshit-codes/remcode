# generator.ts

**File Path:** `src/workflows/generator.ts`

## Overview

Result of workflow generation

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

## Additional Documentation

### Comment 1

Class for generating GitHub Actions workflows

### Comment 2

Constructor
@param repoPath Path to the repository

### Comment 3

Generate a standard Remcode workflow for code analysis and vectorization
@param repoName Repository name
@param options Additional workflow options
@returns Workflow generation result

### Comment 4

Generate a scheduled Remcode workflow for periodic processing
@param repoName Repository name
@param schedule Schedule configuration (cron expression)
@param options Additional workflow options
@returns Workflow generation result

### Comment 5

Generate an advanced Remcode workflow with detailed steps
@param repoName Repository name
@param options Additional workflow options
@returns Workflow generation result

### Comment 6

Generate a custom workflow with specified options
@param name Workflow name (filename without extension)
@param type Workflow template type
@param options Template options
@returns Workflow generation result

### Comment 7

Generate all common Remcode workflows
@param repoName Repository name
@param options Additional template options
@returns Map of workflow names to generation results

### Comment 8

Update an existing workflow
@param workflowPath Path to the workflow file
@param type Workflow template type
@param options Template options
@returns Workflow generation result

### Comment 9

Ensure .github/workflows directory exists
@returns Path to workflows directory

## File Statistics

- **Lines of Code**: 322
- **File Size**: 9843 bytes
- **Last Modified**: 2025-05-22T10:36:30.127Z

