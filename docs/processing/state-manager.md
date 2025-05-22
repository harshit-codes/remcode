# state-manager.ts

**File Path:** `processing/state-manager.ts`

## Overview

Check if the .remcode file exists

## Dependencies

- `../utils/logger`

## Classes

### `StateManager`

**Methods:**

- `exists()`
- `catch()`
- `loadState()`
- `if()`
- `catch()`
- `String()`
- `initializeState()`
- `Date()`
- `saveState()`
- `if()`
- `Date()`
- `catch()`
- `String()`
- `Error()`
- `updateState()`
- `if()`
- `catch()`
- `String()`
- `Error()`
- `updateProcessingStatus()`
- `Date()`
- `if()`
- `updateStatistics()`
- `Date()`
- `updateVectorizationInfo()`
- `Date()`
- `updateRepositoryInfo()`
- `updateConfiguration()`
- `if()`
- `if()`
- `if()`
- `if()`
- `isObject()`

## Interfaces

### `RemcodeState`

**Properties:**

- `version: string;`
- `created: string;`
- `updated: string;`
- `repository?: {`
- `url?: string;`
- `path?: string;`
- `branch?: string;`
- `commit?: string;`
- `};`
- `processing: {`
- `status: 'idle' | 'analyzing' | 'vectorizing' | 'updating' | 'completed' | 'failed';`
- `lastCommit?: string;`
- `lastUpdated?: string;`
- `stats?: any;`
- `};`
- `vectorization: {`
- `model?: string;`
- `chunks?: number;`
- `vectors?: number;`
- `lastUpdated?: string;`
- `pineconeIndex?: string;`
- `pineconeNamespace?: string;`
- `};`
- `configuration: {`
- `includeTests?: boolean;`
- `includeComments?: boolean;`
- `chunkStrategy?: string;`
- `[key: string]: any;`
- `};`

