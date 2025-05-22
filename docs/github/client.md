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

Make a request to the GitHub API with automatic retries

```typescript
class GitHubClient {
// ... implementation
}
```

**Methods:**

#### `makeRequest()`

Make a request to the GitHub API with automatic retries
@param endpoint API endpoint (starting with /)
@param method HTTP method
@param data Request data (for POST, PUT, PATCH)
@param config Additional axios config
@returns Promise with the response data

```typescript
makeRequest(
```

#### `getRepository()`

Get information about a repository

```typescript
getRepository(owner: string, repo: string): Promise<any> {
```

#### `setRepositorySecret()`

Set a repository secret

```typescript
setRepositorySecret(owner: string, repo: string, secretName: string, secretValue: string): Promise<void> {
    // Get the repository's public key for secret encryption
```

#### `createWorkflowDispatch()`

Trigger a workflow dispatch event

```typescript
createWorkflowDispatch(owner: string, repo: string, workflowId: string, ref: string = 'main', inputs?: Record<string, any>): Promise<void> {
```

#### `getWorkflowRun()`

Get information about a workflow run

```typescript
getWorkflowRun(owner: string, repo: string, runId: number): Promise<any> {
```

#### `listWorkflowRuns()`

List workflow runs for a repository or workflow

```typescript
listWorkflowRuns(owner: string, repo: string, workflowId?: string): Promise<any> {
```

#### `createOrUpdateFile()`

Create or update file contents

```typescript
createOrUpdateFile(owner: string, repo: string, path: string, message: string, content: string, sha?: string, branch?: string): Promise<any> {
```

#### `createRepository()`

Create a new repository

```typescript
createRepository(name: string, options: any = {}
```

#### `forkRepository()`

Fork a repository

```typescript
forkRepository(owner: string, repo: string, options: any = {}
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

