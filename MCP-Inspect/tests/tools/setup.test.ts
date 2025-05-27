/**
 * Setup Tool Testing Suite - Tests setup-repository MCP tool
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import { MCPInspectorClient } from '../../helpers/mcp-client';
import { TEST_CONFIG, MOCK_REPO_DATA } from '../../helpers/test-config';

describe('Setup Tools Testing', () => {
  let client: MCPInspectorClient;

  beforeAll(async () => {
    client = new MCPInspectorClient(TEST_CONFIG);
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('setup-repository tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const setupTool = tools.find(tool => tool.name === 'setup-repository');
      
      expect(setupTool).toBeDefined();
      expect(setupTool?.name).toBe('setup-repository');
      expect(setupTool?.description).toContain('Initialize repository');
      expect(setupTool?.inputSchema.properties.owner).toBeDefined();
      expect(setupTool?.inputSchema.properties.repo).toBeDefined();
    });
        repo: MOCK_REPO_DATA.repo,
        force: true
      });
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(5000); // 5 second threshold
    });
  });
});
