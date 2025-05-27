import { platform, arch } from 'os';
import { runRemcodeCommand } from '../user-journey/helpers';

describe('Cross-Platform Compatibility', () => {
  test('should work on current platform', async () => {
    const currentPlatform = platform();
    const currentArch = arch();
    const nodeVersion = process.version;

    console.log(`Testing on: ${currentPlatform} ${currentArch}, Node.js ${nodeVersion}`);

    const result = await runRemcodeCommand(['--version']);
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  test('should handle platform-specific paths', async () => {
    const result = await runRemcodeCommand(['--help']);
    
    expect(result.exitCode).toBe(0);
    
    // Should handle both Windows and Unix paths
    if (platform() === 'win32') {
      expect(result.stdout).toContain('%APPDATA%');
    } else {
      expect(result.stdout).toContain('~/');
    }
  });

  test('should work with Node.js version compatibility', async () => {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    // Ensure Node.js version is supported (>=16)
    expect(majorVersion).toBeGreaterThanOrEqual(16);
    
    const result = await runRemcodeCommand(['--version']);
    expect(result.exitCode).toBe(0);
  });

  test('should handle file system operations cross-platform', async () => {
    const result = await runRemcodeCommand(['serve', '--test-mode']);
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('port');
  });
});
