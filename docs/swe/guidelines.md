# guidelines.ts

**File Path:** `swe/guidelines.ts`

## Overview

Priority levels for coding guidelines

## Dependencies

- `../utils/logger`

## Classes

### `SWEGuidelines`

**Methods:**

- `getCodingStandards()`
- `catch()`
- `throttle()`
- `pattern()`
- `getGuideline()`
- `getGuidelinesByCategory()`
- `getGuidelinesByPriority()`
- `validateCode()`
- `if()`
- `if()`
- `if()`
- `if()`
- `for()`
- `if()`

## Interfaces

### `CodingGuideline`

**Properties:**

- `id: string;`
- `title: string;`
- `description: string;`
- `rules: string[];`
- `priority: GuidlinePriority;`
- `examples?: {`
- `good?: string;`
- `bad?: string;`
- `};`
- `category: string;`
- `tags: string[];`

### `ValidationIssue`

**Properties:**

- `guidelineId: string;`
- `message: string;`
- `severity: GuidlinePriority;`
- `lineNumber?: number;`
- `column?: number;`
- `suggestedFix?: string;`

