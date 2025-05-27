/**
 * Test Fixtures for MCP Inspector Tests
 * 
 * Sample data and mock objects for testing
 */

export const MOCK_REPOSITORY_DATA = {
  owner: 'test-owner',
  repo: 'test-repo',
  branch: 'main',
  fullName: 'test-owner/test-repo',
  url: 'https://github.com/test-owner/test-repo'
};

export const SAMPLE_CODE_SNIPPETS = {
  typescript: `
function calculateSum(a: number, b: number): number {
  return a + b;
}

export class MathUtils {
  static multiply(x: number, y: number): number {
    return x * y;
  }
  
  static divide(x: number, y: number): number {
    if (y === 0) {
      throw new Error('Division by zero');
    }
    return x / y;
  }
}
`,
  javascript: `
function greetUser(name) {
  return \`Hello, \${name}!\`;
}

const userApi = {
  async fetchUser(id) {
    const response = await fetch(\`/api/users/\${id}\`);
    return response.json();
  },
  
  async updateUser(id, data) {
    const response = await fetch(\`/api/users/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
`,
  python: `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

class DataProcessor:
    def __init__(self, data):
        self.data = data
    
    def process(self):
        return [item.upper() for item in self.data if item]
    
    def filter_by_length(self, min_length):
        return [item for item in self.data if len(item) >= min_length]
`
};

export const SEARCH_TEST_QUERIES = [
  'authentication patterns',
  'error handling',
  'database connection',
  'API endpoints',
  'utility functions',
  'class definition',
  'async function',
  'export default',
  'interface'
];

export const EXPECTED_TOOL_RESPONSES = {
  'setup-repository': {
    expectedFields: ['status', 'message', 'prerequisites'],
    possibleErrors: ['Missing GitHub token', 'Repository not found', 'Invalid parameters']
  },
  'search_code': {
    expectedFields: ['results', 'query', 'totalResults'],
    possibleErrors: ['No vectorized data', 'Invalid query', 'Search service unavailable']
  },
  'embed_code': {
    expectedFields: ['embedding', 'dimensions', 'model'],
    possibleErrors: ['Missing HuggingFace token', 'Model unavailable', 'Invalid code input']
  }
};