/**
 * MCP Inspector Test Configuration
 * 
 * Configuration for testing Remcode MCP server using MCP Inspector CLI
 */

export interface MCPTestConfig {
  serverCommand: string;
  serverArgs: string[];
  timeout: number;
  env: Record<string, string>;
  inspectorCommand: string;
  workingDirectory: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: any[];
}

/**
 * Default MCP test configuration
 */
export const MCP_TEST_CONFIG: MCPTestConfig = {
  serverCommand: 'npx',
  serverArgs: ['@modelcontextprotocol/inspector', '--cli', 'node', 'bin/remcode-stdio.js'],
  timeout: 30000, // 30 seconds  env: {
    PINECONE_API_KEY: process.env.TEST_PINECONE_API_KEY || process.env.PINECONE_API_KEY || '',
    HUGGINGFACE_TOKEN: process.env.TEST_HUGGINGFACE_TOKEN || process.env.HUGGINGFACE_TOKEN || '',
    GITHUB_TOKEN: process.env.TEST_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '',
    LOG_LEVEL: 'debug',
    NODE_ENV: 'test',
    TEST_MODE: 'true'
  },
  inspectorCommand: 'npx @modelcontextprotocol/inspector',
  workingDirectory: process.cwd()
};

/**
 * Expected MCP tools for Remcode server
 */
export const EXPECTED_MCP_TOOLS = [
  // Setup tools
  'setup-repository',
  'check-prerequisites', 
  'configure-repository',
  'setup-secrets',
  'generate-workflows',

  // Search tools
  'search_code',
  'search_patterns',
  'find_similar_code',
  'extract_context',

  // Pinecone tools
  'create_index',
  'upsert_vectors',
  'search_vectors',
  'get_index_stats',
  'delete_vectors',

  // HuggingFace tools
  'embed_code',
  'embed_query',
  'list_models',

  // GitHub tools
  'get_repository_info',
  'create_repository',
  'fork_repository',
  'get_file_contents',

  // Processing tools
  'trigger_processing',
  'get_processing_status',
  'get_workflow_history',

  // Remcode tools
  'get_swe_guidance',
  'analyze_codebase',
  'get_project_insights'
];
/**
 * Test timeout configurations
 */
export const TIMEOUTS = {
  CONNECTION: 10000,    // 10 seconds for connection
  TOOL_EXECUTION: 15000, // 15 seconds for tool execution
  SEARCH_OPERATION: 20000, // 20 seconds for search operations
  PROCESSING: 30000,    // 30 seconds for processing operations
  LONG_RUNNING: 60000   // 60 seconds for long-running operations
};

/**
 * Performance benchmarks
 */
export const PERFORMANCE_BENCHMARKS = {
  MAX_TOOL_RESPONSE_TIME: 5000,  // 5 seconds max response time
  MAX_MEMORY_USAGE: 512 * 1024 * 1024, // 512MB max memory
  MIN_TOOLS_COUNT: 25,           // Minimum number of tools expected
  MAX_CONNECTION_TIME: 3000      // 3 seconds max connection time
};

/**
 * Test data fixtures
 */
export const TEST_FIXTURES = {
  MOCK_REPOSITORY: {
    owner: 'test-owner',
    repo: 'test-repo',
    branch: 'main'
  },
  SAMPLE_CODE: `
function calculateSum(a: number, b: number): number {
  return a + b;
}

export class MathUtils {
  static multiply(x: number, y: number): number {
    return x * y;
  }
}
`,
  SEARCH_QUERIES: [
    'authentication patterns',
    'error handling',
    'database connection',
    'API endpoints',
    'utility functions'
  ]
};