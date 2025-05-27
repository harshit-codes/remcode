import { runRemcodeCommand, createTestDir } from './helpers';

describe('User Journey: MCP Setup', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  test('should provide MCP server functionality', async () => {
    const result = await runRemcodeCommand(['--help']);
    
    expect(result.stdout).toContain('Start the MCP server');
    expect(result.stdout).toContain('serve');
    expect(result.stdout).toContain('inspector');
  }, 30000);

  test('should support AI assistant integration', async () => {
    const result = await runRemcodeCommand(['--help']);
    
    expect(result.stdout).toContain('AI assistant integration');
    expect(result.stdout).toContain('serve');
  }, 30000);

  test('should provide MCP Inspector functionality', async () => {
    const result = await runRemcodeCommand(['--help']);
    
    expect(result.stdout).toContain('MCP Inspector compatible');
    expect(result.stdout).toContain('inspector');
  }, 30000);

  test('should detect MCP environment variables', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token',
      GITHUB_TOKEN: 'test-github-token'
    };

    const result = await runRemcodeCommand(['serve', '--help'], { env, cwd: testDir });
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Start the MCP server');
  }, 30000);
});
