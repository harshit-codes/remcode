# state-manager.ts

**File Path:** `processing/state-manager.ts`

## Overview

Check if the .remcode file exists

## Dependencies

- `../utils/logger`

## Classes

### `StateManager`

Check if the .remcode file exists

```typescript
class StateManager {
// ... implementation
}
```

**Methods:**

#### `exists()`

Check if the .remcode file exists

```typescript
exists(): Promise<boolean> {
```

#### `loadState()`

Load the current state from the .remcode file

```typescript
loadState(): Promise<RemcodeState | null> {
```

#### `initializeState()`

Create initial state file if it doesn't exist

```typescript
initializeState(initialState?: Partial<RemcodeState>): Promise<RemcodeState> {
```

#### `updateState()`

Update the state with new values

```typescript
updateState(updates: Partial<RemcodeState>): Promise<RemcodeState> {
```

#### `updateProcessingStatus()`

Update processing status in the state

```typescript
updateProcessingStatus(status: RemcodeState['processing']['status'], lastCommit?: string): Promise<void> {
```

#### `updateStatistics()`

Update processing statistics

```typescript
updateStatistics(stats: any): Promise<void> {
```

#### `updateVectorizationInfo()`

Update vectorization info

```typescript
updateVectorizationInfo(info: Partial<RemcodeState['vectorization']>): Promise<void> {
```

#### `updateRepositoryInfo()`

Update repository information

```typescript
updateRepositoryInfo(info: Partial<RemcodeState['repository']>): Promise<void> {
```

#### `updateConfiguration()`

Update configuration

```typescript
updateConfiguration(config: Partial<RemcodeState['configuration']>): Promise<void> {
```

#### `isObject()`

Helper method to check if value is an object

```typescript
isObject(item: any): boolean {
```

## Interfaces

### `RemcodeState`

```typescript
interface RemcodeState {
// ... properties
}
```

