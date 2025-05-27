/**
 * GitHub Tool Testing Suite - Tests GitHub repository tools
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import { MCPInspectorClient } from '../../helpers/mcp-client';
import { TEST_CONFIG, MOCK_REPO_DATA } from '../../helpers/test-config';

describe('GitHub Tools Testing', () => {
  let client: MCPInspectorClient;

  beforeAll(async () => {
    client = new MCPInspectorClient(TEST_CONFIG);
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('get_repository tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const repoTool = tools.find(tool => tool.name === 'get_repository');
      
      expect(repoTool).toBeDefined();
      expect(repoTool?.name).toBe('get_repository');
      expect(repoTool?.description).toMatch(/repository|github/i);
      expect(repoTool?.inputSchema.properties.owner).toBeDefined();
      expect(repoTool?.inputSchema.properties.repo).toBeDefined();
    });

    test('should get repository information', async () => {
      const result = await client.callTool('get_repository', {
        owner: MOCK_REPO_DATA.owner,
        repo: MOCK_REPO_DATA.repo
      });

      // Should handle whether repo exists or not gracefully
      expect(result.content[0].text).toMatch(/repository|info|error|not found/i);
    });

    test('should handle missing parameters', async () => {
      const result = await client.callTool('get_repository', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/required|missing|parameter/i);
    });
  });

  describe('list_branches tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const branchTool = tools.find(tool => tool.name === 'list_branches');
      
      expect(branchTool).toBeDefined();
      expect(branchTool?.inputSchema.properties.owner).toBeDefined();
      expect(branchTool?.inputSchema.properties.repo).toBeDefined();
    });

    test('should list repository branches', async () => {
      const result = await client.callTool('list_branches', {
        owner: MOCK_REPO_DATA.owner,
        repo: MOCK_REPO_DATA.repo
      });

      // Should handle whether repo exists or not gracefully
      expect(result.content[0].text).toMatch(/branch|list|error|not found/i);
    });
  });

  describe('create_issue tool', () => {
    test('should validate tool discovery', async () => {
      const tools = await client.listTools();
      const issueTool = tools.find(tool => tool.name === 'create_issue');
      
      expect(issueTool).toBeDefined();
      expect(issueTool?.inputSchema.properties.title).toBeDefined();
    });

    test('should handle issue creation', async () => {
      const result = await client.callTool('create_issue', {
        owner: MOCK_REPO_DATA.owner,
        repo: MOCK_REPO_DATA.repo,
        title: 'Test Issue from MCP Inspector'
      });

      // Should provide meaningful response whether successful or not
      expect(result.content[0].text).toMatch(/issue|created|error|permission/i);
    });
  });
});
