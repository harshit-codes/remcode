# mcp-sse-handler.ts

**File Path:** `src/mcp/sse/mcp-sse-handler.ts`

## Overview

MCP-Compatible SSE Handler

Implements proper JSON-RPC 2.0 over Server-Sent Events for MCP Inspector compatibility.
FIXED: Parameter parsing for MCP Inspector integration.

FIXED: Handle tool call with proper MCP Inspector parameter parsing

Helper to call handler methods with proper error handling

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
- `toolName`
- `toolArgs`
- `validation`
- `result`
- `errorMessage`
- `mockReq`
- `result`
- `mockRes`

