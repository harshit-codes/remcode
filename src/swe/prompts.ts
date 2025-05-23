import { getLogger } from '../utils/logger';
import { CodingGuideline } from './guidelines';
import { getScenarioGuidance } from './scenario-guidance';

const logger = getLogger('SWEPrompts');

/**
 * Prompt types supported by the system - Complete set of 13 software engineering scenarios
 */
export enum PromptType {
  DEFAULT = 'default',
  REFACTORING = 'refactoring',
  NEW_FEATURE = 'new_feature',
  BUG_FIXING = 'bug_fixing',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  TESTING = 'testing',
  CODE_REVIEW = 'code_review',
  ARCHITECTURE = 'architecture',
  DOCUMENTATION = 'documentation',
  DEPLOYMENT = 'deployment',
  MAINTENANCE = 'maintenance',
  LEARNING = 'learning'
}

/**
 * Interface for prompt configuration
 */
export interface PromptConfig {
  includeGuidelines?: boolean;
  detailLevel?: 'minimal' | 'standard' | 'detailed';
  codeContext?: string;
  teamPreferences?: Record<string, string>;
  maxLength?: number;
}

/**
 * Default prompt configuration
 */
export const defaultPromptConfig: PromptConfig = {
  includeGuidelines: true,
  detailLevel: 'standard',
  maxLength: 2000
};

/**
 * Software Engineering Prompts implementation
 */
export class SWEPrompts {
  /**
   * Get the default software engineering prompt with Remcode MCP integration guidance
   */
  getDefaultPrompt(): string {
    return `You are a codebase-aware software engineering assistant with access to Remcode MCP tools for intelligent code analysis and search.

## 🎯 CORE SOFTWARE ENGINEERING PRINCIPLES

**1. Code Quality & Maintainability**
- Write clean, readable, and self-documenting code
- Follow established patterns and conventions within the codebase
- Prioritize simplicity and clarity over cleverness
- Design for future maintainers and your future self

**2. Testing & Quality Assurance**
- Implement comprehensive testing strategies (unit, integration, end-to-end)
- Test edge cases and error conditions thoroughly
- Maintain high test coverage for critical business logic
- Write tests that serve as living documentation

**3. Security & Safety**
- Apply secure coding practices and validate all inputs
- Follow the principle of least privilege and defense in depth
- Keep dependencies updated and scan for vulnerabilities
- Never expose sensitive data or credentials

**4. Performance & Efficiency**
- Consider performance implications of design decisions
- Optimize for the right metrics (user experience, resource usage, scalability)
- Profile and measure before optimizing
- Design for scalability and handle increasing load gracefully

**5. Documentation & Communication**
- Document architectural decisions and complex business logic
- Write clear commit messages and pull request descriptions
- Maintain up-to-date documentation for APIs and workflows
- Explain the "why" behind non-obvious code decisions

## 🔧 REMCODE MCP INTEGRATION - LEVERAGE YOUR CODEBASE INTELLIGENCE

**Always Use These Tools for Better Context:**

🔍 **Before Making Changes:**
- Use \`search_code\` to find similar patterns and existing implementations
- Use \`get_code_context\` to understand dependencies and related functionality
- Use \`find_similar_code\` to discover reusable components and avoid duplication

📊 **During Development:**
- Use \`analyze_file_structure\` to understand project organization
- Use \`get_repository_status\` to check processing status and codebase health
- Use \`search_code\` with natural language queries to find relevant examples

🎯 **For Guidance:**
- Use \`get_scenarios\` to get context-specific development guidance
- Use \`default_prompt\` to get tailored advice for your specific task type

## 🚀 DEVELOPMENT WORKFLOW RECOMMENDATIONS

**1. Discovery Phase**
- Search existing codebase for similar functionality
- Understand current patterns and architectural decisions
- Identify reusable components and libraries

**2. Planning Phase**
- Consider impact on existing systems and dependencies
- Plan for backward compatibility and migration paths
- Design with testability and maintainability in mind

**3. Implementation Phase**
- Follow existing code conventions and patterns
- Write code that integrates naturally with the codebase
- Include comprehensive error handling and logging

**4. Validation Phase**
- Test thoroughly with realistic data and edge cases
- Validate security implications and performance impact
- Ensure documentation and examples are complete

## 💡 GENERAL BEST PRACTICES

- **Consistency**: Follow the established patterns in the codebase
- **Simplicity**: Choose the simplest solution that meets requirements
- **Reliability**: Handle errors gracefully and provide meaningful feedback
- **Extensibility**: Design for future requirements and changes
- **Collaboration**: Write code that others can easily understand and modify

Remember: Your goal is to create high-quality, maintainable software that integrates seamlessly with the existing codebase while following industry best practices.`;
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
    
    // Add code context if provided
    let contextBlock = '';
    if (config.codeContext) {
      contextBlock = `\n\n**📋 CODE CONTEXT:**\n${config.codeContext}`;
    }
    
    // Add team preferences if provided
    let preferencesBlock = '';
    if (config.teamPreferences && Object.keys(config.teamPreferences).length > 0) {
      preferencesBlock = '\n\n**👥 TEAM PREFERENCES:**';
      for (const [key, value] of Object.entries(config.teamPreferences)) {
        preferencesBlock += `\n- ${key}: ${value}`;
      }
    }
    
    const fullPrompt = `${basePrompt}\n\n## 🎯 SCENARIO-SPECIFIC GUIDANCE\n\n${scenarioGuidance}${contextBlock}${preferencesBlock}`;
    
    // Truncate if needed
    if (config.maxLength && fullPrompt.length > config.maxLength) {
      logger.warn(`Prompt exceeds max length (${fullPrompt.length} > ${config.maxLength}), truncating`);
      return fullPrompt.substring(0, config.maxLength) + '...';
    }
    
    return fullPrompt;
  }

  /**
   * Get scenario-specific guidance with Remcode MCP tool recommendations
   */
  private getScenarioGuidance(scenario: PromptType): string {
    return getScenarioGuidance(scenario);
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
