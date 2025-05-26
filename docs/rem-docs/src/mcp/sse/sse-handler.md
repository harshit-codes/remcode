# sse-handler.ts

**File Path:** `src/mcp/sse/sse-handler.ts`

## Overview

SSE (Server-Sent Events) Handler for MCP Tools

Provides real-time streaming communication for MCP Inspector integration
without STDIO bridge compatibility issues.

SSE connection management for MCP tools

Initialize SSE connection for MCP Inspector

Send Server-Sent Event to client

Broadcast event to all active connections

Handle MCP tool execution via SSE

Execute Pinecone handler

Execute GitHub handler

Execute HuggingFace handler

Execute other handlers (Setup, Search, Processing, etc.)

Handle SSE health check

Handle SSE tool listing

Close all active connections

## Dependencies

- `express`
- `../../utils/logger`
- `../validation/simple-validator`

## Classes

### `SSEHandler`

```typescript
class SSEHandler {
// ... implementation
}
```

## Variables

- `logger`
- `connectionId`
- `requestId`
- `validation`
- `result`
- `errorMessage`
- `action`
- `action`
- `action`
- `tools`

