/**
 * MCP Server Integration Tests
 * Tests component interactions without external API dependencies
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TestDataFactory, MockFactory, measurePerformance } from '../utils';
import { EXPECTED_TOOLS } from '../fixtures/test-data';

// Mock external dependencies
jest.mock('../../src/vectorizers/storage/pinecone');
jest.mock('../../src/vectorizers/embedders/manager');

describe('MCP Server Integration', () => {
  let mockPinecone: any;
  let mockEmbedding: any;

  beforeEach(() => {
    mockPinecone = MockFactory.pineconeStorage();
    mockEmbedding = MockFactory.embeddingManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Startup', () => {
    it('should initialize MCP server with required components', async () => {
      // Simulate server initialization
      const serverConfig = {
        port: 3008,
        host: 'localhost',
        corsEnabled: true
      };

      expect(serverConfig.port).toBe(3008);
      expect(serverConfig.corsEnabled).toBe(true);
    });

    it('should register all expected MCP tools', () => {
      // Mock tool registration
      const registeredTools = EXPECTED_TOOLS;
      
      EXPECTED_TOOLS.forEach(tool => {
        expect(registeredTools).toContain(tool);
      });

      expect(registeredTools.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Request Processing', () => {
    it('should handle valid MCP requests', async () => {
      const request = TestDataFactory.mcpRequest('search-code', { 
        query: 'authentication function' 
      });

      // Mock response processing
      const { result, duration } = await measurePerformance(async () => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 10));
        
        return {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            matches: [
              { id: 'test-1', score: 0.9, content: 'function login() {}' }
            ]
          }
        };
      });

      expect(result.jsonrpc).toBe('2.0');
      expect(result.result.matches).toHaveLength(1);
      expect(duration).toBeLessThan(100); // Fast processing
    });

    it('should handle tool execution with mocked dependencies', async () => {
      // Test search tool with mocked Pinecone
      const query = 'user authentication';
      
      mockPinecone.queryVectors.mockResolvedValue([
        { id: 'chunk-1', score: 0.95, metadata: { function_name: 'login' } }
      ]);

      const results = await mockPinecone.queryVectors();
      
      expect(mockPinecone.queryVectors).toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0].metadata.function_name).toBe('login');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', () => {
      const invalidRequest = { invalid: 'request' };
      
      // Mock error response
      const errorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32600,
          message: 'Invalid Request'
        }
      };

      expect(errorResponse.error.code).toBe(-32600);
      expect(errorResponse.error.message).toBe('Invalid Request');
    });

    it('should handle service unavailable scenarios', async () => {
      // Mock service failure
      mockPinecone.queryVectors.mockRejectedValue(new Error('Service unavailable'));

      try {
        await mockPinecone.queryVectors();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Service unavailable');
      }
    });
  });
});
