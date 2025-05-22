# config.ts

**File Path:** `utils/config.ts`

## Overview

Configuration interface with strong typing

## Dependencies

- `./logger`

## Interfaces

### `RemcodeConfig`

```typescript
interface RemcodeConfig {
// ... properties
}
```

## Functions

### `loadConfig()`

```typescript
export function loadConfig(configPath?: string): RemcodeConfig {
```

### `saveConfig()`

```typescript
export function saveConfig(config: Partial<RemcodeConfig>, configPath: string): void {
```

### `getConfigValue()`

```typescript
export function getConfigValue<T>(config: RemcodeConfig, path: string, defaultValue?: T): T | undefined {
```

### `validateConfig()`

```typescript
export function validateConfig(config: RemcodeConfig): {
```

