# repository.ts

**File Path:** `github/repository.ts`

## Overview

Validate if a repository exists and is accessible

## Dependencies

- `../utils/logger`
- `./client`

## Classes

### `GitHubRepository`

**Class Definition:**

```typescript
export class GitHubRepository {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  /**
   * Validate if a repository exists and is accessible
   */
  async validateRepository(owner: string, repo: string): Promise<boolean> {
    try {
      const repoData = await this.client.getRepository(owner, repo);
      return !!repoData;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Repository validation failed: ${error.message}`);
      } else {
        logger.error(`Repository validation failed: ${String(error)}`);
      }
      return false;
    }
  }

  /**
   * Get detailed repository information
   */
  async getRepositoryInfo(owner: string, repo: string): Promise<Repository> {
    logger.info(`Getting repository info for ${owner}/${repo}`);
    return this.client.getRepository(owner, repo);
  }

  /**
   * Create a new repository
   */
  async createRepository(options: CreateRepositoryOptions): Promise<Repository> {
    logger.info(`Creating repository: ${options.name}`);
    return this.client.createRepository(options.name, options);
  }

  /**
   * List repositories for the authenticated user
   */
  async listUserRepositories(type: 'all' | 'owner' | 'public' | 'private' | 'member' = 'all', sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'full_name', direction: 'asc' | 'desc' = 'asc', perPage: number = 30, page: number = 1): Promise<Repository[]> {
    logger.info(`Listing user repositories (type: ${type}, sort: ${sort}, direction: ${direction})`);
    
    const params = new URLSearchParams({
      type,
      sort,
      direction,
      per_page: perPage.toString(),
      page: page.toString()
    });
    
    return this.client.makeRequest(`/user/repos?${params.toString()}`);
  }

  /**
   * List repositories for a specific organization
   */
  async listOrganizationRepositories(org: string, type: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member' = 'all', sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'full_name', direction: 'asc' | 'desc' = 'asc'): Promise<Repository[]> {
    logger.info(`Listing repositories for org: ${org} (type: ${type}, sort: ${sort}, direction: ${direction})`);
    
    const params = new URLSearchParams({
      type,
      sort,
      direction
    });
    
    return this.client.makeRequest(`/orgs/${org}/repos?${params.toString()}`);
  }

  /**
   * Fork a repository
   */
  async forkRepository(owner: string, repo: string, options: ForkRepositoryOptions = {}): Promise<Repository> {
    logger.info(`Forking repository: ${owner}/${repo}${options.organization ? ` to organization ${options.organization}` : ''}`);
    return this.client.forkRepository(owner, repo, options);
  }

  /**
   * List branches for a repository
   */
  async listBranches(owner: string, repo: string, protected_only: boolean = false): Promise<RepositoryBranch[]> {
    logger.info(`Listing branches for ${owner}/${repo}${protected_only ? ' (protected only)' : ''}`);
    
    const params = protected_only ? '?protected=true' : '';
    return this.client.makeRequest(`/repos/${owner}/${repo}/branches${params}`);
  }

  /**
   * Get a specific branch
   */
  async getBranch(owner: string, repo: string, branch: string): Promise<RepositoryBranch> {
    logger.info(`Getting branch ${branch} for ${owner}/${repo}`);
    return this.client.makeRequest(`/repos/${owner}/${repo}/branches/${branch}`);
  }

  /**
   * Create a new branch
   */
  async createBranch(owner: string, repo: string, branchName: string, sha: string): Promise<void> {
    logger.info(`Creating branch ${branchName} for ${owner}/${repo} from SHA ${sha}`);
    
    await this.client.makeRequest(
      `/repos/${owner}/${repo}/git/refs`,
      'POST',
      {
        ref: `refs/heads/${branchName}`,
        sha
      }
    );
  }

  /**
   * List contributors for a repository
   */
  async listContributors(owner: string, repo: string, includeAnonymous: boolean = false): Promise<RepositoryContributor[]> {
    logger.info(`Listing contributors for ${owner}/${repo}${includeAnonymous ? ' (including anonymous)' : ''}`);
    
    const params = includeAnonymous ? '?anon=1' : '';
    return this.client.makeRequest(`/repos/${owner}/${repo}/contributors${params}`);
  }

  /**
   * Create or update a file in a repository
   */
  async createOrUpdateFile(owner: string, repo: string, path: string, message: string, content: string, branch?: string, sha?: string): Promise<any> {
    logger.info(`${sha ? 'Updating' : 'Creating'} file ${path} in ${owner}/${repo}${branch ? ` on branch ${branch}` : ''}`);
    return this.client.createOrUpdateFile(owner, repo, path, message, content, sha, branch);
  }

  /**
   * Delete a file from a repository
   */
  async deleteFile(owner: string, repo: string, path: string, message: string, sha: string, branch?: string): Promise<any> {
    logger.info(`Deleting file ${path} from ${owner}/${repo}${branch ? ` on branch ${branch}` : ''}`);
    
    const data: Record<string, any> = {
      message,
      sha
    };
    
    if (branch) {
      data.branch = branch;
    }
    
    return this.client.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, 'DELETE', data);
  }

  /**
   * Get repository contents
   */
  async getContents(owner: string, repo: string, path: string = '', ref?: string): Promise<any> {
    logger.info(`Getting contents for ${owner}/${repo}/${path}${ref ? ` at ref ${ref}` : ''}`);
    
    const params = ref ? `?ref=${ref}` : '';
    return this.client.makeRequest(`/repos/${owner}/${repo}/contents/${path}${params}`);
  }

  /**
   * Add collaborator to a repository
   */
  async addCollaborator(owner: string, repo: string, username: string, permission: 'pull' | 'push' | 'admin' | 'maintain' | 'triage' = 'push'): Promise<any> {
    logger.info(`Adding collaborator ${username} to ${owner}/${repo} with ${permission} permission`);
    
    return this.client.makeRequest(
      `/repos/${owner}/${repo}/collaborators/${username}`,
      'PUT',
      { permission }
    );
  }
}
```

**Methods:**

#### `validateRepository()`

Validate if a repository exists and is accessible

```typescript
validateRepository(owner: string, repo: string): Promise<boolean> {
```

#### `getRepositoryInfo()`

Get detailed repository information

```typescript
getRepositoryInfo(owner: string, repo: string): Promise<Repository> {
```

#### `createRepository()`

Create a new repository

```typescript
createRepository(options: CreateRepositoryOptions): Promise<Repository> {
```

#### `listUserRepositories()`

List repositories for the authenticated user

```typescript
listUserRepositories(type: 'all' | 'owner' | 'public' | 'private' | 'member' = 'all', sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'full_name', direction: 'asc' | 'desc' = 'asc', perPage: number = 30, page: number = 1): Promise<Repository[]> {
```

#### `listOrganizationRepositories()`

List repositories for a specific organization

```typescript
listOrganizationRepositories(org: string, type: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member' = 'all', sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'full_name', direction: 'asc' | 'desc' = 'asc'): Promise<Repository[]> {
```

#### `forkRepository()`

Fork a repository

```typescript
forkRepository(owner: string, repo: string, options: ForkRepositoryOptions = {}
```

#### `listBranches()`

List branches for a repository

```typescript
listBranches(owner: string, repo: string, protected_only: boolean = false): Promise<RepositoryBranch[]> {
```

#### `getBranch()`

Get a specific branch

```typescript
getBranch(owner: string, repo: string, branch: string): Promise<RepositoryBranch> {
```

#### `createBranch()`

Create a new branch

```typescript
createBranch(owner: string, repo: string, branchName: string, sha: string): Promise<void> {
```

#### `listContributors()`

List contributors for a repository

```typescript
listContributors(owner: string, repo: string, includeAnonymous: boolean = false): Promise<RepositoryContributor[]> {
```

#### `createOrUpdateFile()`

Create or update a file in a repository

```typescript
createOrUpdateFile(owner: string, repo: string, path: string, message: string, content: string, branch?: string, sha?: string): Promise<any> {
```

#### `deleteFile()`

Delete a file from a repository

```typescript
deleteFile(owner: string, repo: string, path: string, message: string, sha: string, branch?: string): Promise<any> {
```

#### `getContents()`

Get repository contents

```typescript
getContents(owner: string, repo: string, path: string = '', ref?: string): Promise<any> {
```

#### `addCollaborator()`

Add collaborator to a repository

```typescript
addCollaborator(owner: string, repo: string, username: string, permission: 'pull' | 'push' | 'admin' | 'maintain' | 'triage' = 'push'): Promise<any> {
```

## Interfaces

### `RepositoryPermissions`

**Interface Definition:**

```typescript
export interface RepositoryPermissions {
  admin: boolean;
  maintain: boolean;
  push: boolean;
  triage: boolean;
  pull: boolean;
}
```

### `Repository`

**Interface Definition:**

```typescript
export interface RepositoryPermissions {
  admin: boolean;
  maintain: boolean;
  push: boolean;
  triage: boolean;
  pull: boolean;
}
```

### `RepositoryBranch`

**Interface Definition:**

```typescript
export interface RepositoryBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
  protection?: any;
}
```

### `RepositoryContributor`

**Interface Definition:**

```typescript
export interface RepositoryContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
}
```

### `CreateRepositoryOptions`

**Interface Definition:**

```typescript
export interface CreateRepositoryOptions {
  name: string;
  description?: string;
  homepage?: string;
  private?: boolean;
  has_issues?: boolean;
  has_projects?: boolean;
  has_wiki?: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
  allow_squash_merge?: boolean;
  allow_merge_commit?: boolean;
  allow_rebase_merge?: boolean;
  delete_branch_on_merge?: boolean;
}
```

### `ForkRepositoryOptions`

**Interface Definition:**

```typescript
export interface ForkRepositoryOptions {
  organization?: string;
  name?: string;
  default_branch_only?: boolean;
}
```

