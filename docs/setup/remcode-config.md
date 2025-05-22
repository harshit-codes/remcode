# remcode-config.ts

**File Path:** `setup/remcode-config.ts`

## Overview

Available embedding models

## Dependencies

- `../utils/logger`

## Classes

### `RemcodeConfigManager`

Constructor

```typescript
class RemcodeConfigManager {
// ... implementation
}
```

**Methods:**

#### `createInitialConfig()`

Create initial configuration file
@param owner Repository owner
@param repo Repository name
@param options Additional configuration options
@returns The created configuration

```typescript
createInitialConfig(
```

#### `buildInitialConfig()`

Build initial configuration
@param owner Repository owner
@param repo Repository name
@param options Additional configuration options
@returns Initial configuration

```typescript
buildInitialConfig(
```

#### `upgradeConfig()`

Upgrade configuration to the latest version
@param config Configuration to upgrade

```typescript
upgradeConfig(config: RemcodeConfig): void {
    // Store the original version for logging
```

## Interfaces

### `RepositoryConfig`

```typescript
interface RepositoryConfig {
// ... properties
}
```

### `ProcessingConfig`

```typescript
interface ProcessingConfig {
// ... properties
}
```

### `VectorizationConfig`

```typescript
interface VectorizationConfig {
// ... properties
}
```

### `StatisticsConfig`

```typescript
interface StatisticsConfig {
// ... properties
}
```

### `AdvancedConfig`

```typescript
interface AdvancedConfig {
// ... properties
}
```

### `WebhookConfig`

```typescript
interface WebhookConfig {
// ... properties
}
```

### `RemcodeConfig`

```typescript
interface RemcodeConfig {
// ... properties
}
```

### `ConfigValidationResult`

```typescript
interface ConfigValidationResult {
// ... properties
}
```

