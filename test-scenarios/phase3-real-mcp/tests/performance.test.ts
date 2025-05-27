/**
 * Phase 3: Real MCP Performance Testing
 * Tests actual performance of MCP tools via CLI
 */

import RealMCPClient from '../helpers/real-mcp-client';
import { testConfig } from '../helpers/test-config';

describe('Phase 3: Real MCP Performance', () => {
  let mcpClient: RealMCPClient;
  
  beforeAll(async () => {
    mcpClient = new RealMCPClient();
    
    // Ensure connection before performance tests
    const connection = await mcpClient.testConnection();
    expect(connection.connected).toBe(true);
    console.log(`Connected with ${connection.toolCount} tools in ${connection.connectionTime}ms`);
  });

  describe('Connection Performance', () => {
    test('should connect within 10 seconds', async () => {
      const connection = await mcpClient.testConnection();
      
      expect(connection.connected).toBe(true);
      expect(connection.connectionTime).toBeLessThan(testConfig.performanceThresholds.connectionTime);
      expect(connection.toolCount).toBeGreaterThan(20);
    });
  });

  describe('Tool Execution Performance', () => {
    test('search tools should execute within 5 seconds', async () => {
      const metrics = await mcpClient.measureToolPerformance('search-code', {
        query: 'authentication'
      });
      
      expect(metrics.executionTime).toBeLessThan(testConfig.performanceThresholds.searchTime);
      expect(metrics.success).toBe(true);
    });

    test('embedding tools should execute within 3 seconds', async () => {
      const metrics = await mcpClient.measureToolPerformance('embed-code', {
        code: 'function test() { return "performance test"; }'
      });
      
      expect(metrics.executionTime).toBeLessThan(testConfig.performanceThresholds.embeddingTime);
    });

    test('setup tools should execute within 5 seconds', async () => {
      const metrics = await mcpClient.measureToolPerformance('check-prerequisites');
      
      expect(metrics.executionTime).toBeLessThan(testConfig.performanceThresholds.toolExecutionTime);
    });
  });

  describe('Concurrent Performance', () => {
    test('should handle multiple concurrent requests', async () => {
      const startTime = Date.now();
      
      const toolCalls = [
        { name: 'list-models', params: {} },
        { name: 'search-code', params: { query: 'function' } },
        { name: 'embed-code', params: { code: 'test code' } }
      ];
      
      const results = await Promise.all(
        toolCalls.map(({ name, params }) => mcpClient.executeTool(name, params))
      );
      
      const totalTime = Date.now() - startTime;
      
      expect(results.length).toBe(3);
      expect(totalTime).toBeLessThan(15000); // Should complete within 15 seconds
      
      results.forEach(result => {
        expect(result.executionTime).toBeLessThan(10000);
      });
    });
  });
});
