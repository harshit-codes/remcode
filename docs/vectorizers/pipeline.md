# pipeline.ts

**File Path:** `vectorizers/pipeline.ts`

## Overview

Main vectorization pipeline that orchestrates chunking, embedding, and storage

## Dependencies

- `../utils/logger`
- `./chunkers/manager`
- `./embedders/manager`
- `./storage/pinecone`
- `./types`

## Classes

### `VectorizationPipeline`

**Methods:**

#### `initialize()`

Initialize the vectorization pipeline

```typescript
initialize(): Promise<void> {
```

#### `processFile()`

Process a single file and return its vectorized chunks

```typescript
processFile(filePath: string): Promise<CodeChunk[]> {
```

#### `searchSimilarCode()`

Search for similar code using vector similarity

```typescript
searchSimilarCode(query: string, topK: number = 10, filter?: Record<string, any>): Promise<any[]> {
```

#### `getStats()`

Get storage statistics

```typescript
getStats(): Promise<any> {
```

#### `createFileInfo()`

```typescript
createFileInfo(filePath: string, relativePath?: string): FileInfo {
```

#### `determineChunkingStrategy()`

```typescript
determineChunkingStrategy(content: string, fileInfo: FileInfo): string {
```

#### `estimateComplexity()`

```typescript
estimateComplexity(content: string): 'low' | 'medium' | 'high' {
```

