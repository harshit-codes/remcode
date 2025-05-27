/**
 * Phase 3: Codebase Intelligence Feature Validation
 * Tests the "🧠 Codebase Intelligence" feature from README
 */

import RealMCPClient from '../helpers/real-mcp-client';

describe('Codebase Intelligence Feature', () => {
  let mcpClient: RealMCPClient;
  
  beforeAll(async () => {
    mcpClient = new RealMCPClient();
    const connection = await mcpClient.testConnection();
    expect(connection.connected).toBe(true);
  });

  test('should analyze repository structure', async () => {
    const result = await mcpClient.executeTool('setup-repository', {
      owner: 'test',
      repo: 'remcode'
    });
    
    expect(result.success).toBe(true);
    expect(result.executionTime).toBeLessThan(5000);
  });

  test('should identify code patterns', async () => {
    const result = await mcpClient.executeTool('search-patterns', {
      query: 'authentication patterns'
    });
    
    expect(result.executionTime).toBeLessThan(5000);
  });

  test('should understand project architecture', async () => {
    const result = await mcpClient.executeTool('search-code', {
      query: 'function'
    });
    
    expect(result.executionTime).toBeLessThan(5000);
  });
});
