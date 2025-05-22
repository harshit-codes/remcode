# types.ts

**File Path:** `vectorizers/types.ts`

## Overview

Common types used across the vectorization system

## Interfaces

### `CodeChunk`

**Interface Definition:**

```typescript
export interface CodeChunk {
  content: string;
  metadata: {
    file_path: string;
    strategy: string;
    language?: string;
    start_line?: number;
    end_line?: number;
    function_name?: string;
    class_name?: string;
    chunk_type?: string;
    [key: string]: any;
  };
  embedding?: number[];
  id?: string;
}
```

### `FileInfo`

**Interface Definition:**

```typescript
export interface FileInfo {
  file_path: string;
  relative_path: string;
  language: string;
  size: number;
  extension: string;
}
```

### `VectorizationResult`

**Interface Definition:**

```typescript
export interface VectorizationResult {
  success: boolean;
  filesProcessed: number;
  chunksCreated: number;
  vectorsStored: number;
  errors: string[];
  duration: number;
}
```

### `VectorizationOptions`

**Interface Definition:**

```typescript
export interface VectorizationOptions {
  // Pinecone configuration
  pineconeApiKey: string;
  pineconeIndexName: string;
  pineconeNamespace?: string;
  pineconeEnvironment?: string;
  
  // Embedding configuration
  huggingfaceToken: string;
  embeddingModel?: string;
  fallbackModel?: string;
  batchSize?: number;
  
  // Chunking configuration
  chunkingStrategy?: {
    clean_modules: string;
    complex_modules: string;
    monolithic_files: string;
  };
  
  // Processing configuration
  maxFileSize?: number;
  includeExtensions?: string[];
  excludeExtensions?: string[];
  excludePaths?: string[];
}
```

### `ChunkingStrategy`

**Interface Definition:**

```typescript
export interface ChunkingStrategy {
  clean_modules: string;
  complex_modules: string;
  monolithic_files: string;
}
```

### `EmbeddingManagerOptions`

**Interface Definition:**

```typescript
export interface EmbeddingManagerOptions {
  primary: string;
  fallback: string;
  batchSize: number;
  token?: string;
  dimension?: number;
}
```

### `PineconeStorageOptions`

**Interface Definition:**

```typescript
export interface PineconeStorageOptions {
  apiKey: string;
  indexName: string;
  dimension?: number;
  metric?: 'cosine' | 'dotproduct' | 'euclidean';
  environment?: string;
  namespace?: string;
}
```

### `VectorData`

**Interface Definition:**

```typescript
export interface VectorData {
  id?: string;
  embedding: number[];
  metadata?: Record<string, any>;
}
```

