/**
 * Performance Testing Suite - Tests tool execution performance
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import { MCPInspectorClient } from '../../helpers/mcp-client';
import { TEST_CONFIG } from '../../helpers/test-config';

describe('MCP Tools Performance Testing', () => {
  let client: MCPInspectorClient;

  beforeAll(async () => {
    client = new MCPInspectorClient(TEST_CONFIG);
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('Tool Response Times', () => {
    const PERFORMANCE_THRESHOLD = 5000; // 5 seconds max

    test('setup tools should respond within threshold', async () => {
      const setupTools = ['setup-repository', 'check-prerequisites'];
      
      for (const toolName of setupTools) {
        const startTime = Date.now();
        
        await client.callTool(toolName, {
          owner: 'test-owner',
          repo: 'test-repo'
        });
        
        const executionTime = Date.now() - startTime;
        expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD);
      }
    });

    test('search tools should respond within threshold', async () => {
      const searchTools = ['search_code', 'search_patterns'];
      
      for (const toolName of searchTools) {
        const startTime = Date.now();
        
        await client.callTool(toolName, {
          query: 'function test'
        });
        
        const executionTime = Date.now() - startTime;
        expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD);
      }
    });

    test('service tools should respond within threshold', async () => {
      const serviceTools = ['list_models', 'list_indexes', 'get_processing_status'];
      
      for (const toolName of serviceTools) {
        const startTime = Date.now();
        
        await client.callTool(toolName, {});
        
        const executionTime = Date.now() - startTime;
        expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD);
      }
    });
  });

  describe('Concurrent Tool Execution', () => {
    test('should handle multiple concurrent tool calls', async () => {
      const promises = [
        client.callTool('list_models', {}),
        client.callTool('get_processing_status', {}),
        client.callTool('check-prerequisites', { path: '.' })
      ];

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.content).toBeDefined();
        expect(result.content[0]).toBeDefined();
      });
    });
  });
});
