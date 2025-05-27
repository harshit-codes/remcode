# update.ts

**File Path:** `src/commands/update.ts`

## Overview

No overview provided.

## Dependencies

- `commander`
- `child_process`
- `../utils/config`
- `../vectorizers/chunkers/manager`
- `../vectorizers/embedders/manager`
- `../vectorizers/storage/pinecone`
- `../utils/logger`

## Interfaces

### `RemcodeConfig`

```typescript
interface RemcodeConfig {
  // ... properties
}
```

## Functions

### `updateCommand()`

```typescript
function updateCommand() {
  // ... implementation
}
```

## Variables

- `logger`
- `spinner`
- `config`
- `remcodePath`
- `remcodeConfig`
- `currentCommit`
- `sinceCommit`
- `changedFilesOutput`
- `changedFiles`
- `totalChanges`
- `indexName`
- `pineconeKey`
- `storageManager`
- `embeddingModel`
- `embeddingManager`
- `chunkingManager`
- `processedFiles`
- `totalFiles`
- `chunksProcessed`
- `vectorsStored`
- `i`
- `filePath`
- `filesToProcess`
- `i`
- `filePath`
- `content`
- `chunks`
- `embeddings`
- `validEmbeddings`

## File Statistics

- **Lines of Code**: 322
- **File Size**: 12643 bytes
- **Last Modified**: 2025-05-23T05:06:29.376Z

