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

#### `findSimilarPatterns()`

Find code patterns similar to the provided code snippet
@param codeSnippet The code snippet to analyze
@param threshold Minimum similarity threshold (0-1)
@returns Similarity analysis result

```typescript
findSimilarPatterns(codeSnippet: string, threshold: number = 0.8): Promise<SimilarityResult> {
```

#### `calculateOverallConfidence()`

Calculate overall confidence score

```typescript
calculateOverallConfidence(detectedPatterns: string[], similarCode: SearchResult[]): number {
```

#### `compareCodeSimilarity()`

Compare the similarity between two code snippets
@param code1 First code snippet
@param code2 Second code snippet
@returns Similarity score (0-1)

```typescript
compareCodeSimilarity(code1: string, code2: string): Promise<number> {
```

#### `identifyCodePatterns()`

Identify code patterns in a file
@param filePath Path to the file to analyze
@returns Array of detected pattern names

```typescript
identifyCodePatterns(filePath: string): Promise<string[]> {
```

#### `analyzeRepositoryPatterns()`

Find design patterns in a repository
@param repoPath Path to the repository
@returns Map of file paths to detected patterns

```typescript
analyzeRepositoryPatterns(repoPath: string): Promise<Map<string, string[]>> {
```

#### `detectPatterns()`

Detect patterns in code
@param code Code to analyze
@returns Array of detected pattern names

```typescript
detectPatterns(code: string): string[] {
```

#### `detectPatternType()`

Detect the type of code pattern
@param code Code to analyze
@returns Pattern type

```typescript
detectPatternType(code: string): PatternType {
    // Check for class pattern
```

#### `generateSimilarityReasons()`

Generate reasons why code is similar based on detected patterns
@param code Code to analyze
@param detectedPatterns Array of detected patterns
@returns Array of reasons

```typescript
generateSimilarityReasons(code: string, detectedPatterns: string[]): string[] {
```

#### `extractTokens()`

Extract tokens from code

```typescript
extractTokens(code: string): string[] {
    // Simple tokenization - split by whitespace and symbols
```

#### `calculateTokenSimilarity()`

Calculate similarity between token sets

```typescript
calculateTokenSimilarity(tokens1: string[], tokens2: string[]): number {
```

#### `calculatePatternSimilarity()`

Calculate similarity between pattern sets

```typescript
calculatePatternSimilarity(patterns1: string[], patterns2: string[]): number {
```

#### `normalizeCode()`

Normalize code for better comparison

```typescript
normalizeCode(code: string): string {
```

#### `findCodeFiles()`

Find all code files in a directory recursively

```typescript
findCodeFiles(dir: string): string[] {
```

#### `cosineSimilarity()`

Calculate cosine similarity between two vectors

```typescript
cosineSimilarity(vector1: number[], vector2: number[]): number {
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

