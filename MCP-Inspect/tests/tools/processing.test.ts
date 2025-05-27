/**
 * Processing Tool Testing Suite - Tests processing workflow tools
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import { MCPInspectorClient } from '../../helpers/mcp-client';
import { TEST_CONFIG } from '../../helpers/test-config';

describe('Processing Tools Testing', () => {
  let client: MCPInspectorClient;

  beforeAll(async () => {
    client = new MCPInspectorClient(TEST_CONFIG);
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('trigger_processing tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const processTool = tools.find(tool => tool.name === 'trigger_processing');
      
      expect(processTool).toBeDefined();
      expect(processTool?.name).toBe('trigger_processing');
      expect(processTool?.description).toMatch(/process|workflow|trigger/i);
    });

    test('should handle processing trigger', async () => {
      const result = await client.callTool('trigger_processing', {
        force: true
      });

      // Should provide meaningful response about processing status
      expect(result.content[0].text).toMatch(/process|trigger|workflow|status/i);
    });

  });

  describe('get_processing_status tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const statusTool = tools.find(tool => tool.name === 'get_processing_status');
      
      expect(statusTool).toBeDefined();
      expect(statusTool?.description).toMatch(/status|processing|workflow/i);
    });

    test('should get processing status', async () => {
      const result = await client.callTool('get_processing_status', {});

      expect(result.isError).toBe(false);
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/status|processing|workflow|state/i);
    });
  });

  describe('get_workflow_logs tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const logsTool = tools.find(tool => tool.name === 'get_workflow_logs');
      
      expect(logsTool).toBeDefined();
    });

    test('should handle log retrieval', async () => {
      const result = await client.callTool('get_workflow_logs', {
        limit: 10
      });

      // Should provide meaningful response about logs
      expect(result.content[0].text).toMatch(/log|workflow|history|empty/i);
    });
  });
});
