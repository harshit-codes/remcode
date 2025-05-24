/**
 * Comprehensive SWE (Software Engineering) Feature Tests
 * Tests software engineering best practices and guidance functionality
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { SWEPrompts, PromptType } from '../../../src/swe/prompts';
import { getScenarioGuidance } from '../../../src/swe/scenario-guidance';
import { logger } from '../../../src/utils/logger';

describe('SWE Feature', () => {
  let swePrompts: SWEPrompts;
  
  beforeAll(() => {
    swePrompts = new SWEPrompts();
    
    logger.info('🎯 SWE feature tests initialized');
  });

  describe('SWE Scenario Guidance', () => {
    it('should provide guidance for refactoring scenarios', () => {
      const guidance = getScenarioGuidance('refactoring');
      
      expect(guidance).toBeDefined();
      expect(typeof guidance).toBe('string');
      expect(guidance.length).toBeGreaterThan(100);
      expect(guidance.toLowerCase()).toContain('refactoring');
      
      logger.info('✅ Refactoring scenario guidance available');
    });
    it('should provide guidance for all major scenarios', () => {
      const scenarios = [
        'refactoring', 'new_feature', 'bug_fixing', 'performance',
        'security', 'testing', 'code_review', 'architecture', 
        'documentation', 'deployment', 'maintenance', 'learning', 'general'
      ];
      
      scenarios.forEach(scenarioType => {
        const guidance = getScenarioGuidance(scenarioType);
        
        expect(guidance).toBeDefined();
        expect(typeof guidance).toBe('string');
        expect(guidance.length).toBeGreaterThan(50);
        
        logger.info(`✅ Guidance available for ${scenarioType} scenario`);
      });
    });
  });

  describe('SWE Prompts', () => {
    it('should generate default prompts', () => {
      const defaultPrompt = swePrompts.getDefaultPrompt();
      
      expect(defaultPrompt).toBeDefined();
      expect(typeof defaultPrompt).toBe('string');
      expect(defaultPrompt.length).toBeGreaterThan(100);
      expect(defaultPrompt.toLowerCase()).toContain('software engineering');
      
      logger.info('✅ Default prompt generation working');
    });

    it('should generate context-aware prompts', () => {
      const context = { includeGuidelines: true, detailLevel: 'standard' as const };
      const prompt = swePrompts.getContextAwarePrompt(PromptType.REFACTORING, context);
      
      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
      
      logger.info('✅ Context-aware prompt generation working');
    });

    it('should generate context-aware prompts for all scenario types', () => {
      const promptTypes = Object.values(PromptType);
      
      promptTypes.forEach(promptType => {
        const context = { includeGuidelines: true, detailLevel: 'standard' as const };
        const prompt = swePrompts.getContextAwarePrompt(promptType, context);
        
        expect(prompt).toBeDefined();
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(50);
        
        logger.info(`✅ Context-aware prompt available for ${promptType} scenario`);
      });
    });
  });

  afterAll(() => {
    logger.info('🎯 SWE feature tests completed');
  });
});
