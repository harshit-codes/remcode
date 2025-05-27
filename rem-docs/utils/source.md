# source.ts

**File Path**: `utils/source.ts`

## Description

Source types supported by the resolver

## Interfaces

- `ParsedSource`

## Functions

- `resolveSource`
- `detectLanguages`

## Documentation Comments

### Comment 1

Parsed source information

### Comment 2

Resolve a source path or URL to a local directory

### Comment 3

Parse a source string into its components

### Comment 4

Parse a GitHub URL into its components

### Comment 5

Parse a GitLab URL into its components

### Comment 6

Parse a Bitbucket URL into its components

### Comment 7

Parse a generic Git URL into its components

### Comment 8

Parse an HTTP URL

### Comment 9

Parse a local path

### Comment 10

Resolve a GitHub URL to a local directory

### Comment 11

Resolve a local path to an absolute path

### Comment 12

Detect programming languages used in a directory

## Code Overview

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';
import * as util from 'util';
// ... 2 more imports

// Key exports:
export interface ParsedSource { ... }
export function resolveSource(...) { ... }
export function detectLanguages(...) { ... }
```

## File Statistics

- **Lines of Code**: 387
- **File Size**: 10082 bytes
- **Last Modified**: 2025-05-23T05:13:00.133Z

