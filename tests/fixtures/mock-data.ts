/**
 * Test Fixtures for Remcode Testing
 */

export const mockRepositoryData = {
  owner: 'test-owner',
  repo: 'test-repo',
  full_name: 'test-owner/test-repo',
  description: 'Test repository for remcode',
  private: false,
  default_branch: 'main'
};

export const mockCodeSearchResults = [
  {
    id: 'test-result-1',
    score: 0.95,
    content: 'function authenticate(user) { return user.isValid; }',
    metadata: {
      filePath: 'src/auth.ts',
      language: 'typescript',
      chunkType: 'function',
      startLine: 10,
      endLine: 15
    }
  },
  {
    id: 'test-result-2',
    score: 0.87,
    content: 'const validateUser = (userData) => { /* validation logic */ }',
    metadata: {
      filePath: 'src/validation.ts',
      language: 'typescript',
      chunkType: 'function',
      startLine: 25,
      endLine: 30
    }
  }
];

export const mockRemcodeConfig = {
  version: '0.1.0',
  initialized: '2025-05-22T10:30:45Z',
  repository: {
    name: 'test-repo',
    owner: 'test-owner',
    url: 'https://github.com/test-owner/test-repo',
    defaultBranch: 'main'
  },
  processing: {
    lastCommit: 'abc123def456',
    lastUpdate: '2025-05-22T10:35:20Z',
    status: 'completed'
  },
  vectorization: {
    provider: 'pinecone',
    indexName: 'remcode-test-repo',
    namespace: 'main',
    embeddingModel: 'microsoft/graphcodebert-base',
    embeddingDimension: 768
  },
  statistics: {
    filesProcessed: 10,
    chunksCreated: 25,
    vectorsStored: 25
  }
};

export const mockWorkflowTemplate = `name: Remcode Processing Test
on:
  push:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Test Remcode
      run: echo "Testing Remcode"
`;
