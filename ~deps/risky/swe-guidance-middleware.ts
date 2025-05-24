import { Request, Response, NextFunction } from 'express';
import { SWEPrompts } from '../swe/prompts';
import { getLogger } from '../utils/logger';

const logger = getLogger('SWEGuidanceMiddleware');

/**
 * Middleware to automatically inject SWE guidance into MCP responses
 */
export class SWEGuidanceMiddleware {
  private swePrompts: SWEPrompts;

  constructor() {
    this.swePrompts = new SWEPrompts();
  }

  /**
   * Create middleware function that injects SWE guidance
   */
  createInjectionMiddleware() {
    const swePrompts = this.swePrompts; // Capture reference
    
    return (req: Request, res: Response, next: NextFunction) => {
      // Store original json method
      const originalJson = res.json;

      // Override json method to inject guidance
      res.json = function(this: Response, body: any) {
        try {
          // Only inject guidance for successful tool responses
          if (res.statusCode >= 200 && res.statusCode < 300 && body && typeof body === 'object') {
            // Check if this is a tool response (not an error or info response)
            const isToolResponse = !body.error && !body.message?.includes('Failed to');
            
            if (isToolResponse) {
              // Add SWE guidance to the response
              body.sweGuidance = {
                injected: true,
                message: 'Remcode automatically provides SWE best practices for codebase-aware development',
                defaultPrompt: swePrompts.getDefaultPrompt(),
                remcodeWorkflow: [
                  '1. Use `search_code` to understand existing patterns',
                  '2. Use `get_code_context` to gather comprehensive context',
                  '3. Use `find_similar_code` to discover reusable approaches',
                  '4. Follow the SWE principles outlined above'
                ],
                additionalTools: [
                  '`get_guidelines` - Get specific coding guidelines',
                  '`get_contextual_guidance` - Get context-aware development guidance',
                  '`get_scenarios` - Detect and get guidance for your specific scenario'
                ]
              };

              logger.debug('Injected SWE guidance into MCP response');
            }
          }
        } catch (injectionError) {
          logger.warn('Failed to inject SWE guidance', injectionError instanceof Error ? injectionError : new Error(String(injectionError)));
          // Continue with original response if injection fails
        }

        // Call original json method with modified body
        return originalJson.call(this, body);
      };

      next();
    };
  }

  /**
   * Create selective middleware that only injects for specific tools
   */
  createSelectiveInjectionMiddleware(toolsToInject: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const toolName = req.body?.tool;
      
      // Only apply injection for specified tools
      if (!toolsToInject.includes(toolName)) {
        return next();
      }

      // Apply the injection middleware
      return this.createInjectionMiddleware()(req, res, next);
    };
  }
}
