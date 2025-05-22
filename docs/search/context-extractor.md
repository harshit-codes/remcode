# context-extractor.ts

**File Path:** `search/context-extractor.ts`

## Overview

Extract code context from a file based on line range
@param filePath Path to the source file
@param startLine Starting line number (0-indexed)
@param endLine Ending line number (0-indexed)
@returns Extracted code context

## Dependencies

- `../utils/logger`

## Classes

### `ContextExtractor`

**Methods:**

- `number()`
- `number()`
- `extractContext()`
- `if()`
- `Error()`
- `context()`
- `for()`
- `if()`
- `for()`
- `if()`
- `catch()`
- `String()`
- `structure()`
- `getFileStructure()`
- `if()`
- `catch()`
- `String()`
- `parseTypescript()`
- `parse()`
- `catch()`
- `String()`
- `parseGenericFile()`
- `for()`
- `if()`
- `if()`
- `traverseAst()`
- `if()`
- `if()`
- `switch()`
- `for()`
- `if()`
- `if()`
- `if()`
- `processImport()`
- `if()`
- `if()`
- `for()`
- `if()`
- `if()`
- `processExport()`
- `if()`
- `if()`
- `if()`
- `for()`
- `if()`
- `if()`
- `for()`
- `if()`
- `processClass()`
- `if()`
- `if()`
- `for()`
- `if()`
- `if()`
- `if()`
- `processMethod()`
- `if()`
- `processFunction()`
- `if()`
- `extractParams()`
- `if()`
- `for()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`

## Interfaces

### `CodeContext`

**Properties:**

- `targetContent: string;`
- `surroundingLines: string[];`
- `relatedFunctions: string[];`
- `imports: string[];`
- `classContext?: string;`
- `moduleContext?: string;`
- `fileStructure?: FileStructure;`

### `FileStructure`

**Properties:**

- `classes: ClassInfo[];`
- `functions: FunctionInfo[];`
- `exports: string[];`
- `imports: ImportInfo[];`

### `ClassInfo`

**Properties:**

- `name: string;`
- `methods: FunctionInfo[];`
- `properties: string[];`
- `startLine: number;`
- `endLine: number;`

### `FunctionInfo`

**Properties:**

- `name: string;`
- `params: string[];`
- `startLine: number;`
- `endLine: number;`
- `isMethod: boolean;`
- `parentClass?: string;`

### `ImportInfo`

**Properties:**

- `source: string;`
- `imported: string[];`
- `startLine: number;`

