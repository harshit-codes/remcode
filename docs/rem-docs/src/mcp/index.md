# index.ts

**File Path:** `src/mcp/index.ts`

## Overview

MCP Server Module

This module provides Model Context Protocol (MCP) server functionality
to allow AI assistants to interact with the remcode tools.

Get MCP tool specifications for all available tools

## Dependencies

- `../utils/logger`
- `./handlers/pinecone`
- `./handlers/github`
- `./handlers/huggingface`
- `./handlers/setup`
- `./handlers/search`
- `./handlers/processing`
- `./handlers/repository`
- `./handlers/remcode`
- `./validation/simple-validator`
- `./sse/mcp-sse-handler`

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
- `githubToken`
- `pineconeApiKey`
- `huggingfaceToken`
- `corsOptions`
- `toolHandlers`
- `tool`
- `validation`
- `errorMessage`
- `errorMessage`

