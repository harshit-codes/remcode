# remcode-config.ts

**File Path:** `src/setup/remcode-config.ts`

## Overview

Available embedding models

Vector DB providers

Processing status values

Repository configuration

Processing configuration

Vectorization configuration

Statistics configuration

Advanced configuration options

Webhook configuration

Complete Remcode configuration

Configuration validation result

Class to manage Remcode configuration

Constructor
@param repoPath Path to the repository

Create initial configuration file
@param owner Repository owner
@param repo Repository name
@param options Additional configuration options
@returns The created configuration

Read configuration from file
@returns The current configuration

Update configuration with new values
@param updates Configuration updates
@returns The updated configuration

Update processing status and statistics
@param status New processing status
@param stats Updated statistics
@param commit Last processed commit hash
@returns The updated configuration

Validate configuration
@param config Configuration to validate
@returns Validation result

Build initial configuration
@param owner Repository owner
@param repo Repository name
@param options Additional configuration options
@returns Initial configuration

',
          '.git/**',
          'dist/**',
          'build/**',
          '*

Deep merge two objects
@param target Target object
@param source Source object
@returns Merged object

Upgrade configuration to the latest version
@param config Configuration to upgrade

',
            '.git/**',
            'dist/**',
            'build/**',
            '*

Check if configuration exists
@returns True if configuration exists

Delete configuration file
@returns True if configuration was deleted

Helper function to check if a value is an object
@param item Item to check
@returns True if the item is an object

## Dependencies

- `../utils/logger`

## Classes

### `RemcodeConfigManager`

```typescript
class RemcodeConfigManager {
// ... implementation
}
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

## Functions

### `to()`

```typescript
export function to()
```

### `isObject()`

```typescript
export function isObject()
```

## Variables

- `logger`
- `config`
- `validation`
- `errorMessage`
- `configContent`
- `config`
- `errorMessage`
- `config`
- `owner`
- `repo`
- `updatedConfig`
- `validation`
- `errorMessage`
- `config`
- `errorMessage`
- `errors`
- `warnings`
- `validProviders`
- `validModels`
- `defaultBranch`
- `baseConfig`
- `output`
- `sourceValue`
- `originalVersion`
- `errorMessage`

