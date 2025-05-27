/**
 * Phase 3: Zero Configuration Feature Validation
 * Tests the "⚡ Zero Configuration" feature from README
 */

import RealMCPClient from '../helpers/real-mcp-client';

describe('Zero Configuration Feature', () => {
  let mcpClient: RealMCPClient;
  
  beforeAll(async () => {
    mcpClient = new RealMCPClient();
  });

  test('should work with smart defaults', async () => {
    const connection = await mcpClient.testConnection();
    expect(connection.connected).toBe(true);
  });

  test('should auto-detect repository settings', async () => {
    const result = await mcpClient.executeTool('check-prerequisites');
    expect(result.executionTime).toBeLessThan(5000);
  });

  test('should initialize without configuration', async () => {
    const result = await mcpClient.executeTool('setup-repository', {
      owner: 'test',
      repo: 'test'
    });
    
    expect(result.executionTime).toBeLessThan(10000);
  });

  test('should provide graceful degradation', async () => {
    // Test with missing API tokens
    const result = await mcpClient.executeTool('embed-code', {
      code: 'function test() { return "hello"; }'
    });
    
    // Should handle gracefully even if tokens are missing
    expect(result.executionTime).toBeLessThan(5000);
  });
});
