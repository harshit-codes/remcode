# pipeline.ts

**File Path**: `vectorizers/pipeline.ts`

## Description

Main vectorization pipeline that orchestrates chunking, embedding, and storage

## Classes

- `VectorizationPipeline`

## Documentation Comments

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

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { ChunkingManager } from './chunkers/manager';
import { EmbeddingManager } from './embedders/manager';
import { PineconeStorage } from './storage/pinecone';
import { CodeChunk, FileInfo, VectorizationResult, VectorizationOptions } from './types';
// ... 3 more imports

// Key exports:
export class VectorizationPipeline { ... }
```

## File Statistics

- **Lines of Code**: 360
- **File Size**: 11931 bytes
- **Last Modified**: 2025-05-23T05:10:03.822Z

