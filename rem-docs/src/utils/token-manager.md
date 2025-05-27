# token-manager.ts

**File Path:** `src/utils/token-manager.ts`

## Overview

Token Management Utilities

Handles collection, validation, and storage of API tokens for remcode MCP server

## Dependencies

- `./logger`

## Classes

### `for`

```typescript
class for {
  // ... implementation
}
```

### `TokenManager`

```typescript
class TokenManager {
  // ... implementation
}
```

## Interfaces

### `TokenConfig`

```typescript
interface TokenConfig {
  // ... properties
}
```

### `TokenValidationResult`

```typescript
interface TokenValidationResult {
  // ... properties
}
```

## Variables

- `logger`
- `root`
- `envContent`
- `tokens`
- `trimmedLine`
- `value`
- `requiredTokens`
- `finalTokens`
- `missingTokens`
- `tokenKey`
- `description`
- `token`
- `rl`
- `urls`
- `existingOtherVars`
- `existingContent`
- `trimmedLine`
- `envLines`
- `newContent`
- `errorMsg`
- `gitignoreContent`
- `hasEnvEntry`
- `envEntries`
- `tokenKeys`

## Additional Documentation

### Comment 1

Token Manager class for handling API tokens

### Comment 2

Load existing tokens from .env file

### Comment 3

Collect missing tokens interactively from user

### Comment 4

Prompt user for a specific token

### Comment 5

Get the URL where users can obtain each token

### Comment 6

Save tokens to .env file

### Comment 7

Ensure .env is added to .gitignore

### Comment 8

Check if a key is a token key

### Comment 9

Convert CLI options to token config

## File Statistics

- **Lines of Code**: 280
- **File Size**: 8877 bytes
- **Last Modified**: 2025-05-24T14:59:41.009Z

