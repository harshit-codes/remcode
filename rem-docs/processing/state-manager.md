# state-manager.ts

**File Path**: `processing/state-manager.ts`

## Description

Check if the .remcode file exists

## Classes

- `StateManager`

## Interfaces

- `RemcodeState`

## Documentation Comments

### Comment 1

Load the current state from the .remcode file

### Comment 2

Create initial state file if it doesn't exist

### Comment 3

Save state to .remcode file

### Comment 4

Update the state with new values

### Comment 5

Update processing status in the state

### Comment 6

Update processing statistics

### Comment 7

Update vectorization info

### Comment 8

Update repository information

### Comment 9

Update configuration

### Comment 10

Helper method to deep merge objects

### Comment 11

Helper method to check if value is an object

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

// Key exports:
export class StateManager { ... }
export interface RemcodeState { ... }
```

## File Statistics

- **Lines of Code**: 289
- **File Size**: 7666 bytes
- **Last Modified**: 2025-05-22T10:03:37.347Z

