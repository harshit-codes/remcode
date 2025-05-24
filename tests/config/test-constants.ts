/**
 * Central test configuration and constants for production-ready testing
 */

export const TEST_CONFIG = {
  // API Keys validation
  REQUIRED_ENV_VARS: [
    'PINECONE_API_KEY',
    'HUGGINGFACE_TOKEN',
    'GITHUB_TOKEN'
  ],
  
  // Test timeouts (ms)
  TIMEOUTS: {
    UNIT: 5000,
    INTEGRATION: 30000,
    E2E: 60000,
    EXTERNAL_API: 45000,
    PERFORMANCE: 120000
  },
  
  // Performance targets
  PERFORMANCE_TARGETS: {
    EMBEDDING_GENERATION: 3000, // ms
    SEARCH_RESPONSE: 1000, // ms
    FILE_PROCESSING: 5000, // ms per file
    MEMORY_USAGE_MAX: 512 // MB
  },  
  // Test data
  TEST_INDEXES: {
    UNIT: 'remcode-test-unit',
    INTEGRATION: 'remcode-test-integration', 
    E2E: 'remcode-test-e2e',
    PERFORMANCE: 'remcode-test-perf',
    RELIABILITY: 'remcode-test-reliability'
  },
  
  // Sample code chunks for testing
  SAMPLE_CODE_CHUNKS: [
    {
      content: 'function authenticateUser(email: string, password: string) { const user = findUser(email); return bcrypt.compare(password, user.hash); }',
      metadata: { 
        file_path: '/test/auth.ts', 
        strategy: 'function_level', 
        language: 'typescript', 
        chunk_type: 'function', 
        function_name: 'authenticateUser' 
      }
    },    {
      content: 'async function processPayment(amount: number, method: string) { const result = await paymentGateway.charge(amount, method); return result; }',
      metadata: { 
        file_path: '/test/payment.ts', 
        strategy: 'function_level', 
        language: 'typescript', 
        chunk_type: 'function', 
        function_name: 'processPayment' 
      }
    },
    {
      content: 'class DataProcessor { async process(data: any[]) { return data.map(item => this.transform(item)).filter(item => this.validate(item)); } }',
      metadata: { 
        file_path: '/test/processor.ts', 
        strategy: 'class_level', 
        language: 'typescript', 
        chunk_type: 'class', 
        class_name: 'DataProcessor' 
      }
    }
  ],  
  // Test queries for semantic search
  TEST_QUERIES: [
    'authentication function',
    'payment processing logic',
    'data validation methods',
    'error handling patterns',
    'async await implementation'
  ]
};

export const MOCK_CONFIG = {
  PINECONE: {
    apiKey: 'mock-pinecone-key',
    indexName: 'mock-test-index',
    namespace: 'mock-namespace',
    dimension: 768
  },
  HUGGINGFACE: {
    token: 'mock-hf-token',
    model: 'BAAI/bge-base-en-v1.5',
    fallback: 'BAAI/bge-small-en-v1.5'
  },  GITHUB: {
    token: 'mock-github-token',
    owner: 'test-owner',
    repo: 'test-repo'
  }
};

export function validateTestEnvironment(): void {
  const missing = TEST_CONFIG.REQUIRED_ENV_VARS.filter(
    varName => !process.env[varName]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for testing: ${missing.join(', ')}\n` +
      'Please set these variables before running tests.'
    );
  }
}

export function getTestTimeout(category: keyof typeof TEST_CONFIG.TIMEOUTS): number {
  return TEST_CONFIG.TIMEOUTS[category];
}
