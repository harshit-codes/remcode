# query-processor.ts

**File Path:** `search/query-processor.ts`

## Overview

Represents the type of query to be performed

## Dependencies

- `../utils/logger`

## Classes

### `QueryProcessor`

**Methods:**

- `processQuery()`
- `normalizeQuery()`
- `determineQueryMetadata()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `for()`
- `if()`
- `if()`
- `if()`
- `if()`
- `extractFilters()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `optimizeQuery()`
- `switch()`
- `optimizeForSemanticSearch()`
- `for()`
- `RegExp()`
- `if()`
- `if()`
- `optimizeForExactSearch()`
- `if()`
- `optimizeForPatternSearch()`
- `if()`
- `optimizeForContextSearch()`
- `if()`
- `if()`
- `calculateConfidence()`
- `if()`
- `if()`
- `length()`
- `if()`
- `presence()`

## Interfaces

### `ProcessedQuery`

**Properties:**

- `originalQuery: string;`
- `processedQuery: string;`
- `queryType: QueryType;`
- `intent: QueryIntent;`
- `filters: QueryFilters;`
- `expectedResultType: ResultType;`
- `confidence: number; // 0-1 confidence in the interpretation`

### `QueryFilters`

**Properties:**

- `language?: string | string[];`
- `fileType?: string | string[];`
- `complexity?: 'low' | 'medium' | 'high' | 'any';`
- `path?: string;`
- `author?: string;`
- `dateRange?: {`
- `from?: Date;`
- `to?: Date;`
- `};`
- `minTokens?: number;`
- `maxTokens?: number;`
- `hasComments?: boolean;`
- `hasTests?: boolean;`
- `includePatterns?: string[];`
- `excludePatterns?: string[];`

