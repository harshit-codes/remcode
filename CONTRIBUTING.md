# Contributing to Remcode

## Quick Start

1. Fork and clone the repo
2. Run `npm install && npm run build`
3. Create `.env` with your API keys
4. Make changes and test with `npm run serve`

## Adding New MCP Tools

### 1. Choose Handler Category
- **GitHub** (`src/mcp/handlers/github.ts`) - Repository operations
- **Pinecone** (`src/mcp/handlers/pinecone.ts`) - Vector operations
- **HuggingFace** (`src/mcp/handlers/huggingface.ts`) - AI models

### 2. Add Tool Method
```typescript
private async handleYourTool(req: Request, res: Response, params?: any): Promise<void> {
  const { param1, param2 } = params || req.body;
  
  if (!param1) {
    res.status(400).json({ error: 'param1 is required' });
    return;
  }

  try {
    // Your implementation
    const result = await this.doSomething(param1, param2);
    res.status(200).json({ result });
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}
```

### 3. Register Tool
Add to both handler methods:
```typescript
// In handleRequest
case 'your-tool':
  await this.handleYourTool(req, res);
  break;

// In handleToolRequest  
case 'service_your_tool':
  await this.handleYourTool(req, res, parameters);
  break;
```

### 4. Add to MCP Spec
In `src/mcp/index.ts`, add to tools array:
```typescript
{
  name: 'service_your_tool',
  description: 'Clear description of what this tool does',
  parameters: {
    param1: { type: 'string', description: 'Required parameter' },
    param2: { type: 'string', description: 'Optional parameter', optional: true }
  }
}
```

## Available MCP Tools

### GitHub Tools
- `github_get_repo` - Get repository metadata
- `github_list_files` - List files in repository  
- `github_get_file` - Get file contents
- `github_search_code` - Search code in repository

### Pinecone Tools  
- `pinecone_query` - Search vectors
- `pinecone_list_indexes` - List available indexes

### HuggingFace Tools
- `huggingface_embed_code` - Generate code embeddings
- `huggingface_embed_query` - Generate query embeddings
- `huggingface_list_models` - List embedding models

### Remcode Tools
- `remcode_status` - Check processing status
- `remcode_search` - Semantic code search

## Testing
```bash
# Test your tool
curl -X POST http://localhost:3000/v1/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "your_tool", "parameters": {"param1": "test"}}'
```

## Best Practices
- Use clear, descriptive tool names
- Validate all required parameters
- Return consistent error formats
- Add proper logging
- Test manually before submitting
