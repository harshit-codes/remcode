# query-processor.ts

**File Path:** `search/query-processor.ts`

## Overview

Represents the type of query to be performed

## Dependencies

- `../utils/logger`

## Classes

### `QueryProcessor`

Process a raw search query into a structured form with metadata

```typescript
class QueryProcessor {
// ... implementation
}
```

**Methods:**

#### `processQuery()`

Process a raw search query into a structured form with metadata
@param query The raw search query
@returns Processed query with metadata

```typescript
processQuery(query: string): Promise<ProcessedQuery> {
```

#### `normalizeQuery()`

Normalize a query by trimming, converting to lowercase, and removing excess whitespace
@param query The raw query
@returns Normalized query

```typescript
normalizeQuery(query: string): string {
```

#### `determineQueryMetadata()`

Determine the metadata for a query based on pattern matching
@param query The normalized query
@returns Query metadata including type, intent, and expected result type

```typescript
determineQueryMetadata(query: string): {
```

#### `extractFilters()`

Extract filters from a query string
@param query The normalized query
@returns Extracted filters

```typescript
extractFilters(query: string): Promise<QueryFilters> {
```

#### `optimizeQuery()`

Optimize a query based on its determined type
@param query The cleaned query
@param queryType The type of query
@returns Optimized query

```typescript
optimizeQuery(query: string, queryType: QueryType): Promise<string> {
```

#### `optimizeForSemanticSearch()`

Optimize a query for semantic search
@param query The cleaned query
@returns Optimized semantic query

```typescript
optimizeForSemanticSearch(query: string): Promise<string> {
```

#### `optimizeForExactSearch()`

Optimize a query for exact search
@param query The cleaned query
@returns Optimized exact query

```typescript
optimizeForExactSearch(query: string): string {
    // For exact searches, we preserve the query but ensure quotes if not present
```

#### `optimizeForPatternSearch()`

Optimize a query for pattern search
@param query The cleaned query
@returns Optimized pattern query

```typescript
optimizeForPatternSearch(query: string): string {
    // For pattern searches, we try to build a better regex if possible
```

#### `optimizeForContextSearch()`

Optimize a query for context search
@param query The cleaned query
@returns Optimized context query

```typescript
optimizeForContextSearch(query: string): string {
    // For context searches, we want to focus on function/variable names
    // Extract likely code symbols from the query
```

#### `calculateConfidence()`

Calculate a confidence score for the query interpretation
@param query The normalized query
@param queryType The determined query type
@param intent The determined intent
@returns Confidence score between 0 and 1

```typescript
calculateConfidence(query: string, queryType: QueryType, intent: QueryIntent): number {
    // Base confidence
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

