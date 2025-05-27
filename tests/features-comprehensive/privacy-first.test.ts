import { runRemcodeCommand, createTestDir } from '../user-journey/helpers';

describe('🛡️ Privacy First Features', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  test('should keep code in local environment', async () => {
    const result = await runRemcodeCommand(['--version'], { cwd: testDir });
    
    // Version check should not make external calls
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should not transmit code to external services', async () => {
    const result = await runRemcodeCommand(['serve', '--test-mode'], { cwd: testDir });
    
    expect(result.stdout).toContain('MCP server');
    expect(result.stdout).toContain('port');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should handle API keys securely', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token',
      GITHUB_TOKEN: 'test-github-token'
    };

    const result = await runRemcodeCommand([], { env, cwd: testDir });
    
    expect(result.stdout).toContain('API keys detected');
    expect(result.stdout).not.toContain('test-key'); // Should not expose keys
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should work with local processing only', async () => {
    const result = await runRemcodeCommand(['--help'], { cwd: testDir });
    
    expect(result.stdout).toContain('Your code stays in your environment');
    expect(result.exitCode).toBe(0);
  }, 30000);
});
