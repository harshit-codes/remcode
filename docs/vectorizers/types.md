# types.ts

**File Path:** `vectorizers/types.ts`

## Overview

Common types used across the vectorization system

## Interfaces

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

### `FileInfo`

**Properties:**

- `file_path: string;`
- `relative_path: string;`
- `language: string;`
- `size: number;`
- `extension: string;`

### `VectorizationResult`

**Properties:**

- `success: boolean;`
- `filesProcessed: number;`
- `chunksCreated: number;`
- `vectorsStored: number;`
- `errors: string[];`
- `duration: number;`

### `VectorizationOptions`

**Properties:**

- `pineconeApiKey: string;`
- `pineconeIndexName: string;`
- `pineconeNamespace?: string;`
- `pineconeEnvironment?: string;`
- `huggingfaceToken: string;`
- `embeddingModel?: string;`
- `fallbackModel?: string;`
- `batchSize?: number;`
- `chunkingStrategy?: {`
- `clean_modules: string;`
- `complex_modules: string;`
- `monolithic_files: string;`
- `};`
- `maxFileSize?: number;`
- `includeExtensions?: string[];`
- `excludeExtensions?: string[];`
- `excludePaths?: string[];`

### `ChunkingStrategy`

**Properties:**

- `clean_modules: string;`
- `complex_modules: string;`
- `monolithic_files: string;`

### `EmbeddingManagerOptions`

**Properties:**

- `primary: string;`
- `fallback: string;`
- `batchSize: number;`
- `token?: string;`
- `dimension?: number;`

### `PineconeStorageOptions`

**Properties:**

- `apiKey: string;`
- `indexName: string;`
- `dimension?: number;`
- `metric?: 'cosine' | 'dotproduct' | 'euclidean';`
- `environment?: string;`
- `namespace?: string;`

### `VectorData`

**Properties:**

- `id?: string;`
- `embedding: number[];`
- `metadata?: Record<string, any>;`

