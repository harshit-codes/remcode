# pipeline.ts

**File Path**: `processing/pipeline.ts`

## Description

Main processing pipeline that orchestrates incremental code analysis and vectorization

## Classes

- `ProcessingPipeline`

## Documentation Comments

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

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { ChangeDetector } from './change-detector';
import { FileAnalyzer } from './file-analyzer';
import { IncrementalProcessor } from './incremental';
import { StateManager } from './state-manager';
// ... 1 more imports

// Key exports:
export class ProcessingPipeline { ... }
```

## File Statistics

- **Lines of Code**: 232
- **File Size**: 7285 bytes
- **Last Modified**: 2025-05-22T12:32:31.457Z

