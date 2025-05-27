# client.ts

**File Path:** `src/github/client.ts`

## Overview

Make a request to the GitHub API with automatic retries
@param endpoint API endpoint (starting with /)
@param method HTTP method
@param data Request data (for POST, PUT, PATCH)
@param config Additional axios config
@returns Promise with the response data

## Dependencies

- `../utils/logger`
- `uuid`

## Classes

### `GitHubClient`

```typescript
class GitHubClient {
  // ... implementation
}
```

## Interfaces

### `InternalAxiosRequestConfig`

```typescript
interface InternalAxiosRequestConfig {
  // ... properties
}
```

### `GitHubClientOptions`

```typescript
interface GitHubClientOptions {
  // ... properties
}
```

### `RetryConfig`

```typescript
interface RetryConfig {
  // ... properties
}
```

## Variables

- `logger`
- `requestId`
- `requestId`
- `requestId`
- `retryConfig`
- `mergedConfig`
- `response`
- `axiosError`
- `status`
- `shouldRetry`
- `delay`
- `resetTimestamp`
- `resetDate`
- `publicKeyResponse`
- `encryptedValue`
- `endpoint`
- `endpoint`
- `data`
- `data`

## Additional Documentation

### Comment 1

Internal method to handle retries

### Comment 2

Get information about a repository

### Comment 3

Set a repository secret

### Comment 4

Trigger a workflow dispatch event

### Comment 5

Get information about a workflow run

### Comment 6

List workflow runs for a repository or workflow

### Comment 7

Create or update file contents

### Comment 8

Create a new repository

### Comment 9

Fork a repository

## File Statistics

- **Lines of Code**: 279
- **File Size**: 8721 bytes
- **Last Modified**: 2025-05-22T09:53:28.816Z

