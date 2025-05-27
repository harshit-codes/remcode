# sse-handler.ts

**File Path**: `mcp/sse/sse-handler.ts`

## Description

SSE (Server-Sent Events) Handler for MCP Tools
 
 Provides real-time streaming communication for MCP Inspector integration
 without STDIO bridge compatibility issues.

## Classes

- `SSEHandler`

## Documentation Comments

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

## Code Overview

```typescript
import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SimpleValidator } from '../validation/simple-validator';

// Key exports:
export class SSEHandler { ... }
```

## File Statistics

- **Lines of Code**: 363
- **File Size**: 12555 bytes
- **Last Modified**: 2025-05-25T08:59:15.596Z

