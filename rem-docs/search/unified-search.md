# unified-search.ts

**File Path**: `search/unified-search.ts`

## Description

Enhanced search result with full content and metadata

## Classes

- `UnifiedSearch`

## Interfaces

- `EnhancedSearchResult`
- `UnifiedSearchOptions`
- `UnifiedSearchResult`

## Documentation Comments

### Comment 1

Options for unified search

### Comment 2

Result of unified search operation

### Comment 3

Unified search engine that combines all search capabilities

### Comment 4

Get the context extractor instance

### Comment 5

Get the similarity analyzer instance

### Comment 6

Get the semantic search instance

### Comment 7

Perform unified search with automatic query processing and enhancement

### Comment 8

Perform exact match search

### Comment 9

Perform pattern-based search

### Comment 10

Perform context-aware search

### Comment 11

Enhance search results with actual file content and metadata

### Comment 12

Get file content with caching

### Comment 13

Get file statistics

### Comment 14

Generate highlights for matched content

### Comment 15

Generate explanation of why a result is relevant

### Comment 16

Apply filtering based on query intent

### Comment 17

Sort results by relevance considering multiple factors

### Comment 18

Clean old cache entries

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { SemanticSearch, SearchResult } from './semantic';
import { QueryProcessor, ProcessedQuery, QueryFilters } from './query-processor';
import { ContextExtractor } from './context-extractor';
import { SimilarityAnalyzer } from './similarity';
// ... 2 more imports

// Key exports:
export class UnifiedSearch { ... }
export interface EnhancedSearchResult { ... }
export interface UnifiedSearchOptions { ... }
export interface UnifiedSearchResult { ... }
```

## File Statistics

- **Lines of Code**: 569
- **File Size**: 18001 bytes
- **Last Modified**: 2025-05-24T07:26:06.977Z

