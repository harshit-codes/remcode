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

Extract code context from a file based on line range

```typescript
class ContextExtractor {
// ... implementation
}
```

**Methods:**

#### `extractContext()`

Extract code context from a file based on line range
@param filePath Path to the source file
@param startLine Starting line number (0-indexed)
@param endLine Ending line number (0-indexed)
@returns Extracted code context

```typescript
extractContext(filePath: string, startLine: number, endLine: number): Promise<CodeContext> {
```

#### `getFileStructure()`

Parse a file and extract its structure (classes, functions, imports, exports)
@param filePath Path to the source file
@returns Structured representation of the file

```typescript
getFileStructure(filePath: string): Promise<FileStructure> {
```

#### `parseTypescript()`

Parse TypeScript/JavaScript files to extract their structure
@param content File content
@param isJsx Whether the file contains JSX
@returns Structured representation of the file

```typescript
parseTypescript(content: string, isJsx: boolean): FileStructure {
```

#### `parseGenericFile()`

Parse non-JS/TS files for a simplified structure
@param content File content
@returns Basic file structure

```typescript
parseGenericFile(content: string): FileStructure {
```

#### `traverseAst()`

Traverse the AST to extract code structure
@param ast AST node to process
@param structure Structure being built

```typescript
traverseAst(ast: any, structure: FileStructure): void {
```

#### `processImport()`

Process an import declaration node
@param node Import node
@param imports Collection of imports

```typescript
processImport(node: any, imports: ImportInfo[]): void {
```

#### `processExport()`

Process an export declaration node
@param node Export node
@param exports Collection of exports

```typescript
processExport(node: any, exports: string[]): void {
```

#### `processClass()`

Process a class declaration node
@param node Class node
@param classes Collection of classes
@param functions Collection of functions

```typescript
processClass(node: any, classes: ClassInfo[], functions: FunctionInfo[]): void {
```

#### `processMethod()`

Process a method definition
@param node Method node
@param className Parent class name
@param methods Collection of class methods
@param functions Collection of all functions

```typescript
processMethod(node: any, className: string, methods: FunctionInfo[], functions: FunctionInfo[]): void {
```

#### `processFunction()`

Process a function declaration
@param node Function node
@param functions Collection of functions

```typescript
processFunction(node: any, functions: FunctionInfo[]): void {
    // Skip anonymous functions without an identifier
```

#### `extractParams()`

Extract function parameters
@param node Function node
@returns Array of parameter names

```typescript
extractParams(node: any): string[] {
```

## Interfaces

### `CodeContext`

```typescript
interface CodeContext {
// ... properties
}
```

### `FileStructure`

```typescript
interface FileStructure {
// ... properties
}
```

### `ClassInfo`

```typescript
interface ClassInfo {
// ... properties
}
```

### `FunctionInfo`

```typescript
interface FunctionInfo {
// ... properties
}
```

### `ImportInfo`

```typescript
interface ImportInfo {
// ... properties
}
```

