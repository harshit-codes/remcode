# search.ts

**File Path**: `mcp/handlers/search.ts`

## Description

Get the context extractor from unified search

## Classes

- `SearchMCPHandler`

## Documentation Comments

### Comment 1

Get the similarity analyzer from unified search

### Comment 2

Unified search handler that automatically processes queries

### Comment 3

Legacy search handler (deprecated - use handleSearch instead)

## Code Overview

```typescript
import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SemanticSearch } from '../../search/semantic';
import { ContextExtractor } from '../../search/context-extractor';
import { SimilarityAnalyzer } from '../../search/similarity';
// ... 1 more imports

// Key exports:
export class SearchMCPHandler { ... }
```

## File Statistics

- **Lines of Code**: 176
- **File Size**: 5835 bytes
- **Last Modified**: 2025-05-25T08:13:05.926Z

