# index.ts

**File Path:** `vectorizers/index.ts`

## Overview

No overview provided.

## Interfaces

### `VectorizationConfig`

**Properties:**

- `pineconeApiKey: string;`
- `pineconeIndexName: string;`
- `pineconeNamespace?: string;`
- `pineconeEnvironment?: string;`
- `huggingfaceToken: string;`
- `embeddingModel?: string;`
- `fallbackModel?: string;`
- `batchSize?: number;`
- `maxFileSize?: number;`
- `includeExtensions?: string[];`
- `excludeExtensions?: string[];`
- `excludePaths?: string[];`

### `CodeChunk`

**Properties:**

- `content: string;`
- `metadata: {`
- `file_path: string;`
- `strategy: string;`
- `language?: string;`
- `start_line?: number;`
- `end_line?: number;`
- `function_name?: string;`
- `class_name?: string;`
- `chunk_type?: string;`
- `[key: string]: any;`
- `};`
- `embedding?: number[];`
- `id?: string;`

### `VectorizationResult`

**Properties:**

- `success: boolean;`
- `filesProcessed: number;`
- `chunksCreated: number;`
- `vectorsStored: number;`
- `errors: string[];`
- `duration: number;`

