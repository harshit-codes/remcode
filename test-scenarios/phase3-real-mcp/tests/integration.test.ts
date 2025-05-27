/**
 * Phase 3: End-to-End Integration Testing
 * Tests complete workflows via real MCP CLI
 */

import RealMCPClient from '../helpers/real-mcp-client';

describe('Phase 3: End-to-End Integration', () => {
  let mcpClient: RealMCPClient;
  
  beforeAll(async () => {
    mcpClient = new RealMCPClient();
    const connection = await mcpClient.testConnection();
    expect(connection.connected).toBe(true);
  });

  test('complete setup workflow', async () => {
    // Test the complete README workflow
    const steps = [
      { name: 'check-prerequisites', params: {} },
      { name: 'setup-repository', params: { owner: 'test', repo: 'test' } },
      { name: 'search-code', params: { query: 'authentication patterns' } }
    ];
    
    for (const step of steps) {
      const result = await mcpClient.executeTool(step.name, step.params);
      expect(result.executionTime).toBeLessThan(10000);
    }
  });

  test('semantic search workflow', async () => {
    const result = await mcpClient.executeTool('search-code', {
      query: 'What authentication patterns are used in this codebase?'
    });
    
    expect(result.executionTime).toBeLessThan(5000);
  });

  test('code analysis workflow', async () => {
    const embeddingResult = await mcpClient.executeTool('embed-code', {
      code: 'export function authenticate(user: string, pass: string): boolean'
    });
    
    expect(embeddingResult.executionTime).toBeLessThan(3000);
    
    const searchResult = await mcpClient.executeTool('search-similar', {
      code: 'login functionality'
    });
    
    expect(searchResult.executionTime).toBeLessThan(5000);
  });
});
