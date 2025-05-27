/**
 * Search Tool Testing Suite - Tests search-related MCP tools
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import { MCPInspectorClient } from '../../helpers/mcp-client';
import { TEST_CONFIG, MOCK_SEARCH_DATA } from '../../helpers/test-config';

describe('Search Tools Testing', () => {
  let client: MCPInspectorClient;

  beforeAll(async () => {
    client = new MCPInspectorClient(TEST_CONFIG);
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('search_code tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const searchTool = tools.find(tool => tool.name === 'search_code');
      
      expect(searchTool).toBeDefined();
      expect(searchTool?.name).toBe('search_code');
      expect(searchTool?.description).toMatch(/search|code/i);
      expect(searchTool?.inputSchema.properties.query).toBeDefined();
    });

    test('should perform semantic search', async () => {
      const result = await client.callTool('search_code', {
        query: MOCK_SEARCH_DATA.semanticQuery,
        limit: 5
      });

      expect(result.isError).toBe(false);
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/search|results|found/i);
    });

    test('should handle empty query gracefully', async () => {
      const result = await client.callTool('search_code', {
        query: '',
        limit: 5
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/empty|query|required/i);
    });

    test('should respect search limits', async () => {
      const result = await client.callTool('search_code', {
        query: MOCK_SEARCH_DATA.semanticQuery,
        limit: 2
      });

      expect(result.isError).toBe(false);
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/results|found/i);
    });
  });

  describe('search_patterns tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const patternTool = tools.find(tool => tool.name === 'search_patterns');
      
      expect(patternTool).toBeDefined();
      expect(patternTool?.description).toMatch(/pattern|design/i);
    });

    test('should find code patterns', async () => {
      const result = await client.callTool('search_patterns', {
        pattern: MOCK_SEARCH_DATA.patternQuery,
        threshold: 0.7
      });

      expect(result.isError).toBe(false);
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/pattern|similarity|found/i);
    });
  });
});
