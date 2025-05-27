# client.ts

**File Path**: `github/client.ts`

## Description

Make a request to the GitHub API with automatic retries
 @param endpoint API endpoint (starting with /)
 @param method HTTP method
 @param data Request data (for POST, PUT, PATCH)
 @param config Additional axios config
 @returns Promise with the response data

## Classes

- `GitHubClient`

## Interfaces

- `InternalAxiosRequestConfig`
- `GitHubClientOptions`

## Documentation Comments

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

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Key exports:
export class GitHubClient { ... }
export interface InternalAxiosRequestConfig { ... }
export interface GitHubClientOptions { ... }
```

## File Statistics

- **Lines of Code**: 279
- **File Size**: 8721 bytes
- **Last Modified**: 2025-05-22T09:53:28.816Z

