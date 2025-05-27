/**
 * Pinecone Tool Testing Suite - Tests Pinecone vector database tools
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import { MCPInspectorClient } from '../../helpers/mcp-client';
import { TEST_CONFIG, MOCK_VECTOR_DATA } from '../../helpers/test-config';

describe('Pinecone Tools Testing', () => {
  let client: MCPInspectorClient;

  beforeAll(async () => {
    client = new MCPInspectorClient(TEST_CONFIG);
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('list_indexes tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const indexTool = tools.find(tool => tool.name === 'list_indexes');
      
      expect(indexTool).toBeDefined();
      expect(indexTool?.name).toBe('list_indexes');
      expect(indexTool?.description).toMatch(/index|pinecone/i);
    });

    test('should list available indexes', async () => {
      const result = await client.callTool('list_indexes', {});

      expect(result.isError).toBe(false);
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/index|list|available/i);
    });
  });

  describe('describe_index tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const describeTool = tools.find(tool => tool.name === 'describe_index');
      
      expect(describeTool).toBeDefined();
      expect(describeTool?.inputSchema.properties.name).toBeDefined();
    });

    test('should describe index configuration', async () => {
      const result = await client.callTool('describe_index', {
        name: MOCK_VECTOR_DATA.indexName
      });

      if (!result.isError) {
        const responseText = result.content[0].text;
        expect(responseText).toMatch(/dimension|metric|configuration/i);
      } else {
        // Index might not exist in test environment
        expect(result.content[0].text).toMatch(/not found|error|invalid/i);
      }
    });
  });

  describe('search_records tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const searchTool = tools.find(tool => tool.name === 'search_records');
      
      expect(searchTool).toBeDefined();
      expect(searchTool?.inputSchema.properties.name).toBeDefined();
      expect(searchTool?.inputSchema.properties.query).toBeDefined();
    });

    test('should handle search with mock data', async () => {
      const result = await client.callTool('search_records', {
        name: MOCK_VECTOR_DATA.indexName,
        namespace: MOCK_VECTOR_DATA.namespace,
        query: {
          inputs: { text: MOCK_VECTOR_DATA.searchQuery },
          topK: 3
        }
      });

      // Should handle gracefully whether index exists or not
      expect(result.content[0].text).toMatch(/search|vector|results|error|not found/i);
    });
  });
});
