# templates.ts

**File Path:** `src/workflows/templates.ts`

## Overview

Workflow template types

Workflow schedule configuration

Workflow notification configuration

Workflow environment configuration

Workflow template options

Class for managing workflow templates

Get a workflow template based on type and options
@param type Workflow template type
@param options Template options
@returns Generated workflow template

Get basic Remcode workflow template

Get scheduled Remcode workflow template

Get advanced Remcode workflow template with detailed steps and logs

Get Remcode workflow template with caching

Get Remcode workflow template with notifications

Get a custom workflow template using options

## Dependencies

- `../utils/logger`

## Classes

### `WorkflowTemplates`

```typescript
class WorkflowTemplates {
// ... implementation
}
```

## Interfaces

### `WorkflowScheduleConfig`

```typescript
interface WorkflowScheduleConfig {
// ... properties
}
```

### `WorkflowNotificationConfig`

```typescript
interface WorkflowNotificationConfig {
// ... properties
}
```

### `WorkflowEnvironmentConfig`

```typescript
interface WorkflowEnvironmentConfig {
// ... properties
}
```

### `WorkflowTemplateOptions`

```typescript
interface WorkflowTemplateOptions {
// ... properties
}
```

## Variables

- `logger`
- `template`
- `template`

