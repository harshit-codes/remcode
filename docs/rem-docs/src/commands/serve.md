# serve.ts

**File Path:** `src/commands/serve.ts`

## Overview

Enhanced MCP Server Command

Command to start the Model Context Protocol (MCP) server with smart token management
and automatic port selection for AI assistant integration

## Dependencies

- `commander`
- `../mcp`
- `../utils/logger`
- `../utils/token-manager`
- `../utils/port-manager`

## Functions

### `serveCommand()`

```typescript
export function serveCommand()
```

## Variables

- `logger`
- `logLevel`
- `envLevel`
- `preferredPort`
- `selectedPort`
- `tokenManager`
- `existingTokens`
- `cliTokens`
- `finalTokens`
- `hasNewTokens`
- `missingCriticalTokens`
- `spinner`
- `server`
- `gracefulShutdown`

