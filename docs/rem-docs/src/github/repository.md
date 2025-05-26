# repository.ts

**File Path:** `src/github/repository.ts`

## Overview

Validate if a repository exists and is accessible

Get detailed repository information

Create a new repository

List repositories for the authenticated user

List repositories for a specific organization

Fork a repository

List branches for a repository

Get a specific branch

Create a new branch

List contributors for a repository

Create or update a file in a repository

Delete a file from a repository

Get repository contents

Add collaborator to a repository

## Dependencies

- `../utils/logger`
- `./client`

## Classes

### `GitHubRepository`

```typescript
class GitHubRepository {
// ... implementation
}
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
interface Repository {
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

## Variables

- `logger`
- `repoData`
- `params`
- `params`
- `params`
- `params`
- `data`
- `params`

