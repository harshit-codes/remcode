# token-manager.ts

**File Path:** `src/utils/token-manager.ts`

## Overview

Token Management Utilities

Handles collection, validation, and storage of API tokens for remcode MCP server

Token Manager class for handling API tokens

Load existing tokens from .env file

Collect missing tokens interactively from user

Prompt user for a specific token

Get the URL where users can obtain each token

Save tokens to .env file

Ensure .env is added to .gitignore

Check if a key is a token key

Convert CLI options to token config

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

