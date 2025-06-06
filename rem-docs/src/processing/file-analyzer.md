# file-analyzer.ts

**File Path:** `src/processing/file-analyzer.ts`

## Overview

Analyze a list of changed files to determine their characteristics

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

## Additional Documentation

### Comment 1

Analyze a single file to determine its characteristics

### Comment 2

Analyze JavaScript/TypeScript code

### Comment 3

Analyze Python code

### Comment 4

Count source lines of code (excluding comments and blank lines)

### Comment 5

Determine the complexity of a file based on its characteristics

### Comment 6

Determine the initial chunking strategy based on file path and language

### Comment 7

Refine the chunking strategy based on the detailed analysis

### Comment 8

Detect the programming language of a file based on its extension

### Comment 9

Categorize a file based on its path and name

## File Statistics

- **Lines of Code**: 415
- **File Size**: 13298 bytes
- **Last Modified**: 2025-05-22T12:25:27.016Z

