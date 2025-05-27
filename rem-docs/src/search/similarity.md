# similarity.ts

**File Path:** `src/search/similarity.ts`

## Overview

Known code patterns that can be detected

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
function pattern() {
  // ... implementation
}
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

## Additional Documentation

### Comment 1

Type of code segment being analyzed

### Comment 2

Result of a similarity analysis

### Comment 3

Configuration options for the similarity analyzer

### Comment 4

Analyzes code for similarity and pattern detection

### Comment 5

Creates a new SimilarityAnalyzer

### Comment 6

Initialize the analyzer if needed

### Comment 7

Find code patterns similar to the provided code snippet
@param codeSnippet The code snippet to analyze
@param threshold Minimum similarity threshold (0-1)
@returns Similarity analysis result

### Comment 8

Calculate overall confidence score

### Comment 9

Compare the similarity between two code snippets
@param code1 First code snippet
@param code2 Second code snippet
@returns Similarity score (0-1)

### Comment 10

Identify code patterns in a file or code content
@param filePathOrContent Path to the file to analyze or code content directly
@param isContent Whether the first parameter is content (true) or file path (false)
@returns Array of detected pattern names

### Comment 11

Find design patterns in a repository
@param repoPath Path to the repository
@returns Map of file paths to detected patterns

### Comment 12

Detect patterns in code
@param code Code to analyze
@returns Array of detected pattern names

### Comment 13

Detect the type of code pattern
@param code Code to analyze
@returns Pattern type

### Comment 14

Generate reasons why code is similar based on detected patterns
@param code Code to analyze
@param detectedPatterns Array of detected patterns
@returns Array of reasons

### Comment 15

Extract tokens from code

### Comment 16

Calculate similarity between token sets

### Comment 17

Calculate similarity between pattern sets

### Comment 18

Normalize code for better comparison

### Comment 19

Find all code files in a directory recursively

### Comment 20

Calculate cosine similarity between two vectors

## File Statistics

- **Lines of Code**: 686
- **File Size**: 21142 bytes
- **Last Modified**: 2025-05-23T08:33:09.795Z

