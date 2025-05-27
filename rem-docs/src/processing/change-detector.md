# change-detector.ts

**File Path:** `src/processing/change-detector.ts`

## Overview

Check if the directory is a git repository

## Dependencies

- `../utils/logger`
- `./types`
- `child_process`

## Classes

### `ChangeDetector`

```typescript
class ChangeDetector {
  // ... implementation
}
```

## Variables

- `logger`
- `errorMsg`
- `diffCommand`
- `diffOutput`
- `changes`
- `lines`
- `line`
- `parts`
- `status`
- `errorMsg`
- `filePath`
- `stats`
- `result`
- `diffCommand`
- `diffOutput`
- `modifiedLines`
- `lines`
- `currentLine`
- `line`
- `match`
- `errorMsg`
- `codeExtensions`
- `filteredChanges`
- `extension`
- `gitignorePath`
- `gitignoreContent`

## Additional Documentation

### Comment 1

Get the current HEAD commit hash

### Comment 2

Check if a commit exists in the repository

### Comment 3

Get list of changed files between two commits

### Comment 4

Add additional file information

### Comment 5

Check if there are any changes between two commits

### Comment 6

Get a list of modified lines for a specific file

### Comment 7

Filter for only code files

### Comment 8

Get list of ignored files and directories from .gitignore

## File Statistics

- **Lines of Code**: 292
- **File Size**: 8781 bytes
- **Last Modified**: 2025-05-22T12:25:36.076Z

