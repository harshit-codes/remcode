# client.ts

**File Path:** `github/client.ts`

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

**Methods:**

- `if()`
- `endpoint()`
- `data()`
- `makeRequest()`
- `uuidv4()`
- `if()`
- `makeRequestWithRetry()`
- `catch()`
- `if()`
- `retry()`
- `if()`
- `Promise()`
- `if()`
- `if()`
- `Date()`
- `getRepository()`
- `setRepositorySecret()`
- `sodium()`
- `createWorkflowDispatch()`
- `getWorkflowRun()`
- `listWorkflowRuns()`
- `createOrUpdateFile()`
- `if()`
- `if()`
- `createRepository()`
- `forkRepository()`

## Interfaces

### `InternalAxiosRequestConfig`

**Properties:**

- `requestId?: string;`
- `}`

### `GitHubClientOptions`

**Properties:**

- `token: string;`
- `baseUrl?: string;`
- `maxRetries?: number;`
- `retryDelay?: number;`
- `timeout?: number;`

