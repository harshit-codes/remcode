# scenarios.ts

**File Path:** `swe/scenarios.ts`

## Overview

Difficulty level for scenarios

## Dependencies

- `../utils/logger`
- `./prompts`

## Classes

### `SWEScenarios`

**Class Definition:**

```typescript
export class SWEScenarios {
  /**
   * Get all available scenarios
   */
  getAvailableScenarios(): Scenario[] {
    return [
      {
        id: 'refactoring',
        name: 'Code Refactoring',
        description: 'Improving existing code structure and quality without changing functionality',
        triggers: ['refactor', 'clean up', 'improve', 'restructure', 'simplify', 'optimize code', 'reduce complexity', 'make more readable', 'technical debt'],
        negativePatterns: ['add feature', 'implement new', 'create functionality'],
        tools: ['search_code', 'find_similar_code', 'code_complexity_analysis', 'code_quality_check'],
        difficulty: DifficultyLevel.INTERMEDIATE,
        promptType: PromptType.REFACTORING,
        estimatedTime: '1-4 hours',
        requiredSkills: ['design patterns', 'SOLID principles', 'clean code principles'],
        examples: ['Extract this method into smaller functions', 'Convert this class to use composition instead of inheritance'],
        tags: ['refactoring', 'code quality', 'maintenance']
      },
      {
        id: 'new-feature',
        name: 'New Feature Development',
        description: 'Adding new functionality to the codebase',
        triggers: ['add feature', 'implement', 'create', 'develop new', 'build functionality', 'new capability', 'enhance with', 'extend to include'],
        negativePatterns: ['fix bug', 'resolve issue', 'troubleshoot'],
        tools: ['search_code', 'get_code_context', 'code_scaffolding', 'test_generation'],
        difficulty: DifficultyLevel.INTERMEDIATE,
        promptType: PromptType.NEW_FEATURE,
        estimatedTime: '2-8 hours',
        requiredSkills: ['software design', 'testing', 'domain knowledge'],
        examples: ['Add a user authentication feature', 'Implement export to PDF functionality'],
        tags: ['feature', 'development', 'enhancement']
      },
      {
        id: 'bug-fix',
        name: 'Bug Fixing',
        description: 'Identifying and resolving defects in the code',
        triggers: ['fix bug', 'resolve issue', 'troubleshoot', 'fix error', 'solve problem', 'not working', 'incorrect behavior', 'unexpected result'],
        negativePatterns: ['add feature', 'new capability'],
        tools: ['code_analysis', 'debug_tools', 'regression_testing', 'error_log_analysis'],
        difficulty: DifficultyLevel.INTERMEDIATE,
        promptType: PromptType.BUG_FIX,
        estimatedTime: '30min-3 hours',
        requiredSkills: ['debugging', 'problem-solving', 'root cause analysis'],
        examples: ['Fix the login error when using special characters', 'Resolve the calculation issue in the reporting module'],
        tags: ['bug', 'fix', 'defect', 'issue']
      },
      {
        id: 'code-review',
        name: 'Code Review',
        description: 'Evaluating code quality, style, and potential issues',
        triggers: ['review code', 'evaluate', 'assess quality', 'check for issues', 'provide feedback', 'analyze code', 'code check'],
        tools: ['static_analysis', 'code_quality_metrics', 'best_practices_check', 'security_analysis'],
        difficulty: DifficultyLevel.INTERMEDIATE,
        promptType: PromptType.CODE_REVIEW,
        estimatedTime: '1-2 hours',
        requiredSkills: ['code quality standards', 'security awareness', 'performance optimization'],
        examples: ['Review this pull request for best practices', 'Check this code for security vulnerabilities'],
        tags: ['review', 'quality', 'assessment']
      },
      {
        id: 'documentation',
        name: 'Documentation',
        description: 'Creating or improving technical documentation',
        triggers: ['document', 'create docs', 'add documentation', 'write readme', 'explain code', 'api docs', 'update documentation'],
        tools: ['doc_generation', 'code_to_markdown', 'api_documentation'],
        difficulty: DifficultyLevel.BEGINNER,
        promptType: PromptType.DOCUMENTATION,
        estimatedTime: '1-3 hours',
        requiredSkills: ['technical writing', 'markdown', 'clarity of expression'],
        examples: ['Create API documentation for these endpoints', 'Write a README for this project'],
        tags: ['documentation', 'readme', 'api-docs']
      },
      {
        id: 'security-review',
        name: 'Security Review',
        description: 'Identifying and addressing security vulnerabilities',
        triggers: ['security review', 'security check', 'vulnerability assessment', 'find vulnerabilities', 'secure the code', 'penetration testing'],
        tools: ['security_scanner', 'vulnerability_check', 'dependency_analyzer', 'owasp_check'],
        difficulty: DifficultyLevel.ADVANCED,
        promptType: PromptType.SECURITY_REVIEW,
        estimatedTime: '2-5 hours',
        requiredSkills: ['security principles', 'OWASP knowledge', 'threat modeling'],
        examples: ['Review this authentication code for security issues', 'Check for SQL injection vulnerabilities'],
        tags: ['security', 'vulnerability', 'safety']
      },
      {
        id: 'performance-optimization',
        name: 'Performance Optimization',
        description: 'Improving code execution speed and resource efficiency',
        triggers: ['optimize performance', 'speed up', 'improve efficiency', 'reduce latency', 'memory usage', 'cpu usage', 'faster execution'],
        tools: ['profiling', 'benchmark', 'performance_analysis', 'memory_profiler'],
        difficulty: DifficultyLevel.ADVANCED,
        promptType: PromptType.PERFORMANCE_OPTIMIZATION,
        estimatedTime: '2-6 hours',
        requiredSkills: ['algorithmic complexity', 'profiling tools', 'performance measurement'],
        examples: ["Optimize this database query that's running slowly", "Reduce the memory usage of this processing function"],
        tags: ['performance', 'optimization', 'speed', 'efficiency']
      },
      {
        id: 'testing',
        name: 'Test Development',
        description: 'Creating or improving tests for existing code',
        triggers: ['create tests', 'add unit tests', 'improve test coverage', 'integration tests', 'write tests', 'test scenarios', 'test cases'],
        tools: ['test_generator', 'coverage_analyzer', 'test_framework', 'mocking_tools'],
        difficulty: DifficultyLevel.INTERMEDIATE,
        promptType: PromptType.NEW_FEATURE, // Reuse new feature prompt type but focus on tests
        estimatedTime: '1-4 hours',
        requiredSkills: ['testing principles', 'test frameworks', 'mocking'],
        examples: ['Add unit tests for this authentication service', 'Create integration tests for the API endpoints'],
        tags: ['testing', 'quality assurance', 'unit tests', 'integration tests']
      }
    ];
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
```

**Methods:**

- `getAvailableScenarios()`
- `detectScenario()`
- `for()`
- `if()`
- `detectScenarioWithConfidence()`
- `for()`
- `for()`
- `if()`
- `if()`
- `for()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `getScenarioById()`
- `getScenariosByDifficulty()`
- `getScenariosByTags()`

## Interfaces

### `Scenario`

**Interface Definition:**

```typescript
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
```

### `ScenarioDetectionResult`

**Interface Definition:**

```typescript
export interface ScenarioDetectionResult {
  scenario: Scenario;
  confidence: number; // 0-1 confidence score
  matchedTriggers: string[];
  matchedNegatives: string[];
}
```

