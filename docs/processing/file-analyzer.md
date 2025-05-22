# file-analyzer.ts

**File Path:** `processing/file-analyzer.ts`

## Overview

Analyze a list of changed files to determine their characteristics

## Dependencies

- `../utils/logger`
- `./types`

## Classes

### `FileAnalyzer`

Analyze a list of changed files to determine their characteristics

```typescript
class FileAnalyzer {
// ... implementation
}
```

**Methods:**

#### `analyzeChangedFiles()`

Analyze a list of changed files to determine their characteristics

```typescript
analyzeChangedFiles(changes: FileChange[], options: Partial<AnalysisOptions> = {}
```

#### `analyzeFile()`

Analyze a single file to determine its characteristics

```typescript
analyzeFile(filePath: string, options: AnalysisOptions): Promise<FileAnalysis> {
```

#### `analyzeJsTs()`

Analyze JavaScript/TypeScript code

```typescript
analyzeJsTs(content: string, analysis: FileAnalysis, language: string): void {
```

#### `analyzePython()`

Analyze Python code

```typescript
analyzePython(content: string, analysis: FileAnalysis): void {
```

#### `countSourceLines()`

Count source lines of code (excluding comments and blank lines)

```typescript
countSourceLines(content: string, language: string): number {
    // Remove comments based on language
```

#### `determineComplexity()`

Determine the complexity of a file based on its characteristics

```typescript
determineComplexity(sloc: number, language: string): FileAnalysis['complexity'] {
    // Simple complexity determination based on SLOC
```

#### `determineChunkingStrategy()`

Determine the initial chunking strategy based on file path and language

```typescript
determineChunkingStrategy(filePath: string, language: string): ChunkStrategyType {
```

#### `refineChunkingStrategy()`

Refine the chunking strategy based on the detailed analysis

```typescript
refineChunkingStrategy(analysis: FileAnalysis): ChunkStrategyType {
    // Start with the initial strategy
```

#### `detectLanguage()`

Detect the programming language of a file based on its extension

```typescript
detectLanguage(filePath: string): string {
```

#### `categorizeFile()`

Categorize a file based on its path and name

```typescript
categorizeFile(filePath: string): FileAnalysis['category'] {
```

