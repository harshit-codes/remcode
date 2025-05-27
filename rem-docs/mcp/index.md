# index.ts

**File Path**: `mcp/index.ts`

## Description

MCP Server Module
 
 This module provides Model Context Protocol (MCP) server functionality
 to allow AI assistants to interact with the remcode tools.

## Classes

- `MCPServer`

## Interfaces

- `MCPServerOptions`

## Documentation Comments

### Comment 1

Get MCP tool specifications for all available tools

## Code Overview

```typescript
import express from 'express';
import cors from 'cors';
import { getLogger } from '../utils/logger';
import { PineconeMCPHandler } from './handlers/pinecone';
import { GitHubMCPHandler } from './handlers/github';
// ... 8 more imports

// Key exports:
export class MCPServer { ... }
export interface MCPServerOptions { ... }
```

## File Statistics

- **Lines of Code**: 308
- **File Size**: 12221 bytes
- **Last Modified**: 2025-05-26T04:04:10.329Z

