# index.ts

**File Path:** `src/mcp/index.ts`

## Overview

MCP Server Module

This module provides Model Context Protocol (MCP) server functionality
to allow AI assistants to interact with the remcode tools.

## Dependencies

- `./handlers/pinecone`
- `./handlers/github`
- `./handlers/huggingface`
- `./handlers/setup`
- `./handlers/search`
- `./handlers/processing`
- `./handlers/repository`
- `./handlers/remcode`
- `./swe-guidance-middleware`
- `../utils/logger`
- `./validation/simple-validator`
- `./sse/sse-handler`

## Classes

### `MCPServer`

```typescript
class MCPServer {
// ... implementation
}
```

## Interfaces

### `MCPServerOptions`

```typescript
interface MCPServerOptions {
// ... properties
}
```

## Variables

- `logger`
- `corsOptions`
- `connectionId`
- `toolHandlers`
- `validation`
- `errorMessage`

