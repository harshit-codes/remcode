# generator.ts

**File Path:** `workflows/generator.ts`

## Overview

Result of workflow generation

## Dependencies

- `../utils/logger`
- `./templates`

## Classes

### `WorkflowGenerator`

Constructor

```typescript
class WorkflowGenerator {
// ... implementation
}
```

**Methods:**

#### `generateRemcodeWorkflow()`

Generate a standard Remcode workflow for code analysis and vectorization
@param repoName Repository name
@param options Additional workflow options
@returns Workflow generation result

```typescript
generateRemcodeWorkflow(
```

#### `generateScheduledWorkflow()`

Generate a scheduled Remcode workflow for periodic processing
@param repoName Repository name
@param schedule Schedule configuration (cron expression)
@param options Additional workflow options
@returns Workflow generation result

```typescript
generateScheduledWorkflow(
```

#### `generateAdvancedWorkflow()`

Generate an advanced Remcode workflow with detailed steps
@param repoName Repository name
@param options Additional workflow options
@returns Workflow generation result

```typescript
generateAdvancedWorkflow(
```

#### `generateCustomWorkflow()`

Generate a custom workflow with specified options
@param name Workflow name (filename without extension)
@param type Workflow template type
@param options Template options
@returns Workflow generation result

```typescript
generateCustomWorkflow(
```

#### `generateAllWorkflows()`

Generate all common Remcode workflows
@param repoName Repository name
@param options Additional template options
@returns Map of workflow names to generation results

```typescript
generateAllWorkflows(
```

#### `updateWorkflow()`

Update an existing workflow
@param workflowPath Path to the workflow file
@param type Workflow template type
@param options Template options
@returns Workflow generation result

```typescript
updateWorkflow(
```

## Interfaces

### `WorkflowGenerationResult`

```typescript
interface WorkflowGenerationResult {
// ... properties
}
```

