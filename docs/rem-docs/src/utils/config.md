# config.ts

**File Path:** `src/utils/config.ts`

## Overview

Configuration interface with strong typing

Default configuration

Load configuration from a file or use default configuration

Load configuration from environment variables

Save configuration to a file

Get a specific configuration value by path
Example: getConfigValue(config, 'vectorization.storage.provider')

Validate configuration against schema

Deep merge objects

## Dependencies

- `./logger`

## Interfaces

### `with`

```typescript
interface with {
// ... properties
}
```

### `RemcodeConfig`

```typescript
interface RemcodeConfig {
// ... properties
}
```

## Functions

### `loadConfig()`

```typescript
export function loadConfig()
```

### `loadEnvironmentConfig()`

```typescript
export function loadEnvironmentConfig()
```

### `saveConfig()`

```typescript
export function saveConfig()
```

### `getConfigValue()`

```typescript
export function getConfigValue()
```

### `validateConfig()`

```typescript
export function validateConfig()
```

### `deepMerge()`

```typescript
export function deepMerge()
```

## Variables

- `logger`
- `defaultConfig`
- `fileConfig`
- `possibleConfigPaths`
- `possiblePath`
- `ext`
- `content`
- `content`
- `envConfig`
- `mergedConfig`
- `finalConfig`
- `envConfig`
- `dir`
- `ext`
- `content`
- `errorMessage`
- `parts`
- `current`
- `part`
- `errors`
- `output`
- `value`

