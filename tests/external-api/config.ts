import * as dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

/**
 * External API Testing Configuration
 * 
 * This file configures the testing environment for real external API testing
 * with Pinecone and HuggingFace services.
 */

export const EXTERNAL_API_CONFIG = {
  // Test timeouts (in milliseconds)
  TIMEOUTS: {
    SHORT: 10000,      // 10 seconds for simple operations
    MEDIUM: 30000,     // 30 seconds for API calls
    LONG: 60000,       // 1 minute for complex operations
    EXTENDED: 120000   // 2 minutes for setup/teardown
  },

  // Pinecone testing configuration
  PINECONE: {
    TEST_INDEXES: [
      'remcode-test-basic',
      'remcode-test-performance', 
      'remcode-test-reliability',
      'remcode-test-integration'
    ],
    DEFAULT_DIMENSION: 768,
    DEFAULT_METRIC: 'cosine' as const,
    DEFAULT_REGION: 'us-east-1', // Free tier compatible
    TEST_NAMESPACE: 'automated-testing',
    PERFORMANCE_NAMESPACE: 'performance-testing',
    RELIABILITY_NAMESPACE: 'reliability-testing'
  },

  // HuggingFace testing configuration
  HUGGINGFACE: {
    EMBEDDING_MODELS: [
      'BAAI/bge-base-en-v1.5',      // Primary model (768 dim)
      'BAAI/bge-small-en-v1.5',     // Fallback model (384 dim)
      'sentence-transformers/all-MiniLM-L12-v2', // Alternative (384 dim)
      'microsoft/codebert-base'      // Code-specific model (768 dim)
    ],
    PRIMARY_MODEL: 'BAAI/bge-base-en-v1.5',
    FALLBACK_MODEL: 'BAAI/bge-small-en-v1.5',
    REQUEST_DELAY: 1000, // 1 second between requests to avoid rate limiting
    MAX_RETRIES: 3
  },

  // Performance targets
  PERFORMANCE_TARGETS: {
    EMBEDDING_GENERATION: 3000,    // < 3s per embedding
    VECTOR_STORAGE: 2000,          // < 2s per storage operation  
    SEMANTIC_SEARCH: 1000,         // < 1s per search
    BATCH_PROCESSING: 10000,       // < 10s for batch of 10
    INDEX_INITIALIZATION: 30000    // < 30s for index setup
  },

  // Test data samples
  TEST_CODE_SAMPLES: [
    'function authenticateUser(token) { return validateToken(token); }',
    'async function processData(input) { return input.map(transform).filter(validate); }',
    'class UserService { constructor(db) { this.db = db; } async findUser(id) { return this.db.find(id); } }',
    'const handleError = (error) => { console.error(error); throw new Error("Processing failed"); }',
    'export default function Component({ user }) { return <div>{user.name}</div>; }',
    'interface User { id: string; email: string; role: "admin" | "user"; }',
    'const API_ENDPOINTS = { users: "/api/users", auth: "/api/auth" };',
    'try { const result = await apiCall(); } catch (error) { handleApiError(error); }'
  ],

  // Environment validation
  validateEnvironment(): { valid: boolean; missing: string[] } {
    const required = ['PINECONE_API_KEY', 'HUGGINGFACE_TOKEN'];
    const missing = required.filter(key => !process.env[key]);
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
};

/**
 * Test utilities for external API testing
 */
export class ExternalAPITestUtils {
  /**
   * Wait between API calls to respect rate limits
   */
  static async respectRateLimit(delay: number = EXTERNAL_API_CONFIG.HUGGINGFACE.REQUEST_DELAY): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generate test metadata for code samples
   */
  static generateTestMetadata(index: number, override: Record<string, any> = {}) {
    return {
      file_path: `/test/sample-${index}.ts`,
      language: 'typescript',
      chunk_type: 'function',
      function_name: `testFunction${index}`,
      ...override
    };
  }

  /**
   * Create a test vector with realistic metadata
   */
  static createTestVector(id: string, content: string, metadata: Record<string, any> = {}) {
    return {
      id,
      content,
      metadata: {
        ...this.generateTestMetadata(parseInt(id.split('-').pop() || '0')),
        ...metadata
      }
    };
  }
}
