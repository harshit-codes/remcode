import { getLogger } from '../utils/logger';

const logger = getLogger('SWEScenarios');

export interface Scenario {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  tools: string[];
}

export class SWEScenarios {
  getAvailableScenarios(): Scenario[] {
    return [
      {
        id: 'refactoring',
        name: 'Code Refactoring',
        description: 'Improving existing code structure and quality',
        triggers: ['refactor', 'clean up', 'improve'],
        tools: ['search_code', 'find_similar_code']
      },
      {
        id: 'new-feature',
        name: 'New Feature Development',
        description: 'Adding new functionality to the codebase',
        triggers: ['add', 'implement', 'create'],
        tools: ['search_code', 'get_code_context']
      }
    ];
  }

  detectScenario(userInput: string): Scenario | null {
    logger.info(`Detecting scenario from input: "${userInput}"`);
    
    const scenarios = this.getAvailableScenarios();
    const input = userInput.toLowerCase();
    
    for (const scenario of scenarios) {
      if (scenario.triggers.some(trigger => input.includes(trigger))) {
        return scenario;
      }
    }
    
    return null;
  }
}
