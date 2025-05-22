# semantic.ts

**File Path:** `search/semantic.ts`

## Overview

Configuration options for semantic search

## Dependencies

- `../utils/logger`
- `../vectorizers/storage/pinecone`
- `../vectorizers/embedders/manager`
- `../vectorizers/types`

## Classes

### `SemanticSearch`

```typescript
class SemanticSearch {
// ... implementation
}
```

**Methods:**

#### `initialize()`

```typescript
initialize(): Promise<void> {
```

#### `search()`

```typescript
search(query: string, topK: number = 10, filters?: Record<string, any>): Promise<SearchResult[]> {
```

#### `searchSimilarCode()`

```typescript
searchSimilarCode(codeSnippet: string, topK: number = 5): Promise<SearchResult[]> {
```

#### `searchPatterns()`

```typescript
searchPatterns(pattern: string, topK: number = 10): Promise<SearchResult[]> {
```

#### `searchFunctionality()`

```typescript
searchFunctionality(description: string, topK: number = 10): Promise<SearchResult[]> {
```

#### `formatSearchResults()`

```typescript
formatSearchResults(matches: any[]): SearchResult[] {
```

#### `getStats()`

```typescript
getStats(): Promise<any> {
```

## Interfaces

### `SemanticSearchOptions`

```typescript
interface SemanticSearchOptions {
// ... properties
}
```

### `SearchResult`

```typescript
interface SearchResult {
// ... properties
}
```

