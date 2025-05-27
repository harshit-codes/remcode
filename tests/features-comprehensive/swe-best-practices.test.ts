import { runRemcodeCommand, createTestDir } from '../user-journey/helpers';

describe('🤖 SWE Best Practices Features', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  test('should provide built-in software engineering guidance', async () => {
    const result = await runRemcodeCommand(['--help'], { cwd: testDir });
    
    expect(result.stdout).toContain('SWE Best Practices');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should offer code-specific engineering practices', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token'
    };

    const result = await runRemcodeCommand(['analyze'], { env, cwd: testDir });
    
    expect(result.stdout).toContain('Analyzing codebase');
    expect(result.exitCode).toBe(0);
  }, 60000);

  test('should integrate with AI assistants for guidance', async () => {
    const result = await runRemcodeCommand(['serve', '--test-mode'], { cwd: testDir });
    
    expect(result.stdout).toContain('MCP server');
    expect(result.exitCode).toBe(0);
  }, 30000);
});
