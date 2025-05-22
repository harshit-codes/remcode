# change-detector.ts

**File Path:** `processing/change-detector.ts`

## Overview

Check if the directory is a git repository

## Dependencies

- `../utils/logger`
- `./types`
- `child_process`

## Classes

### `ChangeDetector`

Check if the directory is a git repository

```typescript
class ChangeDetector {
// ... implementation
}
```

**Methods:**

#### `isGitRepository()`

Check if the directory is a git repository

```typescript
isGitRepository(): boolean {
```

#### `getCurrentCommit()`

Get the current HEAD commit hash

```typescript
getCurrentCommit(): string {
```

#### `execSync()`

```typescript
execSync('git rev-parse HEAD', { cwd: this.repoPath }
```

#### `commitExists()`

Check if a commit exists in the repository

```typescript
commitExists(commit: string): boolean {
```

#### `getChangedFiles()`

Get list of changed files between two commits

```typescript
getChangedFiles(fromCommit: string, toCommit: string = 'HEAD'): Promise<FileChange[]> {
```

#### `enrichFileInfo()`

Add additional file information

```typescript
enrichFileInfo(change: FileChange): FileChange {
    // Skip enrichment for deleted files
```

#### `hasChanges()`

Check if there are any changes between two commits

```typescript
hasChanges(fromCommit: string, toCommit: string = 'HEAD'): Promise<boolean> {
```

#### `getModifiedLines()`

Get a list of modified lines for a specific file

```typescript
getModifiedLines(filePath: string, fromCommit: string, toCommit: string = 'HEAD'): Promise<number[]> {
```

#### `filterCodeFiles()`

Filter for only code files

```typescript
filterCodeFiles(changes: FileChange[]): Promise<FileChange[]> {
    // Expanded list of code file extensions
```

#### `getIgnoredPaths()`

Get list of ignored files and directories from .gitignore

```typescript
getIgnoredPaths(): Promise<string[]> {
```

