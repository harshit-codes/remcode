# mcp-sse-handler.ts

**File Path:** `src/mcp/sse/mcp-sse-handler.ts`

## Overview

MCP-Compatible SSE Handler

Implements proper JSON-RPC 2.0 over Server-Sent Events for MCP Inspector compatibility.

## Dependencies

- `express`
- `../../utils/logger`
- `../validation/simple-validator`

## Classes

### `MCPSSEHandler`

```typescript
class MCPSSEHandler {
// ... implementation
}
```

## Interfaces

### `JsonRpcRequest`

```typescript
interface JsonRpcRequest {
// ... properties
}
```

### `JsonRpcResponse`

```typescript
interface JsonRpcResponse {
// ... properties
}
```

### `JsonRpcNotification`

```typescript
interface JsonRpcNotification {
// ... properties
}
```

## Variables

- `logger`
- `connectionId`
- `jsonRpcRequest`
- `errorResponse`
- `response`
- `errorMessage`
- `validation`
- `result`
- `action`

