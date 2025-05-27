# port-manager.ts

**File Path**: `utils/port-manager.ts`

## Description

Port Management Utilities
 
 Handles smart port selection with auto-increment and availability checking

## Classes

- `PortManager`

## Interfaces

- `PortResult`

## Documentation Comments

### Comment 1

Port Manager class for handling port selection

### Comment 2

Check if a port is available

### Comment 3

Check if a port is available on a specific interface

### Comment 4

Find an available port starting from the preferred port

### Comment 5

Get an available port with user-friendly messaging

## Code Overview

```typescript
import { createServer } from 'net';
import chalk from 'chalk';
import { getLogger } from './logger';

// Key exports:
export class PortManager { ... }
export interface PortResult { ... }
```

## File Statistics

- **Lines of Code**: 104
- **File Size**: 2853 bytes
- **Last Modified**: 2025-05-24T15:01:43.101Z

