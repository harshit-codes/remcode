import { getLogger } from '../utils/logger';
import { PromptType } from './prompts';
import { SCENARIO_DEFINITIONS } from './scenario-definitions';

const logger = getLogger('SWEScenarios');

/**
 * Difficulty level for scenarios
 */
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

/**
 * Scenario interface with improved typing
 */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  negativePatterns?: string[];
  tools: string[];
  difficulty: DifficultyLevel;
  promptType: PromptType;
  estimatedTime?: string;
  requiredSkills?: string[];
  examples?: string[];
  tags: string[];
}

/**
 * Interface for scenario detection result with confidence score
 */
export interface ScenarioDetectionResult {
  scenario: Scenario;
  confidence: number; // 0-1 confidence score
  matchedTriggers: string[];
  matchedNegatives: string[];
}

/**
 * Software Engineering Scenarios implementation
 */
export class SWEScenarios {
  /**
   * Get all available scenarios
   */
  getAvailableScenarios(): Scenario[] {
    return SCENARIO_DEFINITIONS;
  }

  /**
   * Detect the scenario from user input
   */
  detectScenario(userInput: string): Scenario | null {
    logger.info(`Detecting scenario from input: "${userInput}"`);
    
    const scenarios = this.getAvailableScenarios();
    const input = userInput.toLowerCase();
    
    // Basic exact match approach
    for (const scenario of scenarios) {
      if (scenario.triggers.some(trigger => input.includes(trigger))) {
        logger.debug(`Matched scenario: ${scenario.id}`);
        return scenario;
      }
    }
    
    logger.debug('No scenario matched');
    return null;
  }
  
  /**
   * Detect scenario with confidence score
   */
  detectScenarioWithConfidence(userInput: string): ScenarioDetectionResult | null {
    logger.info(`Detecting scenario with confidence from input: "${userInput}"`);
    
    const scenarios = this.getAvailableScenarios();
    const input = userInput.toLowerCase();
    
    let bestMatch: ScenarioDetectionResult | null = null;
    let highestConfidence = 0;
    
    for (const scenario of scenarios) {
      const matchedTriggers: string[] = [];
      let positiveScore = 0;
      
      // Check for trigger word matches
      for (const trigger of scenario.triggers) {
        if (input.includes(trigger.toLowerCase())) {
          matchedTriggers.push(trigger);
          positiveScore += 1;
        }
      }
      
      // Check for negative pattern matches
      const matchedNegatives: string[] = [];
      let negativeScore = 0;
      
      if (scenario.negativePatterns) {
        for (const negative of scenario.negativePatterns) {
          if (input.includes(negative.toLowerCase())) {
            matchedNegatives.push(negative);
            negativeScore += 1;
          }
        }
      }
      
      // Calculate confidence score
      // Base score is ratio of matched triggers to total triggers
      let confidence = positiveScore / scenario.triggers.length;
      
      // Reduce confidence if negative patterns are matched
      if (negativeScore > 0 && scenario.negativePatterns) {
        confidence *= (1 - (negativeScore / scenario.negativePatterns.length));
      }
      
      // Boost confidence for multiple matches
      if (positiveScore > 1) {
        confidence = Math.min(1, confidence * 1.2);
      }
      
      // Only consider scenarios with at least one trigger match
      if (positiveScore > 0 && confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = {
          scenario,
          confidence,
          matchedTriggers,
          matchedNegatives
        };
      }
    }
    
    if (bestMatch) {
      logger.debug(`Best scenario match: ${bestMatch.scenario.id} with confidence ${bestMatch.confidence.toFixed(2)}`);
    } else {
      logger.debug('No scenario matched with sufficient confidence');
    }
    
    return bestMatch;
  }
  
  /**
   * Get a scenario by ID
   */
  getScenarioById(id: string): Scenario | null {
    return this.getAvailableScenarios().find(scenario => scenario.id === id) || null;
  }
  
  /**
   * Get scenarios by difficulty level
   */
  getScenariosByDifficulty(difficulty: DifficultyLevel): Scenario[] {
    return this.getAvailableScenarios().filter(scenario => scenario.difficulty === difficulty);
  }
  
  /**
   * Get scenarios by tags
   */
  getScenariosByTags(tags: string[]): Scenario[] {
    return this.getAvailableScenarios().filter(scenario => 
      tags.some(tag => scenario.tags.includes(tag))
    );
  }
}
