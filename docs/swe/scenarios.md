# scenarios.ts

**File Path:** `swe/scenarios.ts`

## Overview

Difficulty level for scenarios

## Dependencies

- `../utils/logger`
- `./prompts`

## Classes

### `SWEScenarios`

**Methods:**

- `getAvailableScenarios()`
- `detectScenario()`
- `for()`
- `if()`
- `detectScenarioWithConfidence()`
- `for()`
- `for()`
- `if()`
- `if()`
- `for()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `getScenarioById()`
- `getScenariosByDifficulty()`
- `getScenariosByTags()`

## Interfaces

### `Scenario`

**Properties:**

- `id: string;`
- `name: string;`
- `description: string;`
- `triggers: string[];`
- `negativePatterns?: string[];`
- `tools: string[];`
- `difficulty: DifficultyLevel;`
- `promptType: PromptType;`
- `estimatedTime?: string;`
- `requiredSkills?: string[];`
- `examples?: string[];`
- `tags: string[];`

### `ScenarioDetectionResult`

**Properties:**

- `scenario: Scenario;`
- `confidence: number; // 0-1 confidence score`
- `matchedTriggers: string[];`
- `matchedNegatives: string[];`

