# similarity.ts

**File Path:** `search/similarity.ts`

## Overview

Known code patterns that can be detected

## Dependencies

- `../utils/logger`
- `./semantic`
- `../vectorizers/embedders/manager`

## Classes

### `SimilarityAnalyzer`

**Methods:**

- `ensureInitialized()`
- `if()`
- `if()`
- `SemanticSearch()`
- `threshold()`
- `findSimilarPatterns()`
- `is()`
- `if()`
- `catch()`
- `String()`
- `calculateOverallConfidence()`
- `if()`
- `if()`
- `score()`
- `compareCodeSimilarity()`
- `similarity()`
- `similarity()`
- `if()`
- `if()`
- `similarity()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `if()`
- `identifyCodePatterns()`
- `if()`
- `Error()`
- `if()`
- `catch()`
- `String()`
- `analyzeRepositoryPatterns()`
- `if()`
- `Error()`
- `for()`
- `if()`
- `catch()`
- `String()`
- `Map()`
- `detectPatterns()`
- `if()`
- `for()`
- `for()`
- `if()`
- `if()`
- `detectPatternType()`
- `if()`
- `if()`
- `if()`
- `generateSimilarityReasons()`
- `for()`
- `if()`
- `for()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `extractTokens()`
- `calculateTokenSimilarity()`
- `if()`
- `Set()`
- `Set()`
- `for()`
- `if()`
- `calculatePatternSimilarity()`
- `if()`
- `Set()`
- `Set()`
- `for()`
- `if()`
- `normalizeCode()`
- `findCodeFiles()`
- `Set()`
- `for()`
- `if()`
- `if()`
- `if()`
- `cosineSimilarity()`
- `if()`
- `Error()`
- `for()`
- `if()`

## Interfaces

### `SimilarityResult`

**Properties:**

- `targetCode: string;`
- `similarCode: SearchResult[];`
- `similarityReasons: string[];`
- `patternType: PatternType;`
- `patternName?: string;`
- `confidence: number;`

### `SimilarityOptions`

**Properties:**

- `semanticSearch?: SemanticSearch;`
- `embeddingManager?: EmbeddingManager;`
- `minSimilarity?: number;`
- `enableSemanticSearch?: boolean;`
- `enableSyntaxAnalysis?: boolean;`
- `enablePatternDetection?: boolean;`

