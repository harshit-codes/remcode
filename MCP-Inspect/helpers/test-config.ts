/**
 * Test Configuration and Mock Data for MCP Inspector Testing
 */

export const TEST_CONFIG = {
  serverCommand: 'node',
  serverArgs: ['bin/remcode-stdio.js'],
  timeout: 30000,
  env: {
    PINECONE_API_KEY: process.env.TEST_PINECONE_API_KEY || '',
    HUGGINGFACE_TOKEN: process.env.TEST_HUGGINGFACE_TOKEN || '',
    GITHUB_TOKEN: process.env.TEST_GITHUB_TOKEN || '',
    LOG_LEVEL: 'debug'
  }
};

export const MOCK_REPO_DATA = {
  owner: 'test-owner',
  repo: 'test-repository',
  branch: 'main'
};

export const MOCK_SEARCH_DATA = {
  semanticQuery: 'authentication function implementation',
  patternQuery: 'singleton pattern',
  codeQuery: 'async function fetchData'
};

export const MOCK_EMBEDDING_DATA = {
  sampleCode: `
    function authenticateUser(username: string, password: string): boolean {
      // Validate user credentials
      if (!username || !password) {
        return false;
      }
      
      // Check against database
      return validateCredentials(username, password);
    }
  `,
  sampleQuery: 'How to implement user authentication?',
  language: 'typescript'
};

export const MOCK_VECTOR_DATA = {
  indexName: 'test-remcode-index',
  namespace: 'test-namespace',
  searchQuery: 'authentication patterns in code',
  dimensions: 768
};

export const MOCK_WORKFLOW_DATA = {
  workflowType: 'basic',
  schedule: '0 2 * * *',
  notifications: true
};
