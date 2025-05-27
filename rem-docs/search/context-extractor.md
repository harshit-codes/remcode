# context-extractor.ts

**File Path**: `search/context-extractor.ts`

## Description

Extract code context from a file based on line range
 @param filePath Path to the source file
 @param startLine Starting line number (0-indexed)
 @param endLine Ending line number (0-indexed)
 @returns Extracted code context

## Classes

- `ContextExtractor`

## Interfaces

- `CodeContext`
- `FileStructure`
- `ClassInfo`
- `FunctionInfo`
- `ImportInfo`

## Documentation Comments

### Comment 1

Parse a file and extract its structure (classes, functions, imports, exports)
 @param filePath Path to the source file
 @returns Structured representation of the file

### Comment 2

Parse TypeScript/JavaScript files to extract their structure
 @param content File content
 @param isJsx Whether the file contains JSX
 @returns Structured representation of the file

### Comment 3

Parse non-JS/TS files for a simplified structure
 @param content File content
 @returns Basic file structure

### Comment 4

Traverse the AST to extract code structure
 @param ast AST node to process
 @param structure Structure being built

### Comment 5

Process an import declaration node
 @param node Import node
 @param imports Collection of imports

### Comment 6

Process an export declaration node
 @param node Export node
 @param exports Collection of exports

### Comment 7

Process a class declaration node
 @param node Class node
 @param classes Collection of classes
 @param functions Collection of functions

### Comment 8

Process a method definition
 @param node Method node
 @param className Parent class name
 @param methods Collection of class methods
 @param functions Collection of all functions

### Comment 9

Process a function declaration
 @param node Function node
 @param functions Collection of functions

### Comment 10

Extract function parameters
 @param node Function node
 @returns Array of parameter names

## Code Overview

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { getLogger } from '../utils/logger';

// Key exports:
export class ContextExtractor { ... }
export interface CodeContext { ... }
export interface FileStructure { ... }
export interface ClassInfo { ... }
export interface FunctionInfo { ... }
export interface ImportInfo { ... }
```

## File Statistics

- **Lines of Code**: 459
- **File Size**: 13990 bytes
- **Last Modified**: 2025-05-22T12:02:45.959Z

