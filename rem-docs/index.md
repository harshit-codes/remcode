# index.ts

**File Path**: `index.ts`

## Description

Smart auto-routing based on context detection
 Automatically determines the appropriate action based on environment

## Documentation Comments

### Comment 1

Detect if running in MCP environment

### Comment 2

Check if current directory is a Git repository

### Comment 3

Check if Remcode configuration exists

## Code Overview

```typescript
import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze';
import { vectorizeCommand } from './commands/vectorize';
import { updateCommand } from './commands/update';
import { serveCommand } from './commands/serve';
// ... 6 more imports

```

## File Statistics

- **Lines of Code**: 163
- **File Size**: 5827 bytes
- **Last Modified**: 2025-05-27T04:54:43.986Z

