# detector.ts

**File Path:** `setup/detector.ts`

## Overview

Possible reasons for setup requirements

## Dependencies

- `../utils/logger`

## Classes

### `SetupDetector`

Constructor

```typescript
class SetupDetector {
// ... implementation
}
```

**Methods:**

#### `detectSetupNeeds()`

Detect all setup requirements

```typescript
detectSetupNeeds(): Promise<SetupStatus> {
```

#### `hasGitRepository()`

Check if directory is a Git repository

```typescript
hasGitRepository(): boolean {
```

#### `hasRemcodeFile()`

Check if .remcode configuration file exists

```typescript
hasRemcodeFile(): boolean {
```

#### `hasGitHubWorkflow()`

Check if GitHub workflow file exists

```typescript
hasGitHubWorkflow(): boolean {
```

#### `validateRemcodeConfig()`

Validate .remcode configuration file

```typescript
validateRemcodeConfig(): boolean {
```

#### `getConfigVersion()`

Get .remcode configuration version

```typescript
getConfigVersion(): string | undefined {
```

#### `getRemcodeVersion()`

Get current remcode version

```typescript
getRemcodeVersion(): string {
```

#### `getSetupReason()`

Determine the reason for setup requirements

```typescript
getSetupReason(
```

## Interfaces

### `GitRemoteInfo`

```typescript
interface GitRemoteInfo {
// ... properties
}
```

### `SetupStatus`

```typescript
interface SetupStatus {
// ... properties
}
```

