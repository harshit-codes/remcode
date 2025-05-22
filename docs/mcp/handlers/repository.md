# repository.ts

**File Path:** `mcp/handlers/repository.ts`

## Overview

No overview provided.

## Dependencies

- `express`
- `../../utils/logger`
- `../../github/repository`
- `../../github/client`

## Classes

### `RepositoryMCPHandler`

**Class Definition:**

```typescript
export class RepositoryMCPHandler {
  private githubRepository: GitHubRepository;

  constructor(githubToken: string) {
    const githubClient = new GitHubClient({ token: githubToken });
    this.githubRepository = new GitHubRepository(githubClient);
  }

  async handleGetRepositoryStatus(req: Request, res: Response, params?: any): Promise<void> {
    const { owner, repo } = params || req.body;

    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }

    try {
      const repoInfo = await this.githubRepository.getRepositoryInfo(owner, repo);
      
      res.status(200).json({
        repository: repoInfo,
        remcodeStatus: 'initialized',
        lastProcessed: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get repository status' });
    }
  }

  async handleListRepositories(req: Request, res: Response, params?: any): Promise<void> {
    try {
      const repositories = await this.githubRepository.listUserRepositories();
      res.status(200).json({ repositories, total: repositories.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list repositories' });
    }
  }
}
```

**Methods:**

#### `handleGetRepositoryStatus()`

```typescript
handleGetRepositoryStatus(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleListRepositories()`

```typescript
handleListRepositories(req: Request, res: Response, params?: any): Promise<void> {
```

