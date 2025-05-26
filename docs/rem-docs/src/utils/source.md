# source.ts

**File Path:** `src/utils/source.ts`

## Overview

Source types supported by the resolver

Parsed source information

Resolve a source path or URL to a local directory

Parse a source string into its components

Parse a GitHub URL into its components

Parse a GitLab URL into its components

Parse a Bitbucket URL into its components

Parse a generic Git URL into its components

Parse an HTTP URL

Parse a local path

Resolve a GitHub URL to a local directory

Resolve a local path to an absolute path

Detect programming languages used in a directory

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
export function resolveSource()
```

### `parseSource()`

```typescript
export function parseSource()
```

### `parseGitHubUrl()`

```typescript
export function parseGitHubUrl()
```

### `parseGitLabUrl()`

```typescript
export function parseGitLabUrl()
```

### `parseBitbucketUrl()`

```typescript
export function parseBitbucketUrl()
```

### `parseGenericGitUrl()`

```typescript
export function parseGenericGitUrl()
```

### `parseHttpUrl()`

```typescript
export function parseHttpUrl()
```

### `parseLocalPath()`

```typescript
export function parseLocalPath()
```

### `resolveGitHubSource()`

```typescript
export function resolveGitHubSource()
```

### `resolveLocalSource()`

```typescript
export function resolveLocalSource()
```

### `detectLanguages()`

```typescript
export function detectLanguages()
```

### `countFiles()`

```typescript
export function countFiles()
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

