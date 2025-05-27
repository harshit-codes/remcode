# processing.ts

**File Path**: `mcp/handlers/processing.ts`

## Description

Trigger repository reprocessing

## Classes

- `ProcessingMCPHandler`

## Interfaces

- `ProcessingOptions`
- `ProcessingStatusResponse`

## Documentation Comments

### Comment 1

Get current processing status

### Comment 2

Get workflow processing history

### Comment 3

Cancel a running workflow

### Comment 4

Retry a failed workflow

### Comment 5

Get workflow logs

### Comment 6

Get processing metrics and analytics

### Comment 7

Get workflow analytics and performance metrics

### Comment 8

Monitor workflow health and get recommendations

### Comment 9

Get automated workflow recommendations

## Code Overview

```typescript
import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { StateManager, RemcodeState } from '../../processing/state-manager';
import { WorkflowMonitor } from '../../workflows/monitor';
import { WorkflowGenerator } from '../../workflows/generator';
// ... 1 more imports

// Key exports:
export class ProcessingMCPHandler { ... }
export interface ProcessingOptions { ... }
export interface ProcessingStatusResponse { ... }
```

## File Statistics

- **Lines of Code**: 591
- **File Size**: 17803 bytes
- **Last Modified**: 2025-05-23T18:20:58.502Z

