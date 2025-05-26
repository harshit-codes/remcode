# prerequisites.ts

**File Path:** `src/setup/prerequisites.ts`

## Overview

Prerequisite check result

Class to check prerequisites for remcode setup

Constructor
@param repoPath Path to the repository

Check all prerequisites
@returns Array of prerequisite check results

Check if Git repository exists

Check if GitHub remote exists

Check if Node.js version is compatible

Check if required environment variables are set

Check if working directory is clean

Check if we have write permissions in the repository

## Dependencies

- `../utils/logger`

## Classes

### `Prerequisites`

```typescript
class Prerequisites {
// ... implementation
}
```

## Interfaces

### `PrerequisiteCheck`

```typescript
interface PrerequisiteCheck {
// ... properties
}
```

## Functions

### `properly()`

```typescript
export function properly()
```

## Variables

- `logger`
- `execAsync`
- `checks`
- `results`
- `passed`
- `failed`
- `criticalFailed`
- `errorMessage`
- `name`
- `gitDirExists`
- `errorMessage`
- `name`
- `errorMessage`
- `name`
- `minVersion`
- `nodeVersion`
- `versionNumber`
- `errorMessage`
- `name`
- `requiredVars`
- `missingVars`
- `recommendedVars`
- `missingRecommended`
- `errorMessage`
- `name`
- `errorMessage`
- `name`
- `testFilePath`
- `fileExists`
- `errorMessage`

