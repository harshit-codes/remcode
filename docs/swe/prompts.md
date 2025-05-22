# prompts.ts

**File Path:** `swe/prompts.ts`

## Overview

Prompt types supported by the system

## Dependencies

- `../utils/logger`
- `./guidelines`

## Classes

### `SWEPrompts`

**Class Definition:**

```typescript
export class SWEPrompts {
  private languageTemplates: Record<string, string> = {
    typescript: 'Pay attention to TypeScript type safety, use interfaces for complex objects, and avoid any types.',
    javascript: 'Use modern ES6+ features, consider adding JSDoc for type hints, and follow functional patterns when appropriate.',
    python: 'Follow PEP 8 style guidelines, use type hints where appropriate, and prefer explicit over implicit code.',
    java: 'Follow standard Java conventions, use proper exception handling, and leverage the type system.',
    go: 'Follow Go idioms, handle errors explicitly, and use interfaces appropriately.',
    rust: 'Leverage the ownership system, use Result for error handling, and follow Rust idioms.',
    csharp: 'Follow C# conventions, use LINQ for collections processing, and leverage strong typing.'
  };

  private frameworkTemplates: Record<string, string> = {
    react: 'Use functional components with hooks, avoid unnecessary renders, and follow React best practices.',
    angular: 'Follow Angular style guide, use observables for state management, and leverage Angular\'s dependency injection.',
    vue: 'Follow Vue.js conventions, use Composition API for complex components, and maintain proper component hierarchy.',
    express: 'Structure routes clearly, use middleware for cross-cutting concerns, and follow RESTful principles.',
    django: 'Follow Django\'s MTV architecture, use Django ORM effectively, and leverage Django\'s security features.',
    spring: 'Use dependency injection, follow Spring conventions, and leverage Spring\'s security features.',
    flask: 'Keep routes organized, use Flask extensions appropriately, and follow RESTful principles.'
  };

  /**
   * Get the default software engineering prompt
   */
  getDefaultPrompt(): string {
    return `You are a codebase-aware software engineering assistant. Follow these best practices:

1. **Code Quality**: Write clean, readable, maintainable code that follows industry standards
2. **Testing**: Include comprehensive tests covering edge cases and main functionality paths
3. **Documentation**: Document APIs, complex logic, and architectural decisions with clear explanations
4. **Security**: Follow secure coding practices, validate all inputs, and prevent common vulnerabilities
5. **Performance**: Consider performance implications of code changes and optimize critical paths
6. **Error Handling**: Implement robust error handling with proper logging and user-friendly messages
7. **Maintainability**: Write code that others can easily understand and modify in the future
8. **Scalability**: Design solutions that can scale with increased load and complexity

