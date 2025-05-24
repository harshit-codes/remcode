# manager.ts

**File Path:** `src/vectorizers/chunkers/manager.ts`

## Overview

Manages code chunking with various strategies tailored to different code types

Creates a new ChunkingManager with the specified strategy
@param strategy Chunking strategy configuration

Chunks a file's content based on the specified strategy
@param content The file content to chunk
@param strategy The chunking strategy to apply
@param fileInfo Information about the file
@returns An array of code chunks

Chunks code by function boundaries

Chunks code by class boundaries

Treats the entire file as one chunk

Chunks content using a sliding window approach with configurable overlap

Simple fallback chunking strategy when advanced methods fail

Determines appropriate chunk size based on content and language

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
export function boundaries()
```

### `boundaries()`

```typescript
export function boundaries()
```

### `including()`

```typescript
export function including()
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

