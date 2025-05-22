# source.ts

**File Path:** `utils/source.ts`

## Overview

Source types supported by the resolver

## Dependencies

- `./logger`

## Interfaces

### `ParsedSource`

**Properties:**

- `type: SourceType;`
- `owner?: string;`
- `repo?: string;`
- `branch?: string;`
- `path?: string;`
- `url?: string;`
- `localPath?: string;`
- `originalSource: string;`

## Functions

### `resolveSource()`

**Parameters:**

- `source: string`
- `options: SourceOptions = {}`

**Returns:** `Promise<ResolvedSource>`

### `detectLanguages()`

**Parameters:**

- `directory: string`

**Returns:** `Promise<Record<string, number>>`

