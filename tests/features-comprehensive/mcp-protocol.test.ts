import { runRemcodeCommand, createTestDir } from '../user-journey/helpers';

describe('🔗 MCP Protocol Features', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  test('should provide direct integration with AI assistants', async () => {
    const result = await runRemcodeCommand(['serve', '--test-mode'], { cwd: testDir });
    
    expect(result.stdout).toContain('MCP server');
    expect(result.stdout).toContain('port');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should support Model Context Protocol', async () => {
    const result = await runRemcodeCommand(['inspector', '--test-mode'], { cwd: testDir });
    
    expect(result.stdout).toContain('inspector');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should work with multiple AI assistant platforms', async () => {
    const result = await runRemcodeCommand(['--help'], { cwd: testDir });
    
    expect(result.stdout).toContain('Claude Desktop');
    expect(result.stdout).toContain('Cursor Editor');
    expect(result.stdout).toContain('Continue Dev');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should handle MCP environment configuration', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token',
      GITHUB_TOKEN: 'test-github-token'
    };

    const result = await runRemcodeCommand([], { env, cwd: testDir });
    
    expect(result.stdout).toContain('API keys detected');
    expect(result.exitCode).toBe(0);
  }, 30000);
});
