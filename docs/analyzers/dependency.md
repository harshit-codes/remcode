# dependency.ts

**File Path:** `analyzers/dependency.ts`

## Overview

Represents a complete dependency analysis of a repository

## Dependencies

- `../utils/logger`

## Classes

### `DependencyAnalyzer`

Analyzes dependencies in the repository

```typescript
class DependencyAnalyzer {
// ... implementation
}
```

**Methods:**

#### `analyze()`

Analyzes dependencies in the repository
@returns A complete dependency analysis

```typescript
analyze(): Promise<DependencyAnalysis> {
```

#### `isCorePath()`

Determines if a path is a core module

```typescript
isCorePath(modulePath: string): boolean {
    // Consider core folders like 'src', 'lib', 'app', 'core'
```

#### `isEntryPoint()`

Determines if a file is an entry point

```typescript
isEntryPoint(filePath: string): boolean {
```

#### `identifyKeyFiles()`

Identifies key files in the codebase

```typescript
identifyKeyFiles(files: Record<string, any>): string[] {
```

#### `parseJSImports()`

Parses JavaScript/TypeScript imports

```typescript
parseJSImports(content: string, imports: Record<string, string[]>, dependencies: string[], filePath: string): void {
    // ES6 imports
```

#### `parseJSExports()`

Parses JavaScript/TypeScript exports

```typescript
parseJSExports(content: string, exports: string[]): void {
    // Named exports
```

#### `parsePythonImports()`

Parses Python imports

```typescript
parsePythonImports(content: string, imports: Record<string, string[]>, dependencies: string[], filePath: string): void {
    // Python import statements
```

#### `resolveRelativePath()`

Resolves a relative path to an absolute path

```typescript
resolveRelativePath(relativePath: string, fromFilePath: string): string | null {
```

#### `resolveRelativePythonPath()`

Resolves a relative Python import path

```typescript
resolveRelativePythonPath(relativePath: string, fromFilePath: string): string | null {
```

## Variables

- `defaultExportRegex`

