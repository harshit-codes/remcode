# pipeline.ts

**File Path:** `src/processing/pipeline.ts`

## Overview

Main processing pipeline that orchestrates incremental code analysis and vectorization

## Dependencies

- `../utils/logger`
- `./change-detector`
- `./file-analyzer`
- `./incremental`
- `./state-manager`
- `./types`

## Classes

### `ProcessingPipeline`

```typescript
class ProcessingPipeline {
  // ... implementation
}
```

## Variables

- `logger`
- `currentCommit`
- `lastCommit`
- `changes`
- `analyses`
- `stats`
- `errorMsg`
- `allFiles`
- `changes`
- `analyses`
- `stats`
- `currentCommit`
- `errorMsg`
- `state`
- `currentCommit`
- `lastCommit`
- `state`
- `codeExtensions`
- `allFiles`
- `gitFiles`
- `file`
- `ext`

## Additional Documentation

### Comment 1

Execute the full incremental processing pipeline

### Comment 2

Process all files in the repository (full processing)

### Comment 3

Get status of the processing pipeline

### Comment 4

Check if there are pending changes to process

### Comment 5

Get the last processed commit from state

### Comment 6

Create empty stats for when no processing is needed

### Comment 7

Find all code files in the repository

## File Statistics

- **Lines of Code**: 232
- **File Size**: 7285 bytes
- **Last Modified**: 2025-05-22T12:32:31.457Z

