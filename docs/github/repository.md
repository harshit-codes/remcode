# repository.ts

**File Path:** `github/repository.ts`

## Overview

Validate if a repository exists and is accessible

## Dependencies

- `../utils/logger`
- `./client`

## Classes

### `GitHubRepository`

Validate if a repository exists and is accessible

```typescript
class GitHubRepository {
// ... implementation
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

```typescript
interface RepositoryPermissions {
// ... properties
}
```

### `Repository`

```typescript
interface RepositoryPermissions {
// ... properties
}
```

### `RepositoryBranch`

```typescript
interface RepositoryBranch {
// ... properties
}
```

### `RepositoryContributor`

```typescript
interface RepositoryContributor {
// ... properties
}
```

### `CreateRepositoryOptions`

```typescript
interface CreateRepositoryOptions {
// ... properties
}
```

### `ForkRepositoryOptions`

```typescript
interface ForkRepositoryOptions {
// ... properties
}
```

