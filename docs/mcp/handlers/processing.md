# processing.ts

**File Path:** `mcp/handlers/processing.ts`

## Overview

Trigger repository reprocessing

## Dependencies

- `express`
- `../../utils/logger`
- `../../processing/state-manager`
- `../../workflows/monitor`
- `../../workflows/generator`
- `../../workflows/templates`

## Classes

### `ProcessingMCPHandler`

**Methods:**

- `StateManager()`
- `WorkflowMonitor()`
- `WorkflowGenerator()`
- `handleTriggerReprocessing()`
- `reprocessing()`
- `if()`
- `if()`
- `if()`
- `if()`
- `Error()`
- `catch()`
- `String()`
- `catch()`
- `String()`
- `handleGetProcessingStatus()`
- `if()`
- `parseInt()`
- `catch()`
- `String()`
- `catch()`
- `String()`
- `handleGetProcessingHistory()`
- `if()`
- `parseInt()`
- `catch()`
- `String()`

## Interfaces

### `ProcessingOptions`

**Properties:**

- `type: 'full' | 'incremental' | 'vectorize' | 'analyze';`
- `force: boolean;`
- `repository?: string;`
- `owner?: string;`
- `repo?: string;`
- `branch?: string;`
- `token?: string;`

