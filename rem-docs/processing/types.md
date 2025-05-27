# types.ts

**File Path**: `processing/types.ts`

## Description

Common types used across the processing system

## Interfaces

- `FileChange`
- `FileAnalysis`
- `ProcessingStats`
- `AnalysisOptions`
- `IncrementalProcessorOptions`
- `VectorMetadata`

## Documentation Comments

### Comment 1

File change information from git

### Comment 2

Analysis of a single file

### Comment 3

Processing statistics

### Comment 4

Analysis options for file processing

### Comment 5

Options for incremental processing

### Comment 6

Vector metadata for storage

## Code Overview

```typescript
import { CodeChunk, ChunkStrategyType } from '../vectorizers/types';

// Key exports:
export interface FileChange { ... }
export interface FileAnalysis { ... }
export interface ProcessingStats { ... }
export interface AnalysisOptions { ... }
export interface IncrementalProcessorOptions { ... }
export interface VectorMetadata { ... }
```

## File Statistics

- **Lines of Code**: 98
- **File Size**: 2064 bytes
- **Last Modified**: 2025-05-22T12:22:37.005Z

