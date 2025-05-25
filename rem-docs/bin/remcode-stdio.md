# remcode-stdio.js

**File Path:** `bin/remcode-stdio.js`

## Overview

⚠️  DEPRECATED: STDIO Bridge for MCP Inspector

This STDIO bridge is deprecated in favor of direct SSE transport.

🚀 NEW APPROACH - MCP Inspector with SSE:

1. Start MCP server:
   npx remcode inspector
   # OR: node bin/remcode.js serve --port 3008

2. Open MCP Inspector:
   npx @modelcontextprotocol/inspector

3. Configure SSE transport:
   Transport: SSE
   Server URL: http://localhost:3008/sse

4. Connect and test tools!

Benefits of SSE approach:
- ✅ Direct JSON-RPC 2.0 compatibility
- ✅ No timeout issues
- ✅ Real-time bidirectional communication
- ✅ Standard MCP protocol compliance
- ✅ Better error handling

This STDIO bridge will be removed in the next version.

## Variables

- `chalk`

