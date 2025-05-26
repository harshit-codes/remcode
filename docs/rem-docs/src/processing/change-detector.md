# change-detector.ts

**File Path:** `src/processing/change-detector.ts`

## Overview

Check if the directory is a git repository

Get the current HEAD commit hash

Check if a commit exists in the repository

Get list of changed files between two commits

Add additional file information

Check if there are any changes between two commits

Get a list of modified lines for a specific file

Filter for only code files

Get list of ignored files and directories from .gitignore

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

