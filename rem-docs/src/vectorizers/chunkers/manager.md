# manager.ts

**File Path:** `src/vectorizers/chunkers/manager.ts`

## Overview

Manages code chunking with various strategies tailored to different code types

## Dependencies

- `../../utils/logger`
- `@langchain/core/documents`
- `langchain/text_splitter`
- `langchain/text_splitter`
- `langchain/text_splitter`
- `../types`

## Classes

### `ChunkingManager`

```typescript
class ChunkingManager {
  // ... implementation
}
```

### `boundaries`

```typescript
class boundaries {
  // ... implementation
}
```

### `including`

```typescript
class including {
  // ... implementation
}
```

## Functions

### `boundaries()`

```typescript
function boundaries() {
  // ... implementation
}
```

### `boundaries()`

```typescript
function boundaries() {
  // ... implementation
}
```

### `including()`

```typescript
function including() {
  // ... implementation
}
```

## Variables

- `logger`
- `extension`
- `language`
- `chunks`
- `functionPatterns`
- `pattern`
- `match`
- `lastIndex`
- `functionName`
- `functionBody`
- `startIndex`
- `endIndex`
- `contentBeforeFunction`
- `startLine`
- `endLine`
- `remainingContent`
- `startLine`
- `endLine`
- `chunks`
- `classPatterns`
- `pattern`
- `match`
- `lastIndex`
- `className`
- `classBody`
- `startIndex`
- `endIndex`
- `contentBeforeClass`
- `startLine`
- `endLine`
- `remainingContent`
- `startLine`
- `endLine`
- `chunkSize`
- `splitter`
- `langchainLanguage`
- `doc`
- `docs`
- `docStartIndex`
- `contentBeforeChunk`
- `startLine`
- `endLine`
- `chunks`
- `lines`
- `chunkSize`
- `i`
- `chunkLines`
- `chunkContent`
- `totalLength`

## Additional Documentation

### Comment 1

Creates a new ChunkingManager with the specified strategy
@param strategy Chunking strategy configuration

### Comment 2

Chunks a file's content based on the specified strategy
@param content The file content to chunk
@param strategy The chunking strategy to apply
@param fileInfo Information about the file
@returns An array of code chunks

### Comment 3

Chunks code by function boundaries

### Comment 4

Chunks code by class boundaries

### Comment 5

Treats the entire file as one chunk

### Comment 6

Chunks content using a sliding window approach with configurable overlap

### Comment 7

Simple fallback chunking strategy when advanced methods fail

### Comment 8

Determines appropriate chunk size based on content and language

## File Statistics

- **Lines of Code**: 388
- **File Size**: 13861 bytes
- **Last Modified**: 2025-05-24T12:19:15.467Z

