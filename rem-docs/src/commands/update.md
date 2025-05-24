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
export function updateCommand()
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

