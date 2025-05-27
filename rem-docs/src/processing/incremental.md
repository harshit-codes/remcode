# incremental.ts

**File Path:** `src/processing/incremental.ts`

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

```typescript
class IncrementalProcessor {
  // ... implementation
}
```

## Variables

- `logger`
- `errorMsg`
- `fileCount`
- `analysisMap`
- `analysis`
- `deletedFiles`
- `file`
- `activeFiles`
- `addedFiles`
- `modifiedFiles`
- `batchSize`
- `i`
- `batch`
- `processPromises`
- `analysis`
- `errorMsg`
- `filePath`
- `content`
- `chunks`
- `enrichedChunks`
- `embeddings`
- `vectorData`
- `errorMsg`
- `deleteCount`
- `errorMsg`
- `state`
- `stateObj`
- `updatedState`
- `errorMsg`

## Additional Documentation

### Comment 1

Process a batch of changed files incrementally

### Comment 2

Process a single file

### Comment 3

Delete vectors for a file

### Comment 4

Update processing state with the latest commit

## File Statistics

- **Lines of Code**: 341
- **File Size**: 11678 bytes
- **Last Modified**: 2025-05-22T16:41:13.607Z

