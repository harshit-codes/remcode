import { runRemcodeCommand } from '../user-journey/helpers';

describe('AI Assistant Compatibility', () => {
  test('should provide Claude Desktop configuration', async () => {
    const result = await runRemcodeCommand(['--help']);
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Claude Desktop');
    expect(result.stdout).toContain('claude_desktop_config.json');
  });

  test('should provide Cursor Editor configuration', async () => {
    const result = await runRemcodeCommand(['--help']);
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Cursor Editor');
  });

  test('should provide Continue Dev configuration', async () => {
    const result = await runRemcodeCommand(['--help']);
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Continue Dev');
    expect(result.stdout).toContain('~/.continue/config.json');
  });

  test('should support MCP protocol integration', async () => {
    const result = await runRemcodeCommand(['serve', '--test-mode']);
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('MCP server');
  });

  test('should handle MCP environment variables', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token',
      GITHUB_TOKEN: 'test-github-token'
    };

    const result = await runRemcodeCommand([], { env });
    
    expect(result.exitCode).toBe(0);
  });
});
