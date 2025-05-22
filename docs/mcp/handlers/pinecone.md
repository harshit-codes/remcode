# pinecone.ts

**File Path:** `mcp/handlers/pinecone.ts`

## Overview

Pinecone MCP Handler

Handles Pinecone-related MCP requests, allowing AI assistants
to interact with vector embeddings stored in Pinecone.

## Dependencies

- `express`
- `../../utils/logger`
- `../../vectorizers/storage/pinecone`

## Classes

### `PineconeMCPHandler`

```typescript
class PineconeMCPHandler {
// ... implementation
}
```

**Methods:**

#### `initialize()`

```typescript
initialize(): Promise<void> {
```

#### `handleRequest()`

```typescript
handleRequest(req: Request, res: Response): Promise<void> {
```

#### `handleToolRequest()`

```typescript
handleToolRequest(req: Request, res: Response): Promise<void> {
```

## Interfaces

### `PineconeMCPOptions`

```typescript
interface PineconeMCPOptions {
// ... properties
}
```

