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

```typescript
class GitHubMCPHandler {
// ... implementation
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

```typescript
interface GitHubMCPOptions {
// ... properties
}
```

