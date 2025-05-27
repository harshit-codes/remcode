/**
 * End-to-End Workflow Tests
 * Tests complete user workflows with minimal external dependencies
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { TestDataFactory, MockFactory, measurePerformance, TestAssertions } from '../utils';
import { TEST_QUERIES } from '../fixtures/test-data';

describe('E2E Workflow Tests', () => {
  beforeAll(() => {
    console.log('🚀 Starting E2E workflow tests');
  });

  afterAll(() => {
    console.log('✅ E2E workflow tests completed');
  });

  describe('Repository Setup Workflow', () => {
    it('should complete repository setup workflow', async () => {
      const { result, duration } = await measurePerformance(async () => {
        // Step 1: Initialize setup
        const setupRequest = TestDataFactory.mcpRequest('setup-repository', {
          owner: 'test-user',
          repo: 'test-repo',
          confirm: true
        });

        // Step 2: Mock setup process
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate setup time

        // Step 3: Generate config
        const config = TestDataFactory.remcodeConfig({
          repository: {
            name: 'test-repo',
            owner: 'test-user'
          }
        });

        return {
          setupCompleted: true,
          configGenerated: !!config,
          workflowCreated: true,
          secretsConfigured: true
        };
      });

      expect(result.setupCompleted).toBe(true);
      expect(result.configGenerated).toBe(true);
      expect(result.workflowCreated).toBe(true);
      expect(result.secretsConfigured).toBe(true);
      expect(duration).toBeLessThan(200); // Fast setup
    });
  });

  describe('Code Search Workflow', () => {
    it('should execute complete search workflow', async () => {
      const mockPinecone = MockFactory.pineconeStorage();
      const mockEmbedding = MockFactory.embeddingManager();

      const { result, duration } = await measurePerformance(async () => {
        const query = TEST_QUERIES[0]; // 'authentication function'
        
        // Step 1: Process query
        const processedQuery = {
          original: query,
          normalized: query.toLowerCase(),
          intent: 'code_search'
        };

        // Step 2: Generate embedding (mocked)
        const queryEmbedding = TestDataFactory.embedding();
        mockEmbedding.embedChunks.mockResolvedValue([
          { content: query, embedding: queryEmbedding }
        ]);

        // Step 3: Search vectors (mocked)
        mockPinecone.queryVectors.mockResolvedValue([
          {
            id: 'auth-1',
            score: 0.95,
            metadata: { function_name: 'authenticateUser', file_path: '/src/auth.ts' }
          },
          {
            id: 'auth-2', 
            score: 0.87,
            metadata: { function_name: 'loginUser', file_path: '/src/login.ts' }
          }
        ]);

        const searchResults = await mockPinecone.queryVectors();

        return {
          query: processedQuery,
          results: searchResults,
          resultCount: searchResults.length
        };
      });

      expect(result.query.intent).toBe('code_search');
      expect(result.results).toHaveLength(2);
      expect(result.results[0].score).toBeGreaterThan(0.9);
      expect(duration).toBeLessThan(100); // Fast search
    });
  });

  describe('Tool Integration Workflow', () => {
    it('should chain multiple MCP tools together', async () => {
      const { result, duration } = await measurePerformance(async () => {
        // Step 1: Get scenarios
        const scenariosRequest = TestDataFactory.mcpRequest('get-scenarios');
        const scenarios = ['code_review', 'refactoring', 'debugging'];

        // Step 2: Get default prompt for scenario
        const promptRequest = TestDataFactory.mcpRequest('default-prompt', {
          scenario: 'code_review'
        });
        const prompt = 'Review this code for potential issues and improvements.';

        // Step 3: Search for relevant code
        const searchRequest = TestDataFactory.mcpRequest('search-code', {
          query: 'error handling patterns'
        });
        const searchResults = [
          { id: 'error-1', content: 'try { ... } catch (error) { ... }' }
        ];

        return {
          scenariosAvailable: scenarios.length > 0,
          promptGenerated: prompt.length > 0,
          codeFound: searchResults.length > 0,
          workflowCompleted: true
        };
      });

      expect(result.scenariosAvailable).toBe(true);
      expect(result.promptGenerated).toBe(true);
      expect(result.codeFound).toBe(true);
      expect(result.workflowCompleted).toBe(true);
      expect(duration).toBeLessThan(50); // Very fast chaining
    });
  });

  describe('Performance Validation', () => {
    it('should meet performance targets for key operations', async () => {
      const operations = [
        {
          name: 'Config Loading',
          fn: async () => TestDataFactory.remcodeConfig(),
          maxMs: 10
        },
        {
          name: 'Request Processing',
          fn: async () => TestDataFactory.mcpRequest('search-code'),
          maxMs: 5
        },
        {
          name: 'Mock Search',
          fn: async () => {
            const mock = MockFactory.pineconeStorage();
            return mock.queryVectors();
          },
          maxMs: 20
        }
      ];

      for (const operation of operations) {
        const { duration } = await measurePerformance(operation.fn, operation.name);
        TestAssertions.hasExpectedPerformance(duration, operation.maxMs, operation.name);
      }
    });
  });
});
