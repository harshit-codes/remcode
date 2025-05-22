# github.ts

**File Path:** `mcp/handlers/github.ts`

## Overview

GitHub MCP Handler

Handles GitHub-related MCP requests, allowing AI assistants
to interact with GitHub repositories for codebase analysis.

## Dependencies

- `express`
- `../../utils/logger`

## Classes

### `GitHubMCPHandler`

**Class Definition:**

```typescript
export class GitHubMCPHandler {
  private options: GitHubMCPOptions;
  private baseUrl = 'https://api.github.com';

  constructor(options: GitHubMCPOptions) {
    this.options = options;
  }

  async handleRequest(req: Request, res: Response): Promise<void> {
    const action = req.params.action;
    
    try {
      if (!this.options.token) {
        res.status(401).json({ error: 'GitHub token not provided' });
        return;
      }

      switch (action) {
        case 'get-repo':
          await this.handleGetRepo(req, res);
          break;
        case 'list-files':
          await this.handleListFiles(req, res);
          break;
        case 'get-file':
          await this.handleGetFile(req, res);
          break;
        case 'search-code':
          await this.handleSearchCode(req, res);
          break;
        default:
          res.status(400).json({ error: `Unknown action: ${action}` });
      }
    } catch (error) {
      logger.error(`Error handling GitHub MCP request: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async handleToolRequest(req: Request, res: Response): Promise<void> {
    const { tool, parameters } = req.body;
    
    try {
      if (!this.options.token) {
        res.status(401).json({ error: 'GitHub token not provided' });
        return;
      }

      switch (tool) {
        case 'github_get_repo':
          await this.handleGetRepo(req, res, parameters);
          break;
        case 'github_list_files':
          await this.handleListFiles(req, res, parameters);
          break;
        case 'github_get_file':
          await this.handleGetFile(req, res, parameters);
          break;
        case 'github_search_code':
          await this.handleSearchCode(req, res, parameters);
          break;
        default:
          res.status(400).json({ error: `Unknown tool: ${tool}` });
      }
    } catch (error) {
      logger.error(`Error handling GitHub tool request: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async makeGitHubRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `token ${this.options.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`GitHub API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  private async handleGetRepo(req: Request, res: Response, params?: any): Promise<void> {
    const requestParams = params || req.body;
    const { owner, repo } = requestParams;

    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }

    try {
      const repoData = await this.makeGitHubRequest(`/repos/${owner}/${repo}`);
      res.status(200).json(repoData);
    } catch (error) {
      logger.error(`Error getting GitHub repo: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleListFiles(req: Request, res: Response, params?: any): Promise<void> {
    const requestParams = params || req.body;
    const { owner, repo, path = '', ref = 'main' } = requestParams;

    if (!owner || !repo) {
      res.status(400).json({ error: 'Owner and repo are required' });
      return;
    }

    try {
      const contents = await this.makeGitHubRequest(`/repos/${owner}/${repo}/contents/${path}`, { ref });
      res.status(200).json(contents);
    } catch (error) {
      logger.error(`Error listing GitHub files: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleGetFile(req: Request, res: Response, params?: any): Promise<void> {
    const requestParams = params || req.body;
    const { owner, repo, path, ref = 'main' } = requestParams;

    if (!owner || !repo || !path) {
      res.status(400).json({ error: 'Owner, repo, and path are required' });
      return;
    }

    try {
      const fileData = await this.makeGitHubRequest(`/repos/${owner}/${repo}/contents/${path}`, { ref });
      
      if (Array.isArray(fileData)) {
        res.status(400).json({ error: 'Path points to a directory, not a file' });
        return;
      }

      // For binary files or larger files, GitHub returns a download_url instead of content
      if (fileData.content) {
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        res.status(200).json({ ...fileData, decodedContent: content });
      } else {
        res.status(200).json(fileData);
      }
    } catch (error) {
      logger.error(`Error getting GitHub file: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleSearchCode(req: Request, res: Response, params?: any): Promise<void> {
    const requestParams = params || req.body;
    const { query, owner, repo } = requestParams;

    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    try {
      // Construct the search query to limit to a specific repo if provided
      let searchQuery = query;
      if (owner && repo) {
        searchQuery = `${query} repo:${owner}/${repo}`;
      }

      const searchResults = await this.makeGitHubRequest('/search/code', { q: searchQuery });
      res.status(200).json(searchResults);
    } catch (error) {
      logger.error(`Error searching GitHub code: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
```

**Methods:**

#### `handleRequest()`

```typescript
handleRequest(req: Request, res: Response): Promise<void> {
```

#### `handleToolRequest()`

```typescript
handleToolRequest(req: Request, res: Response): Promise<void> {
```

## Interfaces

### `GitHubMCPOptions`

**Interface Definition:**

```typescript
export interface GitHubMCPOptions {
  token: string;
}
```

