# file-analyzer.ts

**File Path:** `processing/file-analyzer.ts`

## Overview

Analyze a list of changed files to determine their characteristics

## Dependencies

- `../utils/logger`
- `./change-detector`

## Classes

### `FileAnalyzer`

**Methods:**

- `analyzeChangedFiles()`
- `for()`
- `analyzeFile()`
- `if()`
- `if()`
- `file()`
- `code()`
- `if()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `analyzeJsTs()`
- `imports()`
- `while()`
- `if()`
- `exports()`
- `while()`
- `if()`
- `classes()`
- `while()`
- `if()`
- `while()`
- `if()`
- `catch()`
- `String()`
- `analyzePython()`
- `Python()`
- `while()`
- `if()`
- `while()`
- `if()`
- `while()`
- `if()`
- `catch()`
- `String()`
- `code()`
- `countSourceLines()`
- `if()`
- `if()`
- `determineComplexity()`
- `if()`
- `if()`
- `determineChunkingStrategy()`
- `if()`
- `if()`
- `if()`
- `refineChunkingStrategy()`
- `if()`
- `if()`
- `if()`
- `detectLanguage()`
- `categorizeFile()`
- `if()`
- `if()`
- `files()`
- `if()`
- `if()`

## Interfaces

### `FileAnalysis`

**Properties:**

- `path: string;`
- `category: 'priority' | 'normal' | 'test' | 'config' | 'ignore';`
- `language: string;`
- `complexity: 'low' | 'medium' | 'high';`
- `size: number;`
- `sloc?: number; // Source lines of code (excluding comments and blank lines)`
- `imports?: string[];`
- `exports?: string[];`
- `functions?: string[];`
- `classes?: string[];`
- `dependencies?: string[];`
- `chunkingStrategy: ChunkingStrategy;`
- `metadata?: Record<string, any>;`

### `AnalysisOptions`

**Properties:**

- `basePath: string;`
- `skipAST?: boolean;`
- `skipDependencies?: boolean;`
- `maxFileSizeBytes?: number;`

