# detector.ts

**File Path**: `setup/detector.ts`

## Description

Possible reasons for setup requirements

## Classes

- `SetupDetector`

## Interfaces

- `GitRemoteInfo`
- `SetupStatus`

## Documentation Comments

### Comment 1

Git remote information

### Comment 2

Detailed setup status information

### Comment 3

Class to detect repository setup requirements for Remcode

### Comment 4

Constructor
 @param repoPath Path to the repository to analyze

### Comment 5

Detect all setup requirements

### Comment 6

Check if directory is a Git repository

### Comment 7

Check if .remcode configuration file exists

### Comment 8

Check if GitHub workflow file exists

### Comment 9

Get Git remote information

### Comment 10

Validate .remcode configuration file

### Comment 11

Get .remcode configuration version

### Comment 12

Get GitHub workflow version

### Comment 13

Get current remcode version

### Comment 14

Check if required GitHub secrets are set

### Comment 15

Determine the reason for setup requirements

## Code Overview

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as child_process from 'child_process';
import { getLogger } from '../utils/logger';

// Key exports:
export class SetupDetector { ... }
export interface GitRemoteInfo { ... }
export interface SetupStatus { ... }
```

## File Statistics

- **Lines of Code**: 315
- **File Size**: 9941 bytes
- **Last Modified**: 2025-05-22T10:21:02.992Z

