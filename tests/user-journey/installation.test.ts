import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { runRemcodeCommand, createTestDir } from './helpers';

describe('User Journey: NPX Installation', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = createTestDir();
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should display help when run without arguments', async () => {
    const result = await runRemcodeCommand(['--help']);
    expect(result.stdout).toContain('remcode');
    expect(result.stdout).toContain('Commands:');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should show version when requested', async () => {
    const result = await runRemcodeCommand(['--version']);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should support MCP server functionality', async () => {
    const result = await runRemcodeCommand(['serve', '--help']);
    expect(result.stdout).toContain('MCP server');
    expect(result.exitCode).toBe(0);
  }, 30000);

  test('should support analysis functionality', async () => {
    const result = await runRemcodeCommand(['analyze', '--help']);
    expect(result.stdout).toContain('Analyze');
    expect(result.exitCode).toBe(0);
  }, 30000);
});
