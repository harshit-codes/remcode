import { getLogger } from '../utils/logger';

const logger = getLogger('SWEPrompts');

export class SWEPrompts {
  getDefaultPrompt(): string {
    return `You are a codebase-aware software engineering assistant. Follow these best practices:

1. **Code Quality**: Write clean, readable, maintainable code
2. **Testing**: Include comprehensive tests for new functionality  
3. **Documentation**: Document APIs, complex logic, and architectural decisions
4. **Security**: Follow secure coding practices and validate inputs
5. **Performance**: Consider performance implications of code changes
6. **Error Handling**: Implement robust error handling and logging

When suggesting code changes, consider the existing codebase patterns and conventions.`;
  }

  getContextAwarePrompt(scenario: string, codeContext?: string): string {
    logger.info(`Generating context-aware prompt for scenario: ${scenario}`);
    
    const basePrompt = this.getDefaultPrompt();
    
    // Add scenario-specific guidance
    let scenarioGuidance = '';
    switch (scenario) {
      case 'refactoring':
        scenarioGuidance = 'Focus on improving code structure while maintaining functionality.';
        break;
      case 'new-feature':
        scenarioGuidance = 'Ensure proper testing and documentation for new features.';
        break;
      case 'bug-fix':
        scenarioGuidance = 'Identify root cause and add tests to prevent regression.';
        break;
    }
    
    return `${basePrompt}\n\nScenario guidance: ${scenarioGuidance}`;
  }
}
