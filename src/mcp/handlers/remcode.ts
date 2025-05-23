import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SWEPrompts, PromptType } from '../../swe/prompts';
import { SWEScenarios } from '../../swe/scenarios';
import { SWEGuidelines } from '../../swe/guidelines';

const logger = getLogger('RemcodeMCPHandler');

export class RemcodeMCPHandler {
  private swePrompts: SWEPrompts;
  private sweScenarios: SWEScenarios;
  private sweGuidelines: SWEGuidelines;

  constructor() {
    this.swePrompts = new SWEPrompts();
    this.sweScenarios = new SWEScenarios();
    this.sweGuidelines = new SWEGuidelines();
  }

  async handleDefaultPrompt(req: Request, res: Response, params?: any): Promise<void> {
    const { scenario, context } = params || req.body;

    try {
      const prompt = scenario 
        ? this.swePrompts.getContextAwarePrompt(scenario, context)
        : this.swePrompts.getDefaultPrompt();

      res.status(200).json({ 
        prompt, 
        scenario: scenario || 'default',
        autoInjected: true,
        message: 'This guidance is automatically included in all Remcode MCP responses to ensure codebase-aware development.'
      });
    } catch (error) {
      logger.error('Failed to get default prompt', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ error: 'Failed to get default prompt' });
    }
  }

  async handleGetScenarios(req: Request, res: Response, params?: any): Promise<void> {
    const { userInput } = params || req.body;

    try {
      const scenarios = this.sweScenarios.getAvailableScenarios();
      const detectedScenario = userInput ? this.sweScenarios.detectScenarioWithConfidence(userInput) : null;

      res.status(200).json({
        availableScenarios: scenarios,
        detectedScenario,
        totalScenarios: scenarios.length,
        message: 'All 13 software engineering scenarios with Remcode MCP integration guidance'
      });
    } catch (error) {
      logger.error('Failed to get scenarios', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ error: 'Failed to get scenarios' });
    }
  }
  async handleGetGuidelines(req: Request, res: Response, params?: any): Promise<void> {
    const { scenario, category, priority } = params || req.body;

    try {
      let guidelines;
      let contextualGuidance = '';

      if (scenario) {
        const promptType = scenario as PromptType;
        contextualGuidance = this.swePrompts.getContextAwarePrompt(promptType);
        guidelines = this.sweGuidelines.getCodingStandards();
      } else if (category) {
        guidelines = this.sweGuidelines.getGuidelinesByCategory(category);
      } else if (priority) {
        guidelines = this.sweGuidelines.getGuidelinesByPriority(priority);
      } else {
        guidelines = this.sweGuidelines.getCodingStandards();
      }

      res.status(200).json({
        guidelines,
        contextualGuidance,
        scenario,
        category,
        priority,
        count: guidelines.length,
        remcodeIntegration: {
          message: 'Use these Remcode MCP tools to apply guidelines effectively:',
          recommendedTools: [
            'search_code - Find existing patterns that follow these guidelines',
            'find_similar_code - Discover consistent implementations',
            'get_code_context - Understand how guidelines apply in specific contexts'
          ]
        }
      });
    } catch (error) {
      logger.error('Failed to get guidelines', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ error: 'Failed to get guidelines' });
    }
  }

  async handleGetContextualGuidance(req: Request, res: Response, params?: any): Promise<void> {
    const { userQuery, codeContext, teamPreferences } = params || req.body;

    try {
      const detectedScenario = userQuery ? this.sweScenarios.detectScenarioWithConfidence(userQuery) : null;
      const promptType = detectedScenario?.scenario.promptType || PromptType.DEFAULT;
      const contextualPrompt = this.swePrompts.getContextAwarePrompt(promptType, {
        codeContext,
        teamPreferences
      });

      const relevantGuidelines = this.sweGuidelines.getCodingStandards()
        .filter(guideline => 
          detectedScenario?.scenario.tags.some(tag => guideline.tags.includes(tag)) ||
          guideline.priority === 'critical'
        );

      res.status(200).json({
        detectedScenario: detectedScenario?.scenario,
        confidence: detectedScenario?.confidence,
        contextualPrompt,
        relevantGuidelines,
        remcodeWorkflow: {
          step1: 'Use `search_code` to understand existing patterns',
          step2: 'Use `get_code_context` to gather full context',
          step3: 'Use `find_similar_code` to discover reusable approaches',
          step4: 'Apply the contextual guidance provided above'
        },
        userQuery,
        codeContext: codeContext ? 'Included' : 'Not provided'
      });
    } catch (error) {
      logger.error('Failed to get contextual guidance', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({ error: 'Failed to get contextual guidance' });
    }
  }
}
