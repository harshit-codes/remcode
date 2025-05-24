import { describe, it, expect, beforeEach } from '@jest/globals';
import { SWEPrompts } from '../../src/swe/prompts';
import { SWEGuidelines } from '../../src/swe/guidelines';

describe('SWE Best Practices', () => {
  let prompts: SWEPrompts;
  let guidelines: SWEGuidelines;

  beforeEach(() => {
    prompts = new SWEPrompts();
    guidelines = new SWEGuidelines();
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

  it('should get coding guidelines', () => {
    const codingStandards = guidelines.getCodingStandards();
    expect(Array.isArray(codingStandards)).toBe(true);
    expect(codingStandards.length).toBeGreaterThan(0);
  });

  it('should get guidelines by category', () => {
    const securityGuidelines = guidelines.getGuidelinesByCategory('security');
    expect(Array.isArray(securityGuidelines)).toBe(true);
  });

  it('should get guidelines by priority', () => {
    const criticalGuidelines = guidelines.getGuidelinesByPriority('critical');
    expect(Array.isArray(criticalGuidelines)).toBe(true);
  });
});
