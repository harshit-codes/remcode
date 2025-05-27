import { execFile } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';

export async function runRemcodeCommand(
  args: string[] = [], 
  options: { env?: NodeJS.ProcessEnv; cwd?: string } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const env = { ...process.env, ...options.env };
    const cwd = options.cwd || process.cwd();
    
    const remcodePath = join(__dirname, '../../bin/remcode.js');
    // Use process.execPath to get the current Node.js binary path
    const nodePath = process.execPath;
    console.log('Executing:', nodePath, remcodePath, ...args);
    
    execFile(nodePath, [remcodePath, ...args], {
      cwd,
      env,
      timeout: 15000
    }, (error, stdout, stderr) => {
      if (error) {
        console.log('Command error:', error.message);
        // Handle timeout or other errors
        if (error.killed) {
          resolve({ stdout, stderr: stderr + ' [TIMEOUT]', exitCode: -1 });
        } else {
          resolve({ stdout, stderr, exitCode: (typeof error.code === 'number' ? error.code : 1) });
        }
      } else {
        console.log('Command finished with exit code: 0');
        console.log('Stdout length:', stdout.length);
        resolve({ stdout, stderr, exitCode: 0 });
      }
    });
  });
}

export function createTestDir(): string {
  return `${tmpdir()}/remcode-test-${Date.now()}`;
}
