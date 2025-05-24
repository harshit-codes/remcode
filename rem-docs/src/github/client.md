# client.ts

**File Path:** `src/github/client.ts`

## Overview

Make a request to the GitHub API with automatic retries
@param endpoint API endpoint (starting with /)
@param method HTTP method
@param data Request data (for POST, PUT, PATCH)
@param config Additional axios config
@returns Promise with the response data

Internal method to handle retries

Get information about a repository

Set a repository secret

Trigger a workflow dispatch event

Get information about a workflow run

List workflow runs for a repository or workflow

Create or update file contents

Create a new repository

Fork a repository

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

