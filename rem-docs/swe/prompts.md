# prompts.ts

**File Path**: `swe/prompts.ts`

## Description

Prompt types supported by the system - Complete set of 13 software engineering scenarios

## Classes

- `SWEPrompts`

## Interfaces

- `PromptConfig`

## Constants

- `defaultPromptConfig`

## Documentation Comments

### Comment 1

Interface for prompt configuration

### Comment 2

Default prompt configuration

### Comment 3

Software Engineering Prompts implementation

### Comment 4

Get the default software engineering prompt with Remcode MCP integration guidance

### Comment 5

Get a prompt for a specific scenario with code context

### Comment 6

Get scenario-specific guidance with Remcode MCP tool recommendations

### Comment 7

Generate a prompt that includes specific guidelines

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { CodingGuideline } from './guidelines';
import { getScenarioGuidance } from './scenario-guidance';

// Key exports:
export class SWEPrompts { ... }
export interface PromptConfig { ... }
```

## File Statistics

- **Lines of Code**: 222
- **File Size**: 7945 bytes
- **Last Modified**: 2025-05-23T13:07:40.075Z

