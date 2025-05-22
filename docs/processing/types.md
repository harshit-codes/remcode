# types.ts

**File Path:** `processing/types.ts`

## Overview

Common types used across the processing system

## Dependencies

- `../vectorizers/types`

## Interfaces

### `FileChange`

**Interface Definition:**

```typescript
export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  previousPath?: string;
  size?: number;
  extension?: string;
}
```

### `FileAnalysis`

**Interface Definition:**

```typescript
export interface FileAnalysis {
  path: string;
  category: 'priority' | 'normal' | 'test' | 'config' | 'ignore';
  language: string;
  complexity: 'low' | 'medium' | 'high';
  size: number;
  sloc?: number;
  imports?: string[];
  exports?: string[];
  functions?: string[];
  classes?: string[];
  dependencies?: string[];
  chunkingStrategy: ChunkStrategyType;
  metadata?: Record<string, any>;
}
```

### `ProcessingStats`

**Interface Definition:**

```typescript
export interface ProcessingStats {
  totalFiles: number;
  addedFiles: number;
  modifiedFiles: number;
  deletedFiles: number;
  totalChunks: number;
  totalEmbeddings: number;
  errorCount: number;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
}
```

### `AnalysisOptions`

**Interface Definition:**

```typescript
export interface AnalysisOptions {
  basePath: string;
  skipAST?: boolean;
  skipDependencies?: boolean;
  maxFileSizeBytes?: number;
}
```

### `IncrementalProcessorOptions`

**Interface Definition:**

```typescript
export interface IncrementalProcessorOptions {
  repoPath: string;
  pineconeApiKey: string;
  pineconeEnvironment?: string;
  pineconeIndexName: string;
  pineconeNamespace?: string;
  embeddingModel?: string;
  batchSize?: number;
  dryRun?: boolean;
  includeTests?: boolean;
}
```

### `VectorMetadata`

**Interface Definition:**

```typescript
export interface VectorMetadata {
  filePath: string;
  language: string;
  category: string;
  startLine?: number;
  endLine?: number;
  functionName?: string;
  className?: string;
  chunkType: string;
  strategy: string;
  repo: string;
  changeType?: 'added' | 'modified' | 'deleted' | 'renamed';
  [key: string]: any;
}
```

