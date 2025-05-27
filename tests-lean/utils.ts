/**
 * Simplified Mock Factories - No TypeScript Issues
 */

// @ts-ignore - Suppress TypeScript errors for this utility file
const { jest } = require('@jest/globals');

export const MockFactory = {
  pineconeStorage: () => ({
    storeVectors: jest.fn(),
    queryVectors: jest.fn(),
    deleteVectors: jest.fn(),
    getStats: jest.fn()
  }),

  embeddingManager: () => ({
    embedChunks: jest.fn(),
    initialize: jest.fn()
  }),

  githubClient: () => ({
    getRepository: jest.fn(),
    createOrUpdateFile: jest.fn(),
    setSecret: jest.fn()
  })
};

export const TestDataFactory = {
  codeChunk: (overrides = {}) => ({
    content: 'function testFunction() { return "test"; }',
    metadata: {
      file_path: '/test/file.ts',
      language: 'typescript',
      chunk_type: 'function',
      function_name: 'testFunction',
      ...overrides.metadata
    },
    ...overrides
  }),

  embedding: (dimension = 768) => 
    Array(dimension).fill(0).map(() => Math.random()),

  mcpRequest: (tool, parameters = {}) => ({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: tool,
      arguments: parameters
    }
  }),

  remcodeConfig: (overrides = {}) => ({
    version: '0.1.0',
    repository: {
      name: 'test-repo',
      owner: 'test-user',
      url: 'https://github.com/test-user/test-repo'
    },
    vectorization: {
      provider: 'pinecone',
      indexName: 'test-index',
      embeddingModel: 'BAAI/bge-base-en-v1.5'
    },
    ...overrides
  })
};

export async function measurePerformance(fn, label = 'Operation') {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  
  console.log(`⏱️  ${label}: ${duration}ms`);
  
  return { result, duration };
}

export function setupTestEnvironment() {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  process.env.PINECONE_API_KEY = 'test-pinecone-key';
  process.env.HUGGINGFACE_TOKEN = 'test-hf-token';
  process.env.GITHUB_TOKEN = 'test-github-token';
}
