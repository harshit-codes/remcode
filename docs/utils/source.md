# source.ts

**File Path:** `utils/source.ts`

## Overview

Source types supported by the resolver

## Dependencies

- `./logger`

## Interfaces

### `ParsedSource`

```typescript
interface ParsedSource {
// ... properties
}
```

## Functions

### `resolveSource()`

```typescript
export function resolveSource(source: string, options: SourceOptions = {
```

### `detectLanguages()`

```typescript
export function detectLanguages(directory: string): Promise<Record<string, number>> {
```

