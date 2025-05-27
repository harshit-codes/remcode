# huggingface.ts

**File Path**: `mcp/handlers/huggingface.ts`

## Description

HuggingFace MCP Handler
 
 Handles HuggingFace-related MCP requests, allowing AI assistants
 to generate embeddings for code vectorization.
 
 Fixed: Uses correct HuggingFace Inference API with working models

## Classes

- `HuggingFaceMCPHandler`

## Interfaces

- `HuggingFaceMCPOptions`

## Documentation Comments

### Comment 1

Find a working embedding model from our hierarchy

### Comment 2

Check if a model is healthy and available

### Comment 3

Get embedding from model using correct HuggingFace Inference API format
 Uses the same patterns as the working EmbeddingManager

### Comment 4

Process embedding result from API (same logic as EmbeddingManager)

### Comment 5

Preprocess text for better embedding quality (same as EmbeddingManager)

### Comment 6

Average token embeddings to get a single vector

## Code Overview

```typescript
import { Request, Response } from 'express';
import axios from 'axios';
import { getLogger } from '../../utils/logger';

// Key exports:
export class HuggingFaceMCPHandler { ... }
export interface HuggingFaceMCPOptions { ... }
```

## File Statistics

- **Lines of Code**: 425
- **File Size**: 14811 bytes
- **Last Modified**: 2025-05-25T22:47:10.900Z

