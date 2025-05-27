# query-processor.ts

**File Path:** `src/search/query-processor.ts`

## Overview

Represents the type of query to be performed

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

## Additional Documentation

### Comment 1

Represents the expected type of result

### Comment 2

Represents the possible query intents

### Comment 3

Represents a processed search query with metadata

### Comment 4

Filters that can be applied to search queries

### Comment 5

Language pattern rules for common programming terms

### Comment 6

Class for processing and optimizing code search queries

### Comment 7

Process a raw search query into a structured form with metadata
@param query The raw search query
@returns Processed query with metadata

### Comment 8

Normalize a query by trimming, converting to lowercase, and removing excess whitespace
@param query The raw query
@returns Normalized query

### Comment 9

Determine the metadata for a query based on pattern matching
@param query The normalized query
@returns Query metadata including type, intent, and expected result type

### Comment 10

Extract filters from a query string
@param query The normalized query
@returns Extracted filters

### Comment 11

Optimize a query based on its determined type
@param query The cleaned query
@param queryType The type of query
@returns Optimized query

### Comment 12

Optimize a query for semantic search
@param query The cleaned query
@returns Optimized semantic query

### Comment 13

Optimize a query for exact search
@param query The cleaned query
@returns Optimized exact query

### Comment 14

Optimize a query for pattern search
@param query The cleaned query
@returns Optimized pattern query

### Comment 15

Optimize a query for context search
@param query The cleaned query
@returns Optimized context query

### Comment 16

Calculate a confidence score for the query interpretation
@param query The normalized query
@param queryType The determined query type
@param intent The determined intent
@returns Confidence score between 0 and 1

## File Statistics

- **Lines of Code**: 439
- **File Size**: 13043 bytes
- **Last Modified**: 2025-05-22T09:25:19.915Z