When suggesting code changes:
- Consider the existing codebase patterns and conventions
- Respect the established architecture and design principles
- Provide explanations for non-trivial changes
- Consider backward compatibility and migration paths
- Follow the principle of least surprise`;
  }

  /**
   * Get a prompt for a specific scenario with code context
   */
  getContextAwarePrompt(scenario: PromptType | string, config: PromptConfig = defaultPromptConfig): string {
    logger.info(`Generating context-aware prompt for scenario: ${scenario}`);
    
    const basePrompt = this.getDefaultPrompt();
    let promptType: PromptType;
    
    // Convert string to enum if needed
    if (typeof scenario === 'string' && Object.values(PromptType).includes(scenario as PromptType)) {
      promptType = scenario as PromptType;
    } else {
      logger.warn(`Unknown scenario: ${scenario}, using default`);
      promptType = PromptType.DEFAULT;
    }
    
    // Add scenario-specific guidance
    let scenarioGuidance = this.getScenarioGuidance(promptType);
    
    // Add language-specific guidance if provided
    if (config.languageSpecific && this.languageTemplates[config.languageSpecific]) {
      scenarioGuidance += `\n\n**${config.languageSpecific.toUpperCase()} SPECIFIC GUIDANCE**:\n${this.languageTemplates[config.languageSpecific]}`;
    }
    
    // Add framework-specific guidance if provided
    if (config.framework && this.frameworkTemplates[config.framework]) {
      scenarioGuidance += `\n\n**${config.framework.toUpperCase()} SPECIFIC GUIDANCE**:\n${this.frameworkTemplates[config.framework]}`;
    }
    
    // Add code context if provided
    let contextBlock = '';
    if (config.codeContext) {
      contextBlock = `\n\n**CODE CONTEXT**:\n${config.codeContext}`;
    }
    
    // Add team preferences if provided
    let preferencesBlock = '';
    if (config.teamPreferences && Object.keys(config.teamPreferences).length > 0) {
      preferencesBlock = '\n\n**TEAM PREFERENCES**:';
      for (const [key, value] of Object.entries(config.teamPreferences)) {
        preferencesBlock += `\n- ${key}: ${value}`;
      }
    }
    
    const fullPrompt = `${basePrompt}\n\n**SCENARIO GUIDANCE**:\n${scenarioGuidance}${contextBlock}${preferencesBlock}`;
    
    // Truncate if needed
    if (config.maxLength && fullPrompt.length > config.maxLength) {
      logger.warn(`Prompt exceeds max length (${fullPrompt.length} > ${config.maxLength}), truncating`);
      return fullPrompt.substring(0, config.maxLength) + '...';
    }
    
    return fullPrompt;
  }

  /**
   * Get scenario-specific guidance
   */
  private getScenarioGuidance(scenario: PromptType): string {
    switch (scenario) {
      case PromptType.REFACTORING:
        return 'Focus on improving code structure while maintaining functionality. Look for code smells such as duplicated code, long methods, excessive complexity, and tight coupling. Apply appropriate design patterns and SOLID principles. Ensure refactored code passes all existing tests.';
      
      case PromptType.NEW_FEATURE:
        return 'Implement the new feature following existing architectural patterns. Ensure proper testing with unit and integration tests. Document the new functionality with clear API documentation. Consider feature flags for controlled rollout. Implement proper error handling and edge cases.';
      
      case PromptType.BUG_FIX:
        return 'Identify the root cause before implementing a fix. Add regression tests that would have caught this bug. Fix the issue without introducing new problems. Document the fix clearly in comments and commit messages. Consider if similar bugs might exist elsewhere in the codebase.';
      
      case PromptType.CODE_REVIEW:
        return 'Review the code for correctness, readability, maintainability, and adherence to best practices. Look for security vulnerabilities, performance issues, and edge cases. Provide constructive feedback with clear explanations. Suggest improvements rather than just pointing out problems.';
      
      case PromptType.DOCUMENTATION:
        return 'Create clear, concise documentation that explains the what, why, and how. Include examples for complex APIs. Document assumptions, limitations, and edge cases. Use proper formatting and structure. Consider the audience and their technical level.';
      
      case PromptType.SECURITY_REVIEW:
        return 'Analyze the code for security vulnerabilities such as injection attacks, authentication issues, authorization flaws, data exposure, and insecure dependencies. Follow the OWASP Top 10 guidelines. Suggest specific fixes for identified issues with code examples.';
      
      case PromptType.PERFORMANCE_OPTIMIZATION:
        return 'Identify performance bottlenecks through profiling and analysis. Optimize critical paths first. Consider time complexity, memory usage, network calls, and database queries. Measure before and after to validate improvements. Document performance-critical sections and the reasoning behind optimizations.';
      
      default:
        return 'Follow software engineering best practices appropriate for the task at hand. Consider the existing codebase structure and conventions.';
    }
  }

  /**
   * Generate a prompt that includes specific guidelines
   */
  getPromptWithGuidelines(scenario: PromptType, guidelines: CodingGuideline[], config: PromptConfig = defaultPromptConfig): string {
    const basePrompt = this.getContextAwarePrompt(scenario, config);
    
    if (!guidelines.length) {
      return basePrompt;
    }
    
    let guidelinesSection = '\n\n**SPECIFIC GUIDELINES TO FOLLOW**:';
    
    for (const guideline of guidelines) {
      guidelinesSection += `\n\n${guideline.title}:\n`;
      for (const rule of guideline.rules) {
        guidelinesSection += `- ${rule}\n`;
      }
    }
    
    const fullPrompt = basePrompt + guidelinesSection;
    
    // Truncate if needed
    if (config.maxLength && fullPrompt.length > config.maxLength) {
      logger.warn(`Prompt with guidelines exceeds max length (${fullPrompt.length} > ${config.maxLength}), truncating`);
      return fullPrompt.substring(0, config.maxLength) + '...';
    }
    
    return fullPrompt;
  }
}
```

**Methods:**

#### `getScenarioGuidance()`

Get scenario-specific guidance

```typescript
getScenarioGuidance(scenario: PromptType): string {
```

## Interfaces

### `PromptConfig`

**Interface Definition:**

```typescript
export interface PromptConfig {
  includeGuidelines?: boolean;
  detailLevel?: 'minimal' | 'standard' | 'detailed';
  codeContext?: string;
  languageSpecific?: string;
  framework?: string;
  teamPreferences?: Record<string, string>;
  maxLength?: number;
}
```

## Variables

- `defaultPromptConfig`

