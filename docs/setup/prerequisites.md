# prerequisites.ts

**File Path:** `setup/prerequisites.ts`

## Overview

Prerequisite check result

## Dependencies

- `../utils/logger`

## Classes

### `Prerequisites`

Constructor

```typescript
class Prerequisites {
// ... implementation
}
```

**Methods:**

#### `checkAll()`

Check all prerequisites
@returns Array of prerequisite check results

```typescript
checkAll(): Promise<PrerequisiteCheck[]> {
```

#### `execAsync()`

```typescript
execAsync('git --version', { cwd: this.repoPath }
```

#### `checkEnvironmentVariables()`

Check if required environment variables are set

```typescript
checkEnvironmentVariables(): PrerequisiteCheck {
```

## Interfaces

### `PrerequisiteCheck`

```typescript
interface PrerequisiteCheck {
// ... properties
}
```

