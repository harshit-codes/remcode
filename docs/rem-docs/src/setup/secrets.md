# secrets.ts

**File Path:** `src/setup/secrets.ts`

## Overview

Secret configuration

Secret operation result

Secret operation summary

Class to manage GitHub repository secrets for Remcode

Constructor
@param githubToken GitHub API token

Configure required repository secrets
@param owner Repository owner
@param repo Repository name
@returns Summary of secret operations

Get required secrets for Remcode
@returns List of required secrets

Set a repository secret in GitHub
@param owner Repository owner
@param repo Repository name
@param secret Secret configuration
@returns Secret operation result

Encrypt a secret value using sodium for GitHub
@param publicKey Base64-encoded public key
@param secretValue Secret value to encrypt
@returns Base64-encoded encrypted secret

Check if a repository has a specific secret
@param owner Repository owner
@param repo Repository name
@param secretName Secret name to check
@returns True if the secret exists

Delete a repository secret
@param owner Repository owner
@param repo Repository name
@param secretName Secret name to delete
@returns True if the secret was deleted

## Dependencies

- `@octokit/rest`
- `../utils/logger`

## Classes

### `SecretsManager`

```typescript
class SecretsManager {
// ... implementation
}
```

## Interfaces

### `SecretConfig`

```typescript
interface SecretConfig {
// ... properties
}
```

### `SecretOperationResult`

```typescript
interface SecretOperationResult {
// ... properties
}
```

### `SecretsOperationSummary`

```typescript
interface SecretsOperationSummary {
// ... properties
}
```

## Variables

- `logger`
- `secrets`
- `results`
- `secret`
- `result`
- `errorMessage`
- `successful`
- `summary`
- `encryptedValue`
- `errorMessage`
- `publicKeyBytes`
- `secretBytes`
- `encryptedBytes`
- `errorMessage`
- `errorMessage`

