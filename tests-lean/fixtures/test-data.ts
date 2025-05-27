/**
 * Test Fixtures
 * Static test data for consistent testing
 */

export const SAMPLE_CODE = {
  TYPESCRIPT_FUNCTION: `
function authenticateUser(email: string, password: string): boolean {
  const user = findUser(email);
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}
  `.trim(),

  TYPESCRIPT_CLASS: `
class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }
}
  `.trim(),

  JAVASCRIPT_ASYNC: `
async function processPayment(amount, method) {
  try {
    const result = await paymentGateway.charge(amount, method);
    return { success: true, transactionId: result.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
  `.trim()
};

export const SAMPLE_METADATA = {
  TYPESCRIPT_FILE: {
    file_path: '/src/auth/user.ts',
    language: 'typescript',
    extension: '.ts',
    lines: 15,
    complexity: 'medium'
  },

  JAVASCRIPT_FILE: {
    file_path: '/src/payment/processor.js', 
    language: 'javascript',
    extension: '.js',
    lines: 22,
    complexity: 'high'
  }
};

export const MOCK_API_RESPONSES = {
  PINECONE_QUERY: {
    matches: [
      {
        id: 'chunk-1',
        score: 0.95,
        metadata: { file_path: '/src/auth.ts', function_name: 'login' }
      },
      {
        id: 'chunk-2', 
        score: 0.87,
        metadata: { file_path: '/src/user.ts', function_name: 'createUser' }
      }
    ]
  },

  HUGGINGFACE_EMBEDDING: Array(768).fill(0).map(() => Math.random()),

  GITHUB_REPOSITORY: {
    name: 'test-repo',
    full_name: 'test-user/test-repo',
    private: false,
    default_branch: 'main',
    clone_url: 'https://github.com/test-user/test-repo.git'
  }
};

export const TEST_QUERIES = [
  'authentication function',
  'payment processing logic',
  'user management code',
  'error handling patterns',
  'async await implementation'
];

export const EXPECTED_TOOLS = [
  'setup-repository',
  'search-code', 
  'get-code-context',
  'default-prompt',
  'get-scenarios'
];
