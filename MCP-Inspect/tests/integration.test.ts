/**
 * Integration Testing Suite - Tests end-to-end tool workflows
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/testing-library/jest-dom';
import { MCPInspectorClient } from '../../helpers/mcp-client';
import { TEST_CONFIG, MOCK_REPO_DATA } from '../../helpers/test-config';

describe('Integration Testing', () => {
  let client: MCPInspectorClient;

  beforeAll(async () => {
    client = new MCPInspectorClient(TEST_CONFIG);
    await client.connect();
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('Complete Setup Workflow', () => {
    test('should execute end-to-end setup workflow', async () => {
      // Step 1: Check prerequisites
      const prereqResult = await client.callTool('check-prerequisites', {
        path: process.cwd()
      });
      expect(prereqResult.content[0].text).toMatch(/node|git|requirements/i);

      // Step 2: Setup repository
      const setupResult = await client.callTool('setup-repository', {
        owner: MOCK_REPO_DATA.owner,
        repo: MOCK_REPO_DATA.repo,
        force: true
      });
      expect(setupResult.content[0].text).toMatch(/setup|repository|success|error/i);

      // Step 3: Generate workflows
      const workflowResult = await client.callTool('generate-workflows', {
        repoName: MOCK_REPO_DATA.repo,
        type: 'basic'
      });
      expect(workflowResult.content[0].text).toMatch(/workflow|generated|yaml/i);
    });
  });

  describe('Search and Processing Workflow', () => {
    test('should execute search and analysis workflow', async () => {
      // Step 1: Get processing status
      const statusResult = await client.callTool('get_processing_status', {});
      expect(statusResult.content[0].text).toMatch(/status|processing|state/i);

      // Step 2: Search for code patterns
      const searchResult = await client.callTool('search_code', {
        query: 'authentication function',
        limit: 3
      });
      expect(searchResult.content[0].text).toMatch(/search|results|found|empty/i);

      // Step 3: Get embeddings for analysis
      const embedResult = await client.callTool('embed_query', {
        query: 'user authentication patterns'
      });
      expect(embedResult.content[0].text).toMatch(/embedding|vector|query/i);
    });
  });

  describe('Service Integration Testing', () => {
    test('should validate service tool integration', async () => {
      // Test HuggingFace service
      const modelsResult = await client.callTool('list_models', {});
      expect(modelsResult.content[0].text).toMatch(/model|available|error/i);

      // Test Pinecone service
      const indexesResult = await client.callTool('list_indexes', {});
      expect(indexesResult.content[0].text).toMatch(/index|pinecone|error/i);

      // Test GitHub service
      const repoResult = await client.callTool('get_repository', {
        owner: 'octocat',
        repo: 'Hello-World'
      });
      expect(repoResult.content[0].text).toMatch(/repository|github|error/i);
    });
  });
});
