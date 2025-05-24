# query-processor.ts

**File Path:** `src/search/query-processor.ts`

## Overview

Represents the type of query to be performed

Represents the expected type of result

Represents the possible query intents

Represents a processed search query with metadata

Filters that can be applied to search queries

Language pattern rules for common programming terms

Class for processing and optimizing code search queries

Process a raw search query into a structured form with metadata
@param query The raw search query
@returns Processed query with metadata

Normalize a query by trimming, converting to lowercase, and removing excess whitespace
@param query The raw query
@returns Normalized query

Determine the metadata for a query based on pattern matching
@param query The normalized query
@returns Query metadata including type, intent, and expected result type

Extract filters from a query string
@param query The normalized query
@returns Extracted filters

Optimize a query based on its determined type
@param query The cleaned query
@param queryType The type of query
@returns Optimized query

Optimize a query for semantic search
@param query The cleaned query
@returns Optimized semantic query

Optimize a query for exact search
@param query The cleaned query
@returns Optimized exact query

Optimize a query for pattern search
@param query The cleaned query
@returns Optimized pattern query

Optimize a query for context search
@param query The cleaned query
@returns Optimized context query

Calculate a confidence score for the query interpretation
@param query The normalized query
@param queryType The determined query type
@param intent The determined intent
@returns Confidence score between 0 and 1

## Dependencies

- `../utils/logger`

## Classes

### `QueryProcessor`

```typescript
class QueryProcessor {
// ... implementation
}
```

## Interfaces

### `ProcessedQuery`

```typescript
interface ProcessedQuery {
// ... properties
}
```

### `QueryFilters`

```typescript
interface QueryFilters {
// ... properties
}
```

### `PatternRule`

```typescript
interface PatternRule {
// ... properties
}
```

## Variables

- `logger`
- `normalizedQuery`
- `filters`
- `processedQuery`
- `confidence`
- `queryType`
- `intent`
- `expectedResultType`
- `cleanedQuery`
- `match`
- `match`
- `rule`
- `filters`
- `languageMatch`
- `fileTypeMatch`
- `pathMatch`
- `complexityMatch`
- `includeMatches`
- `excludeMatches`
- `stopWords`
- `optimized`
- `word`
- `regex`
- `symbols`
- `longerSymbols`
- `confidence`
- `filterCount`

