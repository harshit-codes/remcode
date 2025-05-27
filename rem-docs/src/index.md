# index.ts

**File Path:** `src/index.ts`

## Overview

Smart auto-routing based on context detection
Automatically determines the appropriate action based on environment

## Dependencies

- `commander`
- `./commands/analyze`
- `./commands/vectorize`
- `./commands/update`
- `./commands/serve`
- `./commands/process`
- `./commands/inspector`

## Functions

### `getPackageVersion()`

```typescript
function getPackageVersion() {
  // ... implementation
}
```

### `autoRoute()`

```typescript
function autoRoute() {
  // ... implementation
}
```

### `isMCPEnvironment()`

```typescript
function isMCPEnvironment() {
  // ... implementation
}
```

### `isGitRepository()`

```typescript
function isGitRepository() {
  // ... implementation
}
```

### `hasRemcodeConfig()`

```typescript
function hasRemcodeConfig() {
  // ... implementation
}
```

## Variables

- `packageJsonPath`
- `packageJson`
- `program`
- `availableCommands`

## Additional Documentation

### Comment 1

Detect if running in MCP environment

### Comment 2

Check if current directory is a Git repository

### Comment 3

Check if Remcode configuration exists

## File Statistics

- **Lines of Code**: 163
- **File Size**: 5827 bytes
- **Last Modified**: 2025-05-27T04:54:43.986Z

