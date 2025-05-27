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
function processCommand() {
  // ... implementation
}
```

### `buildProcessingOptions()`

```typescript
function buildProcessingOptions() {
  // ... implementation
}
```

### `determineProcessingType()`

```typescript
function determineProcessingType() {
  // ... implementation
}
```

### `showDryRun()`

```typescript
function showDryRun() {
  // ... implementation
}
```

### `generateProcessingReport()`

```typescript
function generateProcessingReport() {
  // ... implementation
}
```

### `generateErrorReport()`

```typescript
function generateErrorReport() {
  // ... implementation
}
```

### `updateProcessingState()`

```typescript
function updateProcessingState() {
  // ... implementation
}
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

## File Statistics

- **Lines of Code**: 285
- **File Size**: 10742 bytes
- **Last Modified**: 2025-05-23T18:23:08.000Z

