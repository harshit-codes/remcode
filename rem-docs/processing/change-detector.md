# change-detector.ts

**File Path**: `processing/change-detector.ts`

## Description

Check if the directory is a git repository

## Classes

- `ChangeDetector`

## Documentation Comments

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

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { FileChange } from './types';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Key exports:
export class ChangeDetector { ... }
```

## File Statistics

- **Lines of Code**: 292
- **File Size**: 8781 bytes
- **Last Modified**: 2025-05-22T12:25:36.076Z

