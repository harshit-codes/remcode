import { runRemcodeCommand, createTestDir } from '../user-journey/helpers';

describe('⚡ Zero Configuration Features', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  test('should work out of the box with smart defaults', async () => {
    const result = await runRemcodeCommand(['serve', '--test-mode'], { cwd: testDir });
    
    expect(result.stdout).toContain('port');
    expect(result.stdout).toContain('MCP server');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should auto-select available port', async () => {
    const result = await runRemcodeCommand(['serve', '--test-mode'], { cwd: testDir });
    
    const portMatch = result.stdout.match(/port (\d+)/);
    expect(portMatch).toBeTruthy();
    
    const port = parseInt(portMatch![1]);
    expect(port).toBeGreaterThan(3000);
    expect(port).toBeLessThan(8000);
  }, 30000);

  test('should provide smart auto-routing based on context', async () => {
    const result = await runRemcodeCommand([], { cwd: testDir });
    
    expect(result.stdout).toContain('Remcode');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should handle missing configuration gracefully', async () => {
    const result = await runRemcodeCommand([], { cwd: testDir });
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toContain('Error');
  }, 30000);
});
