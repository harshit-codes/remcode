# workflow-generator.ts

**File Path:** `setup/workflow-generator.ts`

## Overview

Workflow template options

## Dependencies

- `../utils/logger`

## Classes

### `WorkflowGenerator`

Constructor

```typescript
class WorkflowGenerator {
// ... implementation
}
```

**Methods:**

#### `generateWorkflow()`

Generate a GitHub Actions workflow for Remcode
@param options Workflow template options
@param templateType Type of workflow template to generate
@returns Workflow generation result

```typescript
generateWorkflow(
```

#### `generateWorkflowContent()`

Generate workflow content based on template type and options
@param options Workflow template options
@param templateType Type of workflow template
@returns Workflow content as string

```typescript
generateWorkflowContent(
```

#### `generateBasicWorkflow()`

Generate a basic workflow for Remcode

```typescript
generateBasicWorkflow(
```

#### `generateAdvancedWorkflow()`

Generate an advanced workflow with caching and metrics

```typescript
generateAdvancedWorkflow(
```

#### `generateEnterpriseWorkflow()`

Generate an enterprise workflow with multiple jobs and notifications

```typescript
generateEnterpriseWorkflow(
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

