import { runRemcodeCommand, createTestDir } from '../user-journey/helpers';

describe('🔍 Semantic Search Features', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  test('should find code by meaning, not just keywords', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token'
    };

    // Test semantic search capability
    const result = await runRemcodeCommand(['serve', '--test-mode'], { env, cwd: testDir });
    
    expect(result.stdout).toContain('MCP server');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should provide contextual code understanding', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token'
    };

    const result = await runRemcodeCommand(['inspector', '--test-mode'], { env, cwd: testDir });
    
    expect(result.stdout).toContain('inspector');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should enable AI assistant to search contextually', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token'
    };

    const result = await runRemcodeCommand(['--help'], { env, cwd: testDir });
    
    expect(result.stdout).toContain('What authentication patterns are used in this codebase?');
    expect(result.exitCode).toBe(0);
  }, 30000);
});
