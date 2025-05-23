/**
 * AI and SWE Assistance Tools
 * 
 * Enhanced MCP tool definitions for AI-powered software engineering assistance
 */

import { EnhancedMCPTool } from '../types/enhanced-tool-types';

export const aiSweAssistanceTools: EnhancedMCPTool[] = [
  {
    name: 'default-prompt',
    description: 'Get context-aware SWE best practices and guidelines for AI development assistance',
    category: 'ai-swe-assistance',
    tags: ['prompts', 'swe-practices', 'guidelines', 'context-aware', 'best-practices'],
    priority: 'high',
    aiGuidance: {
      whenToUse: 'To provide contextual software engineering guidance and best practices for development tasks',
      scenarios: ['code review assistance', 'development guidance', 'best practices injection'],
      dependencies: ['none'],
      suggestedFollowUp: ['get-scenarios', 'search']
    },
    parameters: {
      scenario: { 
        type: 'string', 
        required: false,
        description: 'Specific development scenario for targeted guidance',
        enum: ['code-review', 'refactoring', 'new-feature', 'bug-fixing', 'testing', 'documentation']
      },
      context: { 
        type: 'string', 
        required: false,
        description: 'Additional context about the development task',
        validation: { maxLength: 1000 }
      }
    },
    responseFormat: {
      prompt: { type: 'string', description: 'Generated context-aware SWE prompt' },
      scenario: { type: 'string', description: 'Detected or specified scenario' },
      guidelines: { type: 'array', description: 'Applicable coding guidelines and best practices' },
      confidence: { type: 'number', description: 'Confidence in scenario detection (0-1)' }
    },
    estimatedDuration: '100-500 milliseconds',
    rateLimit: '300 requests per hour'
  },

  {
    name: 'get-scenarios',
    description: 'Get available development scenarios and intelligent scenario detection from user input',
    category: 'ai-swe-assistance',
    tags: ['scenarios', 'detection', 'context-analysis', 'development-patterns'],
    priority: 'medium',
    aiGuidance: {
      whenToUse: 'To understand available development scenarios or detect the appropriate scenario from user input',
      scenarios: ['scenario exploration', 'context detection', 'guidance selection'],
      dependencies: ['none'],
      suggestedFollowUp: ['default-prompt']
    },
    parameters: {
      userInput: { 
        type: 'string', 
        required: false,
        description: 'User input to analyze for scenario detection',
        validation: { maxLength: 2000 }
      }
    },
    responseFormat: {
      scenarios: { type: 'array', description: 'Available or detected development scenarios' },
      detectedScenario: { type: 'object', description: 'Detected scenario with confidence score' },
      recommendations: { type: 'array', description: 'Recommended scenarios based on input' }
    },
    estimatedDuration: '50-200 milliseconds',
    rateLimit: '200 requests per hour'
  }
];
