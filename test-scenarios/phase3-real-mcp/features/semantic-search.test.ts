/**
 * Phase 3: Semantic Search Feature Validation
 * Tests the "🔍 Semantic Search" feature from README
 */

import RealMCPClient from '../helpers/real-mcp-client';

describe('Semantic Search Feature', () => {
  let mcpClient: RealMCPClient;
  
  beforeAll(async () => {
    mcpClient = new RealMCPClient();
    const connection = await mcpClient.testConnection();
    expect(connection.connected).toBe(true);
  });

  test('should find code by meaning not keywords', async () => {
    const result = await mcpClient.executeTool('search-code', {
      query: 'authentication patterns'
    });
    
    expect(result.executionTime).toBeLessThan(5000);
  });

  test('should perform semantic similarity search', async () => {
    const result = await mcpClient.executeTool('search-similar', {
      code: 'function authenticate(user, password)'
    });
    
    expect(result.executionTime).toBeLessThan(5000);
  });

  test('should generate embeddings for code', async () => {
    const result = await mcpClient.executeTool('embed-code', {
      code: 'export function processData(input: string)'
    });
    
    expect(result.executionTime).toBeLessThan(3000);
  });
});
