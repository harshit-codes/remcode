# pipeline.ts

**File Path:** `src/vectorizers/pipeline.ts`

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

```typescript
class VectorizationPipeline {
  // ... implementation
}
```

## Variables

- `logger`
- `errorMessage`
- `content`
- `fileInfo`
- `strategy`
- `chunks`
- `embeddedChunks`
- `vectorData`
- `errorMessage`
- `queryChunk`
- `embeddedQuery`
- `results`
- `errorMessage`
- `errorMessage`
- `stats`
- `extension`
- `languageMap`
- `lines`
- `complexity`
- `lines`
- `functions`
- `nesting`
- `complexityScore`
- `startTime`
- `result`
- `files`
- `filePath`
- `chunks`
- `errorMsg`
- `files`
- `excludePatterns`
- `includeExtensions`
- `walk`
- `items`
- `item`
- `fullPath`
- `stat`
- `shouldSkip`
- `ext`

## Additional Documentation

### Comment 1

Initialize the vectorization pipeline

### Comment 2

Process a single file and return its vectorized chunks

### Comment 3

Search for similar code using vector similarity

### Comment 4

Get storage statistics

### Comment 5

Delete vectors for a specific file (useful for incremental updates)

### Comment 6

Process all files in a directory recursively

### Comment 7

Find all code files in a directory recursively

## File Statistics

- **Lines of Code**: 360
- **File Size**: 11931 bytes
- **Last Modified**: 2025-05-23T05:10:03.822Z

