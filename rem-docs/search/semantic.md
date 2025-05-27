# semantic.ts

**File Path**: `search/semantic.ts`

## Description

Configuration options for semantic search

## Classes

- `SemanticSearch`

## Interfaces

- `SemanticSearchOptions`
- `SearchResult`

## Documentation Comments

### Comment 1

Represents a single search result

### Comment 2

Handles semantic code search using vector embeddings

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { PineconeStorage } from '../vectorizers/storage/pinecone';
import { EmbeddingManager } from '../vectorizers/embedders/manager';
import { CodeChunk } from '../vectorizers/types';
import * as dotenv from 'dotenv';

// Key exports:
export class SemanticSearch { ... }
export interface SemanticSearchOptions { ... }
export interface SearchResult { ... }
```

## File Statistics

- **Lines of Code**: 212
- **File Size**: 6853 bytes
- **Last Modified**: 2025-05-23T08:43:24.231Z

