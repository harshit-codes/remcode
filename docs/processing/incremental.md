# incremental.ts

**File Path:** `processing/incremental.ts`

## Overview

Initialize vector storage

## Dependencies

- `../utils/logger`
- `./change-detector`
- `./file-analyzer`
- `./state-manager`
- `../vectorizers/storage/pinecone`

## Classes

### `IncrementalProcessor`

**Methods:**

- `StateManager()`
- `Date()`
- `initialize()`
- `if()`
- `PineconeStorage()`
- `catch()`
- `String()`
- `Error()`
- `processChangedFiles()`
- `for()`
- `if()`
- `for()`
- `for()`
- `if()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `Date()`
- `processFile()`
- `if()`
- `if()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `deleteVectorsForFile()`
- `if()`
- `if()`
- `Error()`
- `catch()`
- `String()`
- `updateProcessingState()`
- `if()`
- `Date()`
- `catch()`
- `String()`
- `Error()`

## Interfaces

### `ProcessingStats`

**Properties:**

- `totalFiles: number;`
- `addedFiles: number;`
- `modifiedFiles: number;`
- `deletedFiles: number;`
- `totalChunks: number;`
- `totalEmbeddings: number;`
- `errorCount: number;`
- `startTime: Date;`
- `endTime?: Date;`
- `durationMs?: number;`

### `IncrementalProcessorOptions`

**Properties:**

- `repoPath: string;`
- `pineconeApiKey: string;`
- `pineconeEnvironment?: string;`
- `pineconeIndexName: string;`
- `pineconeNamespace?: string;`
- `embeddingModel?: string;`
- `batchSize?: number;`
- `dryRun?: boolean;`
- `includeTests?: boolean;`

