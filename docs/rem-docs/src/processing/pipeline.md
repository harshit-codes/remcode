# pipeline.ts

**File Path:** `src/processing/pipeline.ts`

## Overview

Main processing pipeline that orchestrates incremental code analysis and vectorization

Execute the full incremental processing pipeline

Process all files in the repository (full processing)

Get status of the processing pipeline

Check if there are pending changes to process

Get the last processed commit from state

Create empty stats for when no processing is needed

Find all code files in the repository

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

