# incremental.ts

**File Path:** `src/processing/incremental.ts`

## Overview

Initialize vector storage

Process a batch of changed files incrementally

Process a single file

Delete vectors for a file

Update processing state with the latest commit

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

