# pinecone.ts

**File Path**: `mcp/handlers/pinecone.ts`

## Description

Pinecone MCP Handler
 
 Handles Pinecone-related MCP requests, allowing AI assistants
 to interact with vector embeddings stored in Pinecone.

## Classes

- `PineconeMCPHandler`

## Interfaces

- `PineconeMCPOptions`

## Code Overview

```typescript
import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { PineconeStorage } from '../../vectorizers/storage/pinecone';

// Key exports:
export class PineconeMCPHandler { ... }
export interface PineconeMCPOptions { ... }
```

## File Statistics

- **Lines of Code**: 192
- **File Size**: 6853 bytes
- **Last Modified**: 2025-05-21T18:16:05.977Z

