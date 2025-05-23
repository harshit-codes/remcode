# remcode.ts

**File Path:** `mcp/handlers/remcode.ts`

## Overview

MCP Handler for Remcode-specific operations
Temporarily simplified to avoid SWE module circular dependencies

## Dependencies

- `express`
- `../../utils/logger`

## Classes

### `RemcodeMCPHandler`

```typescript
class RemcodeMCPHandler {
// ... implementation
}
```

**Methods:**

#### `handleDefaultPrompt()`

```typescript
handleDefaultPrompt(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGetScenarios()`

```typescript
handleGetScenarios(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGetGuidelines()`

```typescript
handleGetGuidelines(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGetContextualGuidance()`

```typescript
handleGetContextualGuidance(req: Request, res: Response, params?: any): Promise<void> {
```

