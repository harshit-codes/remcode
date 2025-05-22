# incremental.ts

**File Path:** `processing/incremental.ts`

## Overview

Initialize vector storage

## Dependencies

- `../utils/logger`
- `./state-manager`
- `../vectorizers/storage/pinecone`
- `../vectorizers/chunkers/manager`
- `../vectorizers/embedders/manager`
- `./types`

## Classes

### `IncrementalProcessor`

Initialize vector storage

```typescript
class IncrementalProcessor {
// ... implementation
}
```

**Methods:**

#### `initialize()`

Initialize vector storage

```typescript
initialize(): Promise<void> {
    // Skip initialization in dry run mode
```

#### `processChangedFiles()`

Process a batch of changed files incrementally

```typescript
processChangedFiles(changes: FileChange[], analyses: FileAnalysis[]): Promise<ProcessingStats> {
```

#### `deleteVectorsForFile()`

Delete vectors for a file

```typescript
deleteVectorsForFile(filePath: string): Promise<void> {
```

#### `updateProcessingState()`

Update processing state with the latest commit

```typescript
updateProcessingState(lastCommit: string): Promise<void> {
```

