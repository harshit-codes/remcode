import { runRemcodeCommand, createTestDir } from '../user-journey/helpers';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('🧠 Codebase Intelligence Features', () => {
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

  test('should understand code structure and patterns', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token'
    };

    const result = await runRemcodeCommand(['analyze'], { env, cwd: testDir });
    
    expect(result.stdout).toContain('Analyzing codebase');
    expect(result.exitCode).toBe(0);
  }, 60000);

  test('should generate semantic representations using CodeBERT', async () => {
    const env = {
      PINECONE_API_KEY: 'test-key',
      HUGGINGFACE_TOKEN: 'test-token'
    };

    const result = await runRemcodeCommand(['process'], { env, cwd: testDir });
    
    expect(result.stdout).toContain('Processing');
    expect(result.exitCode).toBe(0);
  }, 60000);
});
