# semantic.ts

**File Path:** `search/semantic.ts`

## Overview

Configuration options for semantic search

## Dependencies

- `../utils/logger`
- `../vectorizers/storage/pinecone`
- `../vectorizers/embedders/manager`
- `../vectorizers/types`

## Classes

### `SemanticSearch`

**Methods:**

- `initialize()`
- `if()`
- `Error()`
- `if()`
- `Error()`
- `PineconeStorage()`
- `EmbeddingManager()`
- `catch()`
- `String()`
- `Error()`
- `search()`
- `if()`
- `Error()`
- `if()`
- `Error()`
- `if()`
- `Error()`
- `catch()`
- `String()`
- `Error()`
- `searchSimilarCode()`
- `searchPatterns()`
- `searchFunctionality()`
- `formatSearchResults()`
- `getStats()`
- `if()`
- `Error()`
- `isInitialized()`

## Interfaces

### `SemanticSearchOptions`

**Properties:**

- `pineconeApiKey?: string;`
- `pineconeIndexName?: string;`
- `pineconeEnvironment?: string;`
- `pineconeNamespace?: string;`
- `huggingfaceToken?: string;`
- `embeddingModel?: string;`
- `fallbackModel?: string;`
- `embeddingDimension?: number;`
- `batchSize?: number;`

### `SearchResult`

**Properties:**

- `id: string;`
- `score: number;`
- `content: string;`
- `metadata: {`
- `filePath: string;`
- `language: string;`
- `chunkType: string;`
- `startLine?: number;`
- `endLine?: number;`
- `[key: string]: any;`
- `};`

