# sse-handler.ts

**File Path:** `src/mcp/sse/sse-handler.ts`

## Overview

SSE (Server-Sent Events) Handler for MCP Tools

Provides real-time streaming communication for MCP Inspector integration
without STDIO bridge compatibility issues.

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

## Additional Documentation

### Comment 1

SSE connection management for MCP tools

### Comment 2

Initialize SSE connection for MCP Inspector

### Comment 3

Send Server-Sent Event to client

### Comment 4

Broadcast event to all active connections

### Comment 5

Handle MCP tool execution via SSE

### Comment 6

Execute Pinecone handler

### Comment 7

Execute GitHub handler

### Comment 8

Execute HuggingFace handler

### Comment 9

Execute other handlers (Setup, Search, Processing, etc.)

### Comment 10

Handle SSE health check

### Comment 11

Handle SSE tool listing

### Comment 12

Close all active connections

## File Statistics

- **Lines of Code**: 363
- **File Size**: 12555 bytes
- **Last Modified**: 2025-05-25T08:59:15.596Z

