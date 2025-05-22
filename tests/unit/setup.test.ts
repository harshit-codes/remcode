import { describe, it, expect, beforeEach } from '@jest/globals';
import { SetupDetector } from '../../src/setup/detector';

describe('SetupDetector', () => {
  let detector: SetupDetector;

  beforeEach(() => {
    detector = new SetupDetector();
  });

  it('should detect when setup is needed', async () => {
    const status = await detector.detectSetupNeeds();
    
    expect(status).toHaveProperty('needsSetup');
    expect(status).toHaveProperty('hasRemcodeFile');
    expect(status).toHaveProperty('hasGitRepo');
    expect(status).toHaveProperty('hasGitHubRepo');
    expect(status).toHaveProperty('hasWorkflow');
    expect(typeof status.needsSetup).toBe('boolean');
  });

  it('should provide meaningful setup reason', async () => {
    const status = await detector.detectSetupNeeds();
    
    if (status.needsSetup) {
      expect(status.reason).toBeDefined();
      expect(typeof status.reason).toBe('string');
      expect(status.reason!.length).toBeGreaterThan(0);
    }
  });
});
