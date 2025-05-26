# e2e-workflow-test.js

**File Path:** `scripts/e2e-workflow-test.js`

## Overview

End-to-End Workflow Testing Script

Tests the complete Remcode workflow:
1. First-time repository setup via MCP
2. GitHub Actions processing pipeline
3. Real embeddings and vectorization
4. Semantic search functionality

Make HTTP request to MCP server

## Functions

### `mcpRequest()`

```typescript
export function mcpRequest()
```

## Variables

- `http`
- `fs`
- `path`
- `TEST_REPO_PATH`
- `MCP_SERVER_URL`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `postData`
- `options`
- `req`
- `data`
- `result`

