# unified-search.ts

**File Path:** `src/search/unified-search.ts`

## Overview

Enhanced search result with full content and metadata

Options for unified search

Result of unified search operation

Unified search engine that combines all search capabilities

Get the context extractor instance

Get the similarity analyzer instance

Get the semantic search instance

Perform unified search with automatic query processing and enhancement

Perform exact match search

Perform pattern-based search

Perform context-aware search

Enhance search results with actual file content and metadata

Get file content with caching

Get file statistics

Generate highlights for matched content

Generate explanation of why a result is relevant

Apply filtering based on query intent

Sort results by relevance considering multiple factors

Clean old cache entries

## Dependencies

- `../utils/logger`
- `./semantic`
- `./query-processor`
- `./context-extractor`
- `./similarity`

## Classes

### `UnifiedSearch`

```typescript
class UnifiedSearch {
// ... implementation
}
```

### `definitions`

```typescript
class definitions {
// ... implementation
}
```

## Interfaces

### `EnhancedSearchResult`

```typescript
interface EnhancedSearchResult {
// ... properties
}
```

### `UnifiedSearchOptions`

```typescript
interface UnifiedSearchOptions {
// ... properties
}
```

### `UnifiedSearchResult`

```typescript
interface UnifiedSearchResult {
// ... properties
}
```

## Functions

### `calls()`

```typescript
export function calls()
```

### `and()`

```typescript
export function and()
```

### `calls()`

```typescript
export function calls()
```

## Variables

- `logger`
- `startTime`
- `cacheKey`
- `cached`
- `processedQuery`
- `filters`
- `searchResults`
- `enhancedResults`
- `filteredResults`
- `sortedResults`
- `result`
- `cleanQuery`
- `results`
- `content`
- `results`
- `pattern`
- `results`
- `metadata`
- `enhancedResults`
- `enhancementPromises`
- `enhanced`
- `fileContent`
- `lines`
- `startLine`
- `endLine`
- `contextStart`
- `contextEnd`
- `enhanced`
- `cached`
- `content`
- `stats`
- `content`
- `highlights`
- `queryTerms`
- `lines`
- `line`
- `lowerLine`
- `term`
- `explanations`
- `metadata`
- `content`
- `complexityIndicators`
- `scoreA`
- `scoreB`
- `expectedLang`
- `now`

