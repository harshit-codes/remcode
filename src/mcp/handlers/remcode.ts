import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SWEPrompts } from '../../swe/prompts';
import { SWEScenarios } from '../../swe/scenarios';

const logger = getLogger('RemcodeMCPHandler');

export class RemcodeMCPHandler {
  private swePrompts: SWEPrompts;
  private sweScenarios: SWEScenarios;

  constructor() {
    this.swePrompts = new SWEPrompts();
    this.sweScenarios = new SWEScenarios();
  }

  async handleDefaultPrompt(req: Request, res: Response, params?: any): Promise<void> {
    const { scenario, context } = params || req.body;

    try {
      const prompt = scenario 
        ? this.swePrompts.getContextAwarePrompt(scenario, context)
        : this.swePrompts.getDefaultPrompt();

      res.status(200).json({ prompt, scenario: scenario || 'general' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get default prompt' });
    }
  }

  async handleGetScenarios(req: Request, res: Response, params?: any): Promise<void> {
    const { userInput } = params || req.body;

    try {
      const scenarios = this.sweScenarios.getAvailableScenarios();
      const detectedScenario = userInput ? this.sweScenarios.detectScenario(userInput) : null;

      res.status(200).json({
        availableScenarios: scenarios,
        detectedScenario
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get scenarios' });
    }
  }
}
