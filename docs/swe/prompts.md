# prompts.ts

**File Path:** `swe/prompts.ts`

## Overview

Prompt types supported by the system

## Dependencies

- `../utils/logger`
- `./guidelines`

## Classes

### `SWEPrompts`

**Methods:**

- `getDefaultPrompt()`
- `getContextAwarePrompt()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `for()`
- `if()`
- `length()`
- `getScenarioGuidance()`
- `switch()`
- `getPromptWithGuidelines()`
- `if()`
- `for()`
- `for()`
- `if()`
- `length()`

## Interfaces

### `PromptConfig`

**Properties:**

- `includeGuidelines?: boolean;`
- `detailLevel?: 'minimal' | 'standard' | 'detailed';`
- `codeContext?: string;`
- `languageSpecific?: string;`
- `framework?: string;`
- `teamPreferences?: Record<string, string>;`
- `maxLength?: number;`

## Variables

- `defaultPromptConfig`

