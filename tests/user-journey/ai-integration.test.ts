import { runRemcodeCommand, createTestDir } from './helpers';

describe('User Journey: AI Integration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  test('should provide MCP server functionality', async () => {
    const result = await runRemcodeCommand(['serve', '--help'], { cwd: testDir });
    
    expect(result.stdout).toContain('Start the MCP server');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should support inspector functionality', async () => {
    const result = await runRemcodeCommand(['inspector', '--help'], { cwd: testDir });
    
    expect(result.stdout).toContain('MCP Inspector compatible');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should show version correctly', async () => {
    const result = await runRemcodeCommand(['--version']);
    
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should handle help command gracefully', async () => {
    const result = await runRemcodeCommand(['--help'], { cwd: testDir });
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Commands:');
  }, 30000);

  test('should support analysis commands', async () => {
    const result = await runRemcodeCommand(['analyze', '--help'], { cwd: testDir });
    
    expect(result.stdout).toContain('Analyze');
    expect(result.exitCode).toBe(0);
  }, 30000);
});
