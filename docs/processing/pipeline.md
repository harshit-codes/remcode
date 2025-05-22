# pipeline.ts

**File Path:** `processing/pipeline.ts`

## Overview

Main processing pipeline that orchestrates incremental code analysis and vectorization

## Dependencies

- `../utils/logger`
- `./change-detector`
- `./file-analyzer`
- `./incremental`
- `./state-manager`
- `./types`

## Classes

### `ProcessingPipeline`

Execute the full incremental processing pipeline

```typescript
class ProcessingPipeline {
// ... implementation
}
```

**Methods:**

#### `processIncremental()`

Execute the full incremental processing pipeline

```typescript
processIncremental(fromCommit?: string): Promise<ProcessingStats> {
```

#### `processAll()`

Process all files in the repository (full processing)

```typescript
processAll(): Promise<ProcessingStats> {
```

#### `getStatus()`

Get status of the processing pipeline

```typescript
getStatus(): Promise<{
```

#### `hasPendingChanges()`

Check if there are pending changes to process

```typescript
hasPendingChanges(): Promise<boolean> {
```

#### `createEmptyStats()`

Create empty stats for when no processing is needed

```typescript
createEmptyStats(): ProcessingStats {
```

