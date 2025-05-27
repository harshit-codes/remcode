# context-extractor.ts

**File Path:** `src/search/context-extractor.ts`

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

```typescript
class ContextExtractor {
  // ... implementation
}
```

### `context`

```typescript
class context {
  // ... implementation
}
```

### `let`

```typescript
class let {
  // ... implementation
}
```

### `declaration`

```typescript
class declaration {
  // ... implementation
}
```

### `name`

```typescript
class name {
  // ... implementation
}
```

### `methods`

```typescript
class methods {
  // ... implementation
}
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

## Functions

### `declarations()`

```typescript
function declarations() {
  // ... implementation
}
```

### `length()`

```typescript
function length() {
  // ... implementation
}
```

### `declaration()`

```typescript
function declaration() {
  // ... implementation
}
```

### `parameters()`

```typescript
function parameters() {
  // ... implementation
}
```

## Variables

- `logger`
- `content`
- `lines`
- `targetContent`
- `contextSize`
- `surroundingStart`
- `surroundingEnd`
- `surroundingLines`
- `fileStructure`
- `classContext`
- `classInfo`
- `relatedFunctions`
- `func`
- `isOverlapping`
- `isClose`
- `imports`
- `moduleContext`
- `content`
- `fileExt`
- `ast`
- `classes`
- `functions`
- `exports`
- `imports`
- `lines`
- `imports`
- `functions`
- `i`
- `line`
- `functionMatch`
- `name`
- `key`
- `importInfo`
- `specifier`
- `decl`
- `specifier`
- `className`
- `classInfo`
- `member`
- `methodName`
- `methodInfo`
- `functionName`
- `functionInfo`
- `params`
- `param`

## Additional Documentation

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

## File Statistics

- **Lines of Code**: 459
- **File Size**: 13990 bytes
- **Last Modified**: 2025-05-22T12:02:45.959Z

