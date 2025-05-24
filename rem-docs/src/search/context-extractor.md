# context-extractor.ts

**File Path:** `src/search/context-extractor.ts`

## Overview

Extract code context from a file based on line range
@param filePath Path to the source file
@param startLine Starting line number (0-indexed)
@param endLine Ending line number (0-indexed)
@returns Extracted code context

Parse a file and extract its structure (classes, functions, imports, exports)
@param filePath Path to the source file
@returns Structured representation of the file

Parse TypeScript/JavaScript files to extract their structure
@param content File content
@param isJsx Whether the file contains JSX
@returns Structured representation of the file

Parse non-JS/TS files for a simplified structure
@param content File content
@returns Basic file structure

Traverse the AST to extract code structure
@param ast AST node to process
@param structure Structure being built

Process an import declaration node
@param node Import node
@param imports Collection of imports

Process an export declaration node
@param node Export node
@param exports Collection of exports

Process a class declaration node
@param node Class node
@param classes Collection of classes
@param functions Collection of functions

Process a method definition
@param node Method node
@param className Parent class name
@param methods Collection of class methods
@param functions Collection of all functions

Process a function declaration
@param node Function node
@param functions Collection of functions

Extract function parameters
@param node Function node
@returns Array of parameter names

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
export function declarations()
```

### `length()`

```typescript
export function length()
```

### `declaration()`

```typescript
export function declaration()
```

### `parameters()`

```typescript
export function parameters()
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

