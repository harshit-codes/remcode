# file-analyzer.ts

**File Path:** `src/processing/file-analyzer.ts`

## Overview

Analyze a list of changed files to determine their characteristics

Analyze a single file to determine its characteristics

Analyze JavaScript/TypeScript code

Analyze Python code

Count source lines of code (excluding comments and blank lines)

Determine the complexity of a file based on its characteristics

Determine the initial chunking strategy based on file path and language

Refine the chunking strategy based on the detailed analysis

Detect the programming language of a file based on its extension

Categorize a file based on its path and name

## Dependencies

- `../utils/logger`
- `./types`

## Classes

### `FileAnalyzer`

```typescript
class FileAnalyzer {
// ... implementation
}
```

## Variables

- `logger`
- `opts`
- `activeChanges`
- `batchSize`
- `results`
- `i`
- `batch`
- `batchResults`
- `absolutePath`
- `relativePath`
- `language`
- `category`
- `analysis`
- `stats`
- `content`
- `errorMsg`
- `importRegex`
- `match`
- `exportRegex`
- `functionRegex`
- `name`
- `classRegex`
- `errorMsg`
- `importRegex`
- `match`
- `importName`
- `functionRegex`
- `classRegex`
- `errorMsg`
- `noComments`
- `filename`
- `strategy`
- `ext`
- `langMap`
- `filename`
- `dirPath`

