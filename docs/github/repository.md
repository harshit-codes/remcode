# repository.ts

**File Path:** `github/repository.ts`

## Overview

Validate if a repository exists and is accessible

## Dependencies

- `../utils/logger`
- `./client`

## Classes

### `GitHubRepository`

**Methods:**

- `validateRepository()`
- `catch()`
- `if()`
- `getRepositoryInfo()`
- `createRepository()`
- `listUserRepositories()`
- `repositories()`
- `URLSearchParams()`
- `listOrganizationRepositories()`
- `URLSearchParams()`
- `forkRepository()`
- `listBranches()`
- `getBranch()`
- `createBranch()`
- `listContributors()`
- `createOrUpdateFile()`
- `deleteFile()`
- `if()`
- `getContents()`
- `addCollaborator()`

## Interfaces

### `RepositoryPermissions`

**Properties:**

- `admin: boolean;`
- `maintain: boolean;`
- `push: boolean;`
- `triage: boolean;`
- `pull: boolean;`

### `Repository`

**Properties:**

- `admin: boolean;`
- `maintain: boolean;`
- `push: boolean;`
- `triage: boolean;`
- `pull: boolean;`

### `RepositoryBranch`

**Properties:**

- `name: string;`
- `commit: {`
- `sha: string;`
- `url: string;`
- `};`
- `protected: boolean;`
- `protection?: any;`

### `RepositoryContributor`

**Properties:**

- `login: string;`
- `id: number;`
- `avatar_url: string;`
- `html_url: string;`
- `contributions: number;`

### `CreateRepositoryOptions`

**Properties:**

- `name: string;`
- `description?: string;`
- `homepage?: string;`
- `private?: boolean;`
- `has_issues?: boolean;`
- `has_projects?: boolean;`
- `has_wiki?: boolean;`
- `auto_init?: boolean;`
- `gitignore_template?: string;`
- `license_template?: string;`
- `allow_squash_merge?: boolean;`
- `allow_merge_commit?: boolean;`
- `allow_rebase_merge?: boolean;`
- `delete_branch_on_merge?: boolean;`

### `ForkRepositoryOptions`

**Properties:**

- `organization?: string;`
- `name?: string;`
- `default_branch_only?: boolean;`

