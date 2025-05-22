# query-processor.ts

**File Path:** `search/query-processor.ts`

## Overview

Represents the type of query to be performed

## Dependencies

- `../utils/logger`

## Classes

### `QueryProcessor`

**Class Definition:**

```typescript
export class QueryProcessor {
  private patternRules: PatternRule[] = [
    // Implementation search patterns
    {
      regex: /how\s+(does|is|to)\s+|implement(ation)?\s+of\s+|\s+work(s|ing)?\s+/i,
      queryType: 'semantic',
      intent: 'find_implementation',
      resultType: 'function'
    },
    // Definition search patterns
    {
      regex: /define(d|s)?|declaration of|where is|locate\s+/i,
      queryType: 'exact',
      intent: 'find_definition',
      resultType: 'any'
    },
    // Usage search patterns
    {
      regex: /use(d|s)?\s+of|usage|call(s|ed|ing)?\s+to|reference(s|d)?\s+/i,
      queryType: 'context',
      intent: 'find_usage',
      resultType: 'any'
    },
    // Exact match patterns
    {
      regex: /exact(ly)?|precise(ly)?|literal(ly)?|\".*\"|\'.*\'/i,
      queryType: 'exact',
      intent: 'find_definition',
      resultType: 'any'
    },
    // Pattern match patterns
    {
      regex: /pattern|regex|regexp|regular expression|\s+like\s+|similar to/i,
      queryType: 'pattern',
      intent: 'find_similar',
      resultType: 'pattern'
    },
    // Complexity/bug search patterns
    {
      regex: /complex|complicated|bug(s|gy)?|error|issue|problem/i,
      queryType: 'semantic',
      intent: 'find_complexity',
      resultType: 'function'
    }
  ];

  /**
   * Process a raw search query into a structured form with metadata
   * @param query The raw search query
   * @returns Processed query with metadata
   */
  async processQuery(query: string): Promise<ProcessedQuery> {
    logger.info(`Processing query: "${query}"`);
    
    // Clean and normalize the query
    const normalizedQuery = this.normalizeQuery(query);
    
    // Extract filters from the query
    const filters = await this.extractFilters(normalizedQuery);
    
    // Determine query type and intent based on patterns
    const { queryType, intent, expectedResultType, cleanedQuery } = 
      this.determineQueryMetadata(normalizedQuery);
    
    // Optimize the query for the determined search type
    const processedQuery = await this.optimizeQuery(cleanedQuery, queryType);
    
    // Calculate confidence score based on pattern matches and query length
    const confidence = this.calculateConfidence(normalizedQuery, queryType, intent);
    
    return {
      originalQuery: query,
      processedQuery,
      queryType,
      intent,
      filters,
      expectedResultType,
      confidence
    };
  }

  /**
   * Normalize a query by trimming, converting to lowercase, and removing excess whitespace
   * @param query The raw query
   * @returns Normalized query
   */
  private normalizeQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[\?\!\;\:\/\\\.]/g, ' ')
      .trim();
  }

  /**
   * Determine the metadata for a query based on pattern matching
   * @param query The normalized query
   * @returns Query metadata including type, intent, and expected result type
   */
  private determineQueryMetadata(query: string): {
    queryType: QueryType;
    intent: QueryIntent;
    expectedResultType: ResultType;
    cleanedQuery: string;
  } {
    // Default values
    let queryType: QueryType = 'semantic';
    let intent: QueryIntent = 'find_implementation';
    let expectedResultType: ResultType = 'any';
    let cleanedQuery = query;
    
    // Check explicit type markers
    if (query.includes('"') || query.includes('\'')) {
      queryType = 'exact';
      // Extract the quoted content
      const match = query.match(/["']([^"']+)["']/);
      if (match && match[1]) {
        cleanedQuery = match[1];
      }
    }
    
    // Check for regex/pattern indicators
    if (query.includes('regex:') || query.includes('pattern:')) {
      queryType = 'pattern';
      // Extract the pattern
      const match = query.match(/(?:regex|pattern):\s*(.+)$/);
      if (match && match[1]) {
        cleanedQuery = match[1];
      }
    }
    
    // Check for file type specifications
    if (query.includes('file:') || query.includes('in:')) {
      expectedResultType = 'file';
    } else if (query.includes('class:') || query.includes('type:')) {
      expectedResultType = 'class';
    } else if (query.includes('function:') || query.includes('method:')) {
      expectedResultType = 'function';
    } else if (query.includes('module:')) {
      expectedResultType = 'module';
    }
    
    // Apply pattern rules to determine intent and refine types
    for (const rule of this.patternRules) {
      if (rule.regex.test(query)) {
        // If we've already set a more specific type from explicit markers, keep it
        if ((queryType === 'semantic' && rule.queryType !== 'semantic') ||
            (queryType === rule.queryType)) {
          queryType = rule.queryType;
        }
        
        // Set the intent based on the matched rule
        intent = rule.intent;
        
        // Only override result type if it's still 'any'
        if (expectedResultType === 'any') {
          expectedResultType = rule.resultType;
        }
        
        // Remove the matched pattern words for better semantic search
        if (queryType === 'semantic') {
          cleanedQuery = cleanedQuery.replace(rule.regex, ' ').trim();
        }
      }
    }
    
    return {
      queryType,
      intent,
      expectedResultType,
      cleanedQuery
    };
  }

  /**
   * Extract filters from a query string
   * @param query The normalized query
   * @returns Extracted filters
   */
  async extractFilters(query: string): Promise<QueryFilters> {
    logger.info('Extracting query filters');
    
    const filters: QueryFilters = {};
    
    // Extract language filter
    const languageMatch = query.match(/language:([\w\+\#]+)/);
    if (languageMatch) {
      filters.language = languageMatch[1];
    }
    
    // Extract file type filter
    const fileTypeMatch = query.match(/file(?:type|ext|extension)?:([\w\.]+)/);
    if (fileTypeMatch) {
      filters.fileType = fileTypeMatch[1];
    }
    
    // Extract path filter
    const pathMatch = query.match(/path:([\w\/\.\-\_]+)/);
    if (pathMatch) {
      filters.path = pathMatch[1];
    }
    
    // Extract complexity filter
    const complexityMatch = query.match(/complexity:(low|medium|high)/);
    if (complexityMatch) {
      filters.complexity = complexityMatch[1] as 'low' | 'medium' | 'high';
    }
    
    // Extract has comments filter
    if (query.includes('has:comments')) {
      filters.hasComments = true;
    }
    
    // Extract has tests filter
    if (query.includes('has:tests')) {
      filters.hasTests = true;
    }
    
    // Extract include/exclude patterns
    const includeMatches = query.match(/include:([\w\/\.\-\_]+)/g);
    if (includeMatches) {
      filters.includePatterns = includeMatches.map(m => m.replace('include:', ''));
    }
    
    const excludeMatches = query.match(/exclude:([\w\/\.\-\_]+)/g);
    if (excludeMatches) {
      filters.excludePatterns = excludeMatches.map(m => m.replace('exclude:', ''));
    }
    
    return filters;
  }

  /**
   * Optimize a query based on its determined type
   * @param query The cleaned query
   * @param queryType The type of query
   * @returns Optimized query
   */
  async optimizeQuery(query: string, queryType: QueryType): Promise<string> {
    switch (queryType) {
      case 'semantic':
        return this.optimizeForSemanticSearch(query);
      case 'exact':
        return this.optimizeForExactSearch(query);
      case 'pattern':
        return this.optimizeForPatternSearch(query);
      case 'context':
        return this.optimizeForContextSearch(query);
      default:
        return query;
    }
  }

  /**
   * Optimize a query for semantic search
   * @param query The cleaned query
   * @returns Optimized semantic query
   */
  async optimizeForSemanticSearch(query: string): Promise<string> {
    logger.info('Optimizing query for semantic search');
    
    // Remove common stop words to focus on key terms
    const stopWords = ['a', 'an', 'the', 'in', 'on', 'at', 'of', 'for', 'to', 'with'];
    let optimized = query;
    
    for (const word of stopWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      optimized = optimized.replace(regex, ' ');
    }
    
    // Collapse multiple spaces
    optimized = optimized.replace(/\s+/g, ' ').trim();
    
    // Add code-specific terms to improve relevance if they're not already there
    if (query.includes('function') && !optimized.includes('method')) {
      optimized += ' method';
    }
    if (query.includes('bug') && !optimized.includes('error')) {
      optimized += ' error exception';
    }
    
    return optimized;
  }

  /**
   * Optimize a query for exact search
   * @param query The cleaned query
   * @returns Optimized exact query
   */
  private optimizeForExactSearch(query: string): string {
    // For exact searches, we preserve the query but ensure quotes if not present
    if (!query.startsWith('"') && !query.endsWith('"')) {
      return `"${query}"`;
    }
    return query;
  }

  /**
   * Optimize a query for pattern search
   * @param query The cleaned query
   * @returns Optimized pattern query
   */
  private optimizeForPatternSearch(query: string): string {
    // For pattern searches, we try to build a better regex if possible
    if (!query.includes('(') && !query.includes('[') && !query.includes('\\')) {
      // Simple word pattern - add word boundaries
      return `\\b${query}\\b`;
    }
    return query;
  }

  /**
   * Optimize a query for context search
   * @param query The cleaned query
   * @returns Optimized context query
   */
  private optimizeForContextSearch(query: string): string {
    // For context searches, we want to focus on function/variable names
    // Extract likely code symbols from the query
    const symbols = query.match(/[a-zA-Z][a-zA-Z0-9_]*/g) || [];
    if (symbols.length > 0) {
      // Prioritize longer symbols as they're more likely to be meaningful
      const longerSymbols = symbols.filter(s => s.length > 3);
      if (longerSymbols.length > 0) {
        return longerSymbols.join(' ');
      }
    }
    return query;
  }

  /**
   * Calculate a confidence score for the query interpretation
   * @param query The normalized query
   * @param queryType The determined query type
   * @param intent The determined intent
   * @returns Confidence score between 0 and 1
   */
  private calculateConfidence(query: string, queryType: QueryType, intent: QueryIntent): number {
    // Base confidence
    let confidence = 0.7;
    
    // Increase confidence for exact matches with quotes
    if (queryType === 'exact' && (query.includes('"') || query.includes('\'')) && query.length > 5) {
      confidence += 0.2;
    }
    
    // Increase confidence for pattern matches with regex markers
    if (queryType === 'pattern' && (query.includes('regex:') || query.includes('pattern:')) && query.length > 8) {
      confidence += 0.2;
    }
    
    // Adjust confidence based on query length (longer queries typically have more context)
    if (query.length > 15) {
      confidence += 0.05;
    }
    
    // Adjust confidence based on filter presence (more filters = more precise intent)
    const filterCount = (query.match(/:[a-z0-9]+/g) || []).length;
    confidence += Math.min(0.1, filterCount * 0.02);
    
    // Cap at 1.0
    return Math.min(1.0, confidence);
  }
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

**Interface Definition:**

```typescript
export interface ProcessedQuery {
  originalQuery: string;
  processedQuery: string;
  queryType: QueryType;
  intent: QueryIntent;
  filters: QueryFilters;
  expectedResultType: ResultType;
  confidence: number; // 0-1 confidence in the interpretation
}
```

### `QueryFilters`

**Interface Definition:**

```typescript
export interface QueryFilters {
  language?: string | string[];
  fileType?: string | string[];
  complexity?: 'low' | 'medium' | 'high' | 'any';
  path?: string;
  author?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  minTokens?: number;
  maxTokens?: number;
  hasComments?: boolean;
  hasTests?: boolean;
  includePatterns?: string[];
  excludePatterns?: string[];
}
```

