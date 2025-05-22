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

Trigger repository reprocessing

```typescript
class ProcessingMCPHandler {
// ... implementation
}
```

**Methods:**

#### `handleTriggerReprocessing()`

Trigger repository reprocessing

```typescript
handleTriggerReprocessing(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGetProcessingStatus()`

Get current processing status

```typescript
handleGetProcessingStatus(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGetProcessingHistory()`

Get workflow processing history

```typescript
handleGetProcessingHistory(req: Request, res: Response, params?: any): Promise<void> {
```

## Interfaces

### `ProcessingOptions`

```typescript
interface ProcessingOptions {
// ... properties
}
```

