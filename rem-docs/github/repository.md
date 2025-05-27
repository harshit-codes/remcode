# repository.ts

**File Path**: `github/repository.ts`

## Description

Validate if a repository exists and is accessible

## Classes

- `GitHubRepository`

## Interfaces

- `RepositoryPermissions`
- `Repository`
- `RepositoryBranch`
- `RepositoryContributor`
- `CreateRepositoryOptions`
- `ForkRepositoryOptions`

## Documentation Comments

### Comment 1

Get detailed repository information

### Comment 2

Create a new repository

### Comment 3

List repositories for the authenticated user

### Comment 4

List repositories for a specific organization

### Comment 5

Fork a repository

### Comment 6

List branches for a repository

### Comment 7

Get a specific branch

### Comment 8

Create a new branch

### Comment 9

List contributors for a repository

### Comment 10

Create or update a file in a repository

### Comment 11

Delete a file from a repository

### Comment 12

Get repository contents

### Comment 13

Add collaborator to a repository

## Code Overview

```typescript
import { getLogger } from '../utils/logger';
import { GitHubClient } from './client';

// Key exports:
export class GitHubRepository { ... }
export interface RepositoryPermissions { ... }
export interface Repository { ... }
export interface RepositoryBranch { ... }
export interface RepositoryContributor { ... }
export interface CreateRepositoryOptions { ... }
export interface ForkRepositoryOptions { ... }
```

## File Statistics

- **Lines of Code**: 259
- **File Size**: 7805 bytes
- **Last Modified**: 2025-05-22T09:55:09.575Z

