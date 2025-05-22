# semantic.ts

**File Path:** `search/semantic.ts`

## Overview

Configuration options for semantic search

## Dependencies

- `../utils/logger`
- `../vectorizers/storage/pinecone`
- `../vectorizers/embedders/manager`

## Classes

### `SemanticSearch`

**Methods:**

- `initialize()`
- `if()`
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
- `if()`
- `Error()`
- `if()`
- `Error()`
- `catch()`
- `String()`
- `Error()`
- `searchSimilarCode()`
- `code()`
- `searchPatterns()`
- `searchFunctionality()`
- `formatSearchResults()`

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

