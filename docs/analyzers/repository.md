# repository.ts

**File Path:** `analyzers/repository.ts`

## Overview

Mapping of file extensions to languages

## Dependencies

- `../utils/logger`

## Classes

### `RepositoryAnalyzer`

**Methods:**

#### `analyze()`

Analyzes the repository to provide insights about its structure and composition
@returns Analysis results

```typescript
analyze(): Promise<RepositoryAnalysis> {
```

#### `getModulePath()`

Gets the module path for a file

```typescript
getModulePath(relativePath: string): string | null {
```

#### `countClassesAndFunctions()`

Counts classes and functions in a file

```typescript
countClassesAndFunctions(content: string, language: string): { classes: number; functions: number }
```

