# prompts.ts

**File Path:** `swe/prompts.ts`

## Overview

Prompt types supported by the system

## Dependencies

- `../utils/logger`
- `./guidelines`

## Classes

### `SWEPrompts`

Get the default software engineering prompt

```typescript
class SWEPrompts {
// ... implementation
}
```

**Methods:**

#### `getScenarioGuidance()`

Get scenario-specific guidance

```typescript
getScenarioGuidance(scenario: PromptType): string {
```

## Interfaces

### `PromptConfig`

```typescript
interface PromptConfig {
// ... properties
}
```

## Variables

- `defaultPromptConfig`

