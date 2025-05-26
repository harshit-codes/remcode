# process.ts

**File Path:** `src/commands/process.ts`

## Overview

No overview provided.

## Dependencies

- `commander`
- `../processing/pipeline`
- `../processing/state-manager`
- `../utils/config`
- `../utils/logger`
- `../processing/types`

## Interfaces

### `ProcessOptions`

```typescript
interface ProcessOptions {
// ... properties
}
```

## Functions

### `processCommand()`

```typescript
export function processCommand()
```

### `buildProcessingOptions()`

```typescript
export function buildProcessingOptions()
```

### `determineProcessingType()`

```typescript
export function determineProcessingType()
```

### `showDryRun()`

```typescript
export function showDryRun()
```

### `generateProcessingReport()`

```typescript
export function generateProcessingReport()
```

### `generateErrorReport()`

```typescript
export function generateErrorReport()
```

### `updateProcessingState()`

```typescript
export function updateProcessingState()
```

## Variables

- `logger`
- `spinner`
- `repoPath`
- `configPath`
- `config`
- `processingOptions`
- `stateManager`
- `processingType`
- `pipeline`
- `startTime`
- `result`
- `endTime`
- `duration`
- `errorMessage`
- `pineconeApiKey`
- `huggingfaceToken`
- `processingOptions`
- `stateExists`
- `state`
- `report`
- `finalReportPath`
- `report`
- `finalReportPath`
- `stats`

