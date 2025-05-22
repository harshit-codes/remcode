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

**Class Definition:**

```typescript
export class GitHubClient {
  private token: string;
  private baseUrl: string;
  private axios: AxiosInstance;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options: GitHubClientOptions) {
    this.token = options.token;
    this.baseUrl = options.baseUrl || 'https://api.github.com';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;

    // Create axios instance with default config
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: options.timeout || 30000, // Default 30 second timeout
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28', // Using latest stable GitHub API version
        'User-Agent': 'Remcode-GitHub-Client',
      }
    });

    // Add response interceptor for logging
    this.axios.interceptors.response.use(
      (response) => {
        const requestId = response.config['requestId'];
        logger.debug(`GitHub API response [${requestId}]: ${response.status}`);
        return response;
      },
      (error: AxiosError) => {
        const requestId = error.config?.['requestId'] || 'unknown';
        if (error.response) {
          logger.error(`GitHub API error [${requestId}]: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
          logger.error(`GitHub API error [${requestId}]: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a request to the GitHub API with automatic retries
   * @param endpoint API endpoint (starting with /)
   * @param method HTTP method
   * @param data Request data (for POST, PUT, PATCH)
   * @param config Additional axios config
   * @returns Promise with the response data
   */
  async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any,
    config: AxiosRequestConfig = {}
  ): Promise<any> {
    const requestId = uuidv4().substring(0, 8);
    const retryConfig: RetryConfig = {
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      currentRetry: 0
    };

    logger.info(`GitHub API ${method} ${endpoint} [${requestId}]`);
    if (data) {
      logger.debug(`Request data [${requestId}]:`, data);
    }

    return this.makeRequestWithRetry(endpoint, method, data, config, retryConfig, requestId);
  }

  /**
   * Internal method to handle retries
   */
  private async makeRequestWithRetry(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    data: any,
    config: AxiosRequestConfig,
    retryConfig: RetryConfig,
    requestId: string
  ): Promise<any> {
    try {
      const mergedConfig = {
        ...config,
        requestId // Store request ID for logging in interceptors
      };

      const response = await this.axios.request({
        method,
        url: endpoint,
        data,
        ...mergedConfig
      });

      return response.data;
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status || 0;

      // Check if we should retry (network errors or specific status codes)
      const shouldRetry = (
        retryConfig.currentRetry < retryConfig.maxRetries &&
        (
          !axiosError.response ||
          status === 429 || // Rate limit
          status === 502 || // Bad gateway
          status === 503 || // Service unavailable
          status === 504    // Gateway timeout
        )
      );

      if (shouldRetry) {
        retryConfig.currentRetry += 1;
        const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.currentRetry - 1);
        
        logger.warn(`Retrying GitHub API request [${requestId}] (${retryConfig.currentRetry}/${retryConfig.maxRetries}) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequestWithRetry(endpoint, method, data, config, retryConfig, requestId);
      }

      // Check for rate limiting specifically
      if (status === 403 && axiosError.response?.headers?.['x-ratelimit-remaining'] === '0') {
        const resetTimestamp = axiosError.response?.headers?.['x-ratelimit-reset'];
        if (resetTimestamp) {
          const resetDate = new Date(parseInt(resetTimestamp) * 1000);
          logger.error(`GitHub API rate limit exceeded [${requestId}]. Resets at ${resetDate.toISOString()}`);
        } else {
          logger.error(`GitHub API rate limit exceeded [${requestId}]`);
        }
      }

      // Rethrow the error
      throw error;
    }
  }

  /**
   * Get information about a repository
   */
  async getRepository(owner: string, repo: string): Promise<any> {
    return this.makeRequest(`/repos/${owner}/${repo}`);
  }

  /**
   * Set a repository secret
   */
  async setRepositorySecret(owner: string, repo: string, secretName: string, secretValue: string): Promise<void> {
    // Get the repository's public key for secret encryption
    const publicKeyResponse = await this.makeRequest(`/repos/${owner}/${repo}/actions/secrets/public-key`);
    const { key, key_id } = publicKeyResponse;

    // Encrypt the secret using sodium (this requires the libsodium-wrappers package)
    // For now, this is just a placeholder for the actual encryption code
    logger.info(`Encrypting secret ${secretName} for repository ${owner}/${repo}`);
    const encryptedValue = Buffer.from(secretValue).toString('base64'); // This is a placeholder

    // Set the secret
    await this.makeRequest(
      `/repos/${owner}/${repo}/actions/secrets/${secretName}`,
      'PUT',
      {
        encrypted_value: encryptedValue,
        key_id
      }
    );

    logger.info(`Secret ${secretName} set successfully for ${owner}/${repo}`);
  }

  /**
   * Trigger a workflow dispatch event
   */
  async createWorkflowDispatch(owner: string, repo: string, workflowId: string, ref: string = 'main', inputs?: Record<string, any>): Promise<void> {
    await this.makeRequest(
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
      'POST',
      {
        ref,
        inputs
      }
    );
    logger.info(`Triggered workflow ${workflowId} for ${owner}/${repo} on ref ${ref}`);
  }

  /**
   * Get information about a workflow run
   */
  async getWorkflowRun(owner: string, repo: string, runId: number): Promise<any> {
    return this.makeRequest(`/repos/${owner}/${repo}/actions/runs/${runId}`);
  }

  /**
   * List workflow runs for a repository or workflow
   */
  async listWorkflowRuns(owner: string, repo: string, workflowId?: string): Promise<any> {
    const endpoint = workflowId
      ? `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`
      : `/repos/${owner}/${repo}/actions/runs`;
      
    return this.makeRequest(endpoint);
  }

  /**
   * Create or update file contents
   */
  async createOrUpdateFile(owner: string, repo: string, path: string, message: string, content: string, sha?: string, branch?: string): Promise<any> {
    const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
    const data: Record<string, any> = {
      message,
      content: Buffer.from(content).toString('base64'),
    };

    if (branch) {
      data.branch = branch;
    }

    if (sha) {
      data.sha = sha;
    }

    return this.makeRequest(endpoint, 'PUT', data);
  }

  /**
   * Create a new repository
   */
  async createRepository(name: string, options: any = {}): Promise<any> {
    const data = {
      name,
      private: options.private || false,
      description: options.description || '',
      auto_init: options.autoInit || false,
      ...options
    };

    return this.makeRequest('/user/repos', 'POST', data);
  }

  /**
   * Fork a repository
   */
  async forkRepository(owner: string, repo: string, options: any = {}): Promise<any> {
    return this.makeRequest(`/repos/${owner}/${repo}/forks`, 'POST', options);
  }
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

**Interface Definition:**

```typescript
export interface InternalAxiosRequestConfig {
    requestId?: string;
  }
```

### `GitHubClientOptions`

**Interface Definition:**

```typescript
export interface GitHubClientOptions {
  token: string;
  baseUrl?: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}
```

