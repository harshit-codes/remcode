import { describe, it, expect, beforeEach } from '@jest/globals';
import { SWEPrompts } from '../../src/swe/prompts';
import { SWEScenarios } from '../../src/swe/scenarios';

describe('SWE Best Practices', () => {
  let prompts: SWEPrompts;
  let scenarios: SWEScenarios;

  beforeEach(() => {
    prompts = new SWEPrompts();
    scenarios = new SWEScenarios();
  });

  it('should provide default prompt', () => {
    const prompt = prompts.getDefaultPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt).toContain('codebase-aware');
  });

  it('should provide context-aware prompts', () => {
    const prompt = prompts.getContextAwarePrompt('refactoring');
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('should detect scenarios from user input', () => {
    const detected = scenarios.detectScenario('I need to refactor this code');
    expect(detected).toBeTruthy();
    expect(detected!.id).toBe('refactoring');
  });

  it('should return available scenarios', () => {
    const availableScenarios = scenarios.getAvailableScenarios();
    expect(Array.isArray(availableScenarios)).toBe(true);
    expect(availableScenarios.length).toBeGreaterThan(0);
  });
});
