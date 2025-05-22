# config.ts

**File Path:** `utils/config.ts`

## Overview

Configuration interface with strong typing

## Dependencies

- `./logger`

## Interfaces

### `RemcodeConfig`

**Properties:**

- `ignore: string[];`
- `analysis: {`
- `depth: number;`
- `quality: {`
- `enabled: boolean;`
- `complexityThreshold: number;`
- `};`
- `dependencies: {`
- `enabled: boolean;`
- `includeExternal: boolean;`
- `};`
- `};`
- `vectorization: {`
- `chunking: {`
- `moduleLevelSize: number;`
- `functionLevelSize: number;`
- `overlapFactor: number;`
- `};`
- `embedding: {`
- `model: string;`
- `fallbackModel: string;`
- `batchSize: number;`
- `};`
- `storage: {`
- `provider: 'pinecone' | 'local' | 'custom';`
- `indexes: {`
- `moduleName: string;`
- `functionName: string;`
- `};`
- `pinecone?: {`
- `apiKey?: string;`
- `environment?: string;`
- `namespace?: string;`
- `};`
- `};`
- `};`
- `github?: {`
- `token?: string;`
- `cacheDir?: string;`
- `};`
- `server?: {`
- `port: number;`
- `host: string;`
- `};`

## Functions

### `loadConfig()`

**Parameters:**

- `configPath?: string`

**Returns:** `RemcodeConfig`

### `saveConfig()`

**Parameters:**

- `config: Partial<RemcodeConfig>`
- `configPath: string`

**Returns:** `void`

### `getConfigValue()`

### `validateConfig()`

**Parameters:**

- `config: RemcodeConfig`

**Returns:** ``

