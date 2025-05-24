# workflow-generator.ts

**File Path:** `src/setup/workflow-generator.ts`

## Overview

Workflow template options

GitHub Actions workflow template types

Workflow generation result

Class for generating GitHub Actions workflows for Remcode

Constructor
@param repoPath Path to the repository

Generate a GitHub Actions workflow for Remcode
@param options Workflow template options
@param templateType Type of workflow template to generate
@returns Workflow generation result

Ensure directory exists, creating it if necessary
@param dir Directory path

Generate workflow content based on template type and options
@param options Workflow template options
@param templateType Type of workflow template
@returns Workflow content as string

Generate a basic workflow for Remcode

Generate an advanced workflow with caching and metrics

Generate an enterprise workflow with multiple jobs and notifications

## Dependencies

- `../utils/logger`

## Classes

### `WorkflowGenerator`

```typescript
class WorkflowGenerator {
// ... implementation
}
```

## Interfaces

### `WorkflowTemplateOptions`

```typescript
interface WorkflowTemplateOptions {
// ... properties
}
```

### `WorkflowGenerationResult`

```typescript
interface WorkflowGenerationResult {
// ... properties
}
```

## Variables

- `logger`
- `workflowsDir`
- `workflowContent`
- `workflowPath`
- `errorMessage`
- `errorMessage`
- `versionComment`
- `workflowContent`
- `content`
- `content`
- `content`

