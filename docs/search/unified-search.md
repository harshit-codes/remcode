# unified-search.ts

**File Path:** `search/unified-search.ts`

## Overview

Enhanced search result with full content and metadata

## Dependencies

- `../utils/logger`
- `./semantic`
- `./query-processor`
- `./context-extractor`
- `./similarity`

## Classes

### `UnifiedSearch`

Perform unified search with automatic query processing and enhancement

```typescript
class UnifiedSearch {
// ... implementation
}
```

**Methods:**

#### `search()`

Perform unified search with automatic query processing and enhancement

```typescript
search(
```

#### `generateHighlights()`

Generate highlights for matched content

```typescript
generateHighlights(content: string, query: string): string[] {
```

#### `generateRelevanceExplanation()`

Generate explanation of why a result is relevant

```typescript
generateRelevanceExplanation(
```

#### `applyIntentBasedFiltering()`

Apply filtering based on query intent

```typescript
applyIntentBasedFiltering(
```

#### `sortResultsByRelevance()`

Sort results by relevance considering multiple factors

```typescript
sortResultsByRelevance(
```

#### `cleanCache()`

Clean old cache entries

```typescript
cleanCache(): void {
```

## Interfaces

### `EnhancedSearchResult`

**Extends:** SearchResult

```typescript
interface EnhancedSearchResult extends SearchResult {
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

