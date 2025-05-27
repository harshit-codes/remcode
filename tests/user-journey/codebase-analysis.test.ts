import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { runRemcodeCommand, createTestDir } from './helpers';

describe('User Journey: Codebase Analysis', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    mkdirSync(testDir, { recursive: true });
    
    writeFileSync(join(testDir, 'auth.ts'), `
export class AuthService {
  async authenticate(token: string): Promise<boolean> {
    return token.length > 0;
  }
}
`);
  });

  test('should support codebase analysis', async () => {
    const result = await runRemcodeCommand(['analyze', '--help'], { cwd: testDir });
    
    expect(result.stdout).toContain('Analyze');
    expect(result.stdout).toContain('vectorization');
    expect(result.exitCode).toBe(0);
  }, 60000);

  test('should support code processing', async () => {
    const result = await runRemcodeCommand(['process', '--help'], { cwd: testDir });
    
    expect(result.stdout).toContain('Process');
    expect(result.stdout).toContain('vectorization');
    expect(result.exitCode).toBe(0);
  }, 60000);

  test('should support vectorization', async () => {
    const result = await runRemcodeCommand(['vectorize', '--help'], { cwd: testDir });
    
    expect(result.stdout).toContain('Vectorize');
    expect(result.exitCode).toBe(0);
  }, 60000);
});
