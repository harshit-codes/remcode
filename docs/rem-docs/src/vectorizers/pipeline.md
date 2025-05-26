# pipeline.ts

**File Path:** `src/vectorizers/pipeline.ts`

## Overview

Main vectorization pipeline that orchestrates chunking, embedding, and storage

Initialize the vectorization pipeline

Process a single file and return its vectorized chunks

Search for similar code using vector similarity

Get storage statistics

Delete vectors for a specific file (useful for incremental updates)

Process all files in a directory recursively

Find all code files in a directory recursively

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

