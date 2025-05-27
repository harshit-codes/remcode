/**
 * Error Handling Testing Suite - Tests graceful error handling
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import { MCPInspectorClient } from '../../helpers/mcp-client';
import { TEST_CONFIG } from '../../helpers/test-config';

describe('Error Handling Testing', () => {
  let client: MCPInspectorClient;

  beforeAll(async () => {
    client = new MCPInspectorClient(TEST_CONFIG);
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('Missing Token Scenarios', () => {
    test('should handle missing Pinecone token gracefully', async () => {
      const result = await client.callTool('list_indexes', {});

      // Should provide helpful guidance even without token
      expect(result.content[0].text).toMatch(/pinecone|token|configure|error/i);
    });

    test('should handle missing HuggingFace token gracefully', async () => {
      const result = await client.callTool('list_models', {});

      // Should provide helpful guidance even without token
      expect(result.content[0].text).toMatch(/huggingface|token|model|configure|error/i);
    });

    test('should handle missing GitHub token gracefully', async () => {
      const result = await client.callTool('get_repository', {
        owner: 'test-owner',
        repo: 'test-repo'
      });

      // Should provide helpful guidance even without token
      expect(result.content[0].text).toMatch(/github|token|repository|configure|error/i);
    });
  });

  describe('Invalid Parameter Scenarios', () => {
    test('should handle invalid tool parameters', async () => {
      const result = await client.callTool('search_code', {
        query: null,
        invalidParam: 'test'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/invalid|parameter|required/i);
    });

    test('should handle malformed requests', async () => {
      const result = await client.callTool('setup-repository', {
        owner: '',
        repo: null
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/invalid|empty|required/i);
    });
  });

  describe('Service Unavailable Scenarios', () => {
    test('should handle network errors gracefully', async () => {
      // This test checks if tools handle service unavailability
      const result = await client.callTool('embed_code', {
        code: 'function test() { return true; }'
      });

      // Should either succeed or fail gracefully with helpful message
      if (result.isError) {
        expect(result.content[0].text).toMatch(/network|service|unavailable|error/i);
      } else {
        expect(result.content[0].text).toMatch(/embedding|vector/i);
      }
    });
  });
});
