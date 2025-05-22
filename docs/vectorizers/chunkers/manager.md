# manager.ts

**File Path:** `vectorizers/chunkers/manager.ts`

## Overview

Manages code chunking with various strategies tailored to different code types

## Dependencies

- `../../utils/logger`
- `langchain/document`
- `langchain/text_splitter`
- `langchain/text_splitter`
- `langchain/text_splitter`
- `../types`

## Classes

### `ChunkingManager`

**Methods:**

#### `chunkFile()`

Chunks a file's content based on the specified strategy
@param content The file content to chunk
@param strategy The chunking strategy to apply
@param fileInfo Information about the file
@returns An array of code chunks

```typescript
chunkFile(content: string, strategy: string, fileInfo: any): Promise<CodeChunk[]> {
```

#### `fallbackChunking()`

Simple fallback chunking strategy when advanced methods fail

```typescript
fallbackChunking(content: string, fileInfo: any): CodeChunk[] {
```

#### `determineChunkSize()`

Determines appropriate chunk size based on content and language

```typescript
determineChunkSize(content: string, language: string): number {
```

