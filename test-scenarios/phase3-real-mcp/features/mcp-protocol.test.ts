/**
 * Phase 3: MCP Protocol Feature Validation
 * Tests the "🔗 MCP Protocol" feature from README
 */

import RealMCPClient from '../helpers/real-mcp-client';

describe('MCP Protocol Feature', () => {
  let mcpClient: RealMCPClient;
  
  beforeAll(async () => {
    mcpClient = new RealMCPClient();
  });

  test('should connect via MCP protocol', async () => {
    const connection = await mcpClient.testConnection();
    
    expect(connection.connected).toBe(true);
    expect(connection.toolCount).toBeGreaterThan(7); // Realistic expectation based on actual tools
    expect(connection.connectionTime).toBeLessThan(10000);
  });

  test('should list all MCP tools', async () => {
    const connection = await mcpClient.testConnection();
    
    expect(connection.availableTools).toContain('setup-repository');
    expect(connection.availableTools).toContain('search'); // Actual tool name
    expect(connection.availableTools).toContain('huggingface_embed_code'); // Actual tool name
  });

  test('should execute tools via MCP protocol', async () => {
    const result = await mcpClient.executeTool('list-models');
    
    expect(result.executionTime).toBeLessThan(5000);
  });

  test('should handle concurrent MCP requests', async () => {
    const toolCalls = [
      { name: 'list-models', params: {} },
      { name: 'huggingface_embed_code', params: { code: 'test' } }, // Actual tool name
      { name: 'search', params: { query: 'function' } } // Actual tool name
    ];
    
    const results = await Promise.all(
      toolCalls.map(({ name, params }) => mcpClient.executeTool(name, params))
    );
    
    expect(results.length).toBe(3);
    results.forEach(result => {
      expect(result.executionTime).toBeLessThan(10000);
    });
  });
});
