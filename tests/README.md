# Remcode Testing Guide

This guide covers how to test Remcode functionality, including MCP tools integration with the MCP Inspector.

## Testing Structure

```
tests/
├── unit/           # Unit tests for individual modules
├── integration/    # Integration tests for combined functionality
├── mcp/           # MCP-specific tests and inspector integration
├── e2e/           # End-to-end tests
├── fixtures/      # Test data and mock objects
└── setup.test.ts  # Global test setup
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### MCP Inspector Testing
```bash
npm run test:mcp-inspector
```

## MCP Inspector Integration

The MCP Inspector ([https://inspector.modelcontextprotocol.io](https://inspector.modelcontextprotocol.io)) is a powerful tool for testing MCP servers and tools.

### Manual Testing with MCP Inspector

1. **Start the test server:**
   ```bash
   npm run test:mcp-inspector
   ```

2. **Open MCP Inspector:**
   - Go to [https://inspector.modelcontextprotocol.io](https://inspector.modelcontextprotocol.io)
   - Connect to: `http://localhost:3001`

3. **Test Available Tools:**
   - setup_repository
   - get_repository_status
   - list_repositories
   - search_code
   - get_code_context
   - find_similar_code
   - trigger_reprocessing
   - get_processing_status
   - default_prompt
   - get_scenarios

### Example Test Payloads

**Setup Repository:**
```json
{
  "tool": "setup_repository",
  "parameters": {
    "owner": "your-username",
    "repo": "your-repo",
    "confirm": false
  }
}
```

**Search Code:**
```json
{
  "tool": "search_code",
  "parameters": {
    "query": "authentication function",
    "topK": 5
  }
}
```

**Get Default Prompt:**
```json
{
  "tool": "default_prompt",
  "parameters": {
    "scenario": "refactoring"
  }
}
```

## Test Categories

### Unit Tests
- Test individual classes and functions
- Mock external dependencies
- Fast execution

### Integration Tests
- Test component interactions
- Use real implementations where possible
- Test MCP server startup and configuration

### E2E Tests
- Test complete workflows
- Validate MCP Inspector connectivity
- Test tool specifications

## Environment Variables for Testing

Create a `.env.test` file:
```bash
PINECONE_API_KEY=test-key
GITHUB_TOKEN=test-token
HUGGINGFACE_TOKEN=test-token
LOG_LEVEL=debug
```

## Coverage Reports

Test coverage reports are generated in the `coverage/` directory after running tests.

View coverage: `open coverage/lcov-report/index.html`

## Debugging Tests

### VS Code Debug Configuration
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Running Specific Tests
```bash
# Run specific test file
npm test -- tests/unit/setup.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="search"

# Run in watch mode
npm test -- --watch
```
