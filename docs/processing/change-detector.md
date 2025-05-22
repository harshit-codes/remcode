# change-detector.ts

**File Path:** `processing/change-detector.ts`

## Overview

Check if the directory is a git repository

## Dependencies

- `../utils/logger`
- `child_process`

## Classes

### `ChangeDetector`

**Methods:**

- `if()`
- `Error()`
- `isGitRepository()`
- `execSync()`
- `catch()`
- `getCurrentCommit()`
- `execSync()`
- `catch()`
- `String()`
- `Error()`
- `commitExists()`
- `execSync()`
- `catch()`
- `getChangedFiles()`
- `if()`
- `Error()`
- `if()`
- `Error()`
- `execSync()`
- `if()`
- `for()`
- `if()`
- `if()`
- `if()`
- `file()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `Error()`
- `enrichFileInfo()`
- `if()`
- `if()`
- `catch()`
- `hasChanges()`
- `execSync()`
- `catch()`
- `getModifiedLines()`
- `execSync()`
- `if()`
- `for()`
- `if()`
- `if()`
- `parseInt()`
- `if()`
- `if()`
- `catch()`
- `String()`
- `filterCodeFiles()`
- `getIgnoredPaths()`
- `if()`
- `catch()`
- `String()`

## Interfaces

### `FileChange`

**Properties:**

- `path: string;`
- `status: 'added' | 'modified' | 'deleted' | 'renamed';`
- `previousPath?: string;`
- `size?: number;`
- `extension?: string;`

