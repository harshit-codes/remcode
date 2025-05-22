# remcode-config.ts

**File Path:** `setup/remcode-config.ts`

## Overview

Available embedding models

## Dependencies

- `../utils/logger`

## Classes

### `RemcodeConfigManager`

**Methods:**

- `createInitialConfig()`
- `if()`
- `if()`
- `Error()`
- `catch()`
- `String()`
- `Error()`
- `readConfig()`
- `if()`
- `Error()`
- `catch()`
- `String()`
- `Error()`
- `updateConfig()`
- `catch()`
- `Date()`
- `if()`
- `if()`
- `Error()`
- `catch()`
- `String()`
- `Error()`
- `updateProcessingStatus()`
- `Date()`
- `if()`
- `if()`
- `Date()`
- `catch()`
- `String()`
- `Error()`
- `validateConfig()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `buildInitialConfig()`
- `Date()`
- `Date()`
- `Date()`
- `if()`
- `isObject()`
- `if()`
- `if()`
- `if()`
- `upgradeConfig()`
- `if()`
- `if()`
- `if()`
- `if()`
- `configExists()`
- `deleteConfig()`
- `if()`
- `catch()`
- `String()`

## Interfaces

### `RepositoryConfig`

**Properties:**

- `name: string;`
- `owner: string;`
- `url: string;`
- `defaultBranch: string;`
- `visibility?: 'public' | 'private';`
- `description?: string;`

### `ProcessingConfig`

**Properties:**

- `lastCommit: string;`
- `lastUpdate: string;`
- `status: ProcessingStatus;`
- `error?: string;`
- `lastProcessingDuration?: number;`

### `VectorizationConfig`

**Properties:**

- `provider: VectorProvider;`
- `indexName: string;`
- `namespace: string;`
- `embeddingModel: EmbeddingModel;`
- `embeddingDimension: number;`
- `chunkSize?: number;`
- `chunkOverlap?: number;`
- `customEndpoint?: string;`

### `StatisticsConfig`

**Properties:**

- `filesProcessed: number;`
- `chunksCreated: number;`
- `vectorsStored: number;`
- `lastUpdated?: string;`
- `totalTokens?: number;`
- `processingTime?: number;`

### `AdvancedConfig`

**Properties:**

- `ignorePaths?: string[];`
- `includeExtensions?: string[];`
- `excludeExtensions?: string[];`
- `maxFileSize?: number;`
- `customPrompts?: Record<string, string>;`
- `useCache?: boolean;`
- `webhooks?: WebhookConfig[];`

### `WebhookConfig`

**Properties:**

- `url: string;`
- `events: string[];`
- `secret?: string;`
- `active: boolean;`

### `RemcodeConfig`

**Properties:**

- `version: string;`
- `initialized: string;`
- `repository: RepositoryConfig;`
- `processing: ProcessingConfig;`
- `vectorization: VectorizationConfig;`
- `statistics: StatisticsConfig;`
- `advanced?: AdvancedConfig;`
- `lastModified?: string;`

### `ConfigValidationResult`

**Properties:**

- `valid: boolean;`
- `errors: string[];`
- `warnings: string[];`

