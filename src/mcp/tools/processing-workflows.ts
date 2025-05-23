/**
 * Processing and Workflows Tools
 * 
 * Enhanced MCP tool definitions for processing triggers and workflow management
 */

import { EnhancedMCPTool } from '../types/enhanced-tool-types';

export const processingWorkflowsTools: EnhancedMCPTool[] = [
  {
    name: 'trigger-reprocessing',
    description: 'Initiate repository reprocessing for vectorization updates or full analysis refresh',
    category: 'processing-workflows',
    tags: ['processing', 'vectorization', 'update', 'refresh', 'workflow'],
    priority: 'medium',
    aiGuidance: {
      whenToUse: 'When code has changed significantly or user wants to refresh the analysis',
      scenarios: ['major code changes', 'analysis refresh', 'troubleshooting outdated results'],
      dependencies: ['repository setup', 'github actions', 'API keys'],
      suggestedFollowUp: ['get-processing-status']
    },
    parameters: {
      type: { 
        type: 'string', 
        required: false,
        description: 'Type of reprocessing to perform',
        enum: ['incremental', 'full', 'vectorize', 'analyze'],
        default: 'incremental'
      },
      force: { 
        type: 'boolean', 
        required: false,
        description: 'Force reprocessing even if no changes detected',
        default: false
      },
      owner: { 
        type: 'string', 
        required: true,
        description: 'Repository owner/organization name' 
      },
      repo: { 
        type: 'string', 
        required: true,
        description: 'Repository name' 
      },
      branch: { 
        type: 'string', 
        required: false,
        description: 'Branch to process',
        default: 'main'
      },
      token: { 
        type: 'string', 
        required: false,
        description: 'GitHub token for workflow triggering',
        sensitive: true
      }
    },
    responseFormat: {
      success: { type: 'boolean', description: 'Reprocessing trigger success status' },
      workflowId: { type: 'string', description: 'GitHub Actions workflow run ID' },
      status: { type: 'string', description: 'Current workflow status' },
      estimatedDuration: { type: 'string', description: 'Estimated processing duration' }
    },
    estimatedDuration: '5-30 minutes',
    rateLimit: '5 requests per hour'
  }
];
