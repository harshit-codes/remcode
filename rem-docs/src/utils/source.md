# source.ts

**File Path:** `src/utils/source.ts`

## Overview

Source types supported by the resolver

## Dependencies

- `./logger`

## Interfaces

### `SourceOptions`

```typescript
interface SourceOptions {
  // ... properties
}
```

### `ResolvedSource`

```typescript
interface ResolvedSource {
  // ... properties
}
```

### `ParsedSource`

```typescript
interface ParsedSource {
  // ... properties
}
```

## Functions

### `resolveSource()`

```typescript
function resolveSource() {
  // ... implementation
}
```

### `parseSource()`

```typescript
function parseSource() {
  // ... implementation
}
```

### `parseGitHubUrl()`

```typescript
function parseGitHubUrl() {
  // ... implementation
}
```

### `parseGitLabUrl()`

```typescript
function parseGitLabUrl() {
  // ... implementation
}
```

### `parseBitbucketUrl()`

```typescript
function parseBitbucketUrl() {
  // ... implementation
}
```

### `parseGenericGitUrl()`

```typescript
function parseGenericGitUrl() {
  // ... implementation
}
```

### `parseHttpUrl()`

```typescript
function parseHttpUrl() {
  // ... implementation
}
```

### `parseLocalPath()`

```typescript
function parseLocalPath() {
  // ... implementation
}
```

### `resolveGitHubSource()`

```typescript
function resolveGitHubSource() {
  // ... implementation
}
```

### `resolveLocalSource()`

```typescript
function resolveLocalSource() {
  // ... implementation
}
```

### `detectLanguages()`

```typescript
function detectLanguages() {
  // ... implementation
}
```

### `countFiles()`

```typescript
function countFiles() {
  // ... implementation
}
```

## Variables

- `logger`
- `execAsync`
- `parsedSource`
- `parsers`
- `parser`
- `parsedSource`
- `githubRegex`
- `match`
- `gitlabRegex`
- `match`
- `bitbucketRegex`
- `match`
- `gitRegex`
- `match`
- `pathParts`
- `repo`
- `owner`
- `resolvedPath`
- `owner`
- `parts`
- `parts`
- `cacheDir`
- `repoDir`
- `token`
- `cloneUrl`
- `absolutePath`
- `fileStats`
- `languages`
- `extensionMap`
- `files`
- `file`
- `filePath`
- `stat`
- `ext`
- `language`

## Additional Documentation

### Comment 1

Parsed source information

### Comment 2

Resolve a source path or URL to a local directory

### Comment 3

Parse a source string into its components

### Comment 4

Parse a GitHub URL into its components

### Comment 5

Parse a GitLab URL into its components

### Comment 6

Parse a Bitbucket URL into its components

### Comment 7

Parse a generic Git URL into its components

### Comment 8

Parse an HTTP URL

### Comment 9

Parse a local path

### Comment 10

Resolve a GitHub URL to a local directory

### Comment 11

Resolve a local path to an absolute path

### Comment 12

Detect programming languages used in a directory

## File Statistics

- **Lines of Code**: 387
- **File Size**: 10082 bytes
- **Last Modified**: 2025-05-23T05:13:00.133Z

