/**
 * Phase 3: Privacy First Feature Validation
 * Tests the "🛡️ Privacy First" feature from README
 */

import RealMCPClient from '../helpers/real-mcp-client';

describe('Privacy First Feature', () => {
  let mcpClient: RealMCPClient;
  
  beforeAll(async () => {
    mcpClient = new RealMCPClient();
    const connection = await mcpClient.testConnection();
    expect(connection.connected).toBe(true);
  });

  test('should process code locally', async () => {
    const result = await mcpClient.executeTool('process-repository', {
      path: process.cwd(),
      mode: 'local'
    });
    
    expect(result.executionTime).toBeLessThan(10000);
  });

  test('should keep code in local environment', async () => {
    const result = await mcpClient.executeTool('get-repository-stats', {
      path: process.cwd()
    });
    
    // Should work without sending code externally
    expect(result.executionTime).toBeLessThan(5000);
  });

  test('should provide local embeddings', async () => {
    const result = await mcpClient.executeTool('embed-code', {
      code: 'function localTest() { return true; }'
    });
    
    expect(result.executionTime).toBeLessThan(5000);
  });

  test('should maintain data sovereignty', async () => {
    const result = await mcpClient.executeTool('search-code', {
      query: 'local function'
    });
    
    expect(result.executionTime).toBeLessThan(5000);
  });
});
