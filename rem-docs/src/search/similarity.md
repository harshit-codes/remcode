# similarity.ts

**File Path:** `src/search/similarity.ts`

## Overview

Known code patterns that can be detected

Type of code segment being analyzed

Result of a similarity analysis

Configuration options for the similarity analyzer

Analyzes code for similarity and pattern detection

Creates a new SimilarityAnalyzer

Initialize the analyzer if needed

Find code patterns similar to the provided code snippet
@param codeSnippet The code snippet to analyze
@param threshold Minimum similarity threshold (0-1)
@returns Similarity analysis result

Calculate overall confidence score

Compare the similarity between two code snippets
@param code1 First code snippet
@param code2 Second code snippet
@returns Similarity score (0-1)

Identify code patterns in a file or code content
@param filePathOrContent Path to the file to analyze or code content directly
@param isContent Whether the first parameter is content (true) or file path (false)
@returns Array of detected pattern names

Find design patterns in a repository
@param repoPath Path to the repository
@returns Map of file paths to detected patterns

Detect patterns in code
@param code Code to analyze
@returns Array of detected pattern names

Detect the type of code pattern
@param code Code to analyze
@returns Pattern type

Generate reasons why code is similar based on detected patterns
@param code Code to analyze
@param detectedPatterns Array of detected patterns
@returns Array of reasons

Extract tokens from code

Calculate similarity between token sets

Calculate similarity between pattern sets

Normalize code for better comparison

Find all code files in a directory recursively

Calculate cosine similarity between two vectors

## Dependencies

- `../utils/logger`
- `./semantic`
- `../vectorizers/embedders/manager`

## Classes

### `SimilarityAnalyzer`

```typescript
class SimilarityAnalyzer {
// ... implementation
}
```

### `declaration`

```typescript
class declaration {
// ... implementation
}
```

### `syntax`

```typescript
class syntax {
// ... implementation
}
```

### `pattern`

```typescript
class pattern {
// ... implementation
}
```

## Interfaces

### `SimilarityResult`

```typescript
interface SimilarityResult {
// ... properties
}
```

### `SimilarityOptions`

```typescript
interface SimilarityOptions {
// ... properties
}
```

## Functions

### `pattern()`

```typescript
export function pattern()
```

## Variables

- `logger`
- `patternType`
- `detectedPatterns`
- `similarCode`
- `similarityReasons`
- `confidence`
- `confidence`
- `avgScore`
- `stringSimilarity`
- `tokenSimilarity`
- `tokens1`
- `tokens2`
- `patternSimilarity`
- `patterns1`
- `patterns2`
- `semanticSimilarity`
- `chunks`
- `embeddings`
- `combinedSimilarity`
- `fileContent`
- `extension`
- `results`
- `codeFiles`
- `file`
- `patterns`
- `detectedPatterns`
- `matchCount`
- `regex`
- `matches`
- `reasons`
- `patternType`
- `patternDef`
- `i`
- `set1`
- `set2`
- `commonCount`
- `token`
- `set1`
- `set2`
- `commonCount`
- `files`
- `codeExtensions`
- `entries`
- `entry`
- `fullPath`
- `dotProduct`
- `magnitude1`
- `magnitude2`
- `i`

