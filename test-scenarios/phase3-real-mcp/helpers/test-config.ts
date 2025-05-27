/**
 * Phase 3: Real MCP Testing Configuration
 * Configuration for real-world MCP Inspector CLI testing
 */

export interface TestConfig {
  performanceThresholds: {
    connectionTime: number;
    toolExecutionTime: number;
    searchTime: number;
    embeddingTime: number;
  };
  testRepositories: {
    local: string;
    remote: string;
  };
  expectedTools: string[];
  apiEndpoints: {
    pinecone: string;
    huggingFace: string;
    github: string;
  };
}

export const testConfig: TestConfig = {
  performanceThresholds: {
    connectionTime: 10000,  // 10 seconds max connection time
    toolExecutionTime: 5000, // 5 seconds max tool execution
    searchTime: 5000,       // 5 seconds max search time
    embeddingTime: 3000     // 3 seconds max embedding time
  },
  testRepositories: {
    local: process.cwd(),
    remote: 'https://github.com/harshit-codes/remcode'
  },
  expectedTools: [
    'setup-repository',
    'search-code',
    'search-patterns',
    'embed-code',
    'embed-query',
    'list-models',
    'create-index',
    'search-records',
    'upsert-records',
    'get-repository',
    'list-branches',
    'create-issue',
    'trigger-processing',
    'get-processing-status'
  ],
  apiEndpoints: {
    pinecone: 'https://api.pinecone.io',
    huggingFace: 'https://api-inference.huggingface.co',
    github: 'https://api.github.com'
  }
};

export const mockTestData = {
  sampleCode: {
    typescript: `
export interface User {
  id: string;
  name: string;
  email: string;
}

export function authenticate(user: User, password: string): boolean {
  // Authentication logic here
  return validateCredentials(user, password);
}
    `,
    python: `
def process_data(input_data):
    """Process input data and return results"""
    try:
        result = transform_data(input_data)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
    `
  },
  searchQueries: [
    'authentication patterns',
    'error handling',
    'data processing',
    'user management',
    'api endpoints'
  ]
};

export default testConfig;
