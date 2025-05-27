/**
 * HuggingFace Tool Testing Suite - Tests HuggingFace embedding tools
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import { MCPInspectorClient } from '../../helpers/mcp-client';
import { TEST_CONFIG, MOCK_EMBEDDING_DATA } from '../../helpers/test-config';

describe('HuggingFace Tools Testing', () => {
  let client: MCPInspectorClient;

  beforeAll(async () => {
    client = new MCPInspectorClient(TEST_CONFIG);
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('embed_code tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const embedTool = tools.find(tool => tool.name === 'embed_code');
      
      expect(embedTool).toBeDefined();
      expect(embedTool?.name).toBe('embed_code');
      expect(embedTool?.description).toMatch(/embed|code|vector/i);
      expect(embedTool?.inputSchema.properties.code).toBeDefined();
    });

    test('should generate embeddings for code', async () => {
      const result = await client.callTool('embed_code', {
        code: MOCK_EMBEDDING_DATA.sampleCode,
        language: 'typescript'
      });

      expect(result.isError).toBe(false);
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/embedding|vector|generated/i);
    });

    test('should handle empty code gracefully', async () => {
      const result = await client.callTool('embed_code', {
        code: '',
        language: 'typescript'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/empty|code|required/i);
    });
  });

  describe('embed_query tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const queryTool = tools.find(tool => tool.name === 'embed_query');
      
      expect(queryTool).toBeDefined();
      expect(queryTool?.inputSchema.properties.query).toBeDefined();
    });

    test('should generate embeddings for queries', async () => {
      const result = await client.callTool('embed_query', {
        query: MOCK_EMBEDDING_DATA.sampleQuery
      });

      expect(result.isError).toBe(false);
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/embedding|vector|query/i);
    });
  });

  describe('list_models tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const modelsTool = tools.find(tool => tool.name === 'list_models');
      
      expect(modelsTool).toBeDefined();
    });

    test('should list available models', async () => {
      const result = await client.callTool('list_models', {});

      expect(result.isError).toBe(false);
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/model|available|list/i);
    });
  });
});
