# prompts.ts

**File Path:** `swe/prompts.ts`

## Overview

Prompt types supported by the system - Complete set of 13 software engineering scenarios

## Dependencies

- `../utils/logger`
- `./guidelines`
- `./scenario-guidance`

## Classes

### `SWEPrompts`

Get the default software engineering prompt with Remcode MCP integration guidance

```typescript
class SWEPrompts {
// ... implementation
}
```

**Methods:**

#### `getScenarioGuidance()`

Get scenario-specific guidance with Remcode MCP tool recommendations

```typescript
getScenarioGuidance(scenario: PromptType): string {
```

#### `getScenarioGuidance()`

```typescript
getScenarioGuidance(scenario);
  }

  /**
   * Generate a prompt that includes specific guidelines
   */
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

