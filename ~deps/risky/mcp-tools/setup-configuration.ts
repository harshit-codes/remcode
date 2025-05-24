/**
 * Setup and Configuration Tools
 * 
 * Enhanced MCP tool definitions for repository setup and configuration
 */

import { EnhancedMCPTool } from '../types/enhanced-tool-types';

export const setupConfigurationTools: EnhancedMCPTool[] = [
  {
    name: 'setup-repository',
    description: 'Initialize and configure a repository with Remcode for codebase-aware AI assistance',
    category: 'setup-configuration',
    tags: ['initialization', 'configuration', 'onboarding', 'github-actions', 'automation'],
    priority: 'high',
    aiGuidance: {
      whenToUse: 'When user wants to enable Remcode for their repository, or when user asks about codebase analysis setup',
      scenarios: ['first-time setup', 'codebase analysis initialization', 'CI/CD automation setup'],
      dependencies: ['git repository', 'github repository', 'API keys'],
      suggestedFollowUp: ['get-repository-status', 'trigger-reprocessing']
    },
    parameters: {
      owner: { 
        type: 'string', 
        required: true,
        description: 'GitHub repository owner/organization name',
        validation: { pattern: '^[a-zA-Z0-9-_.]+$', maxLength: 39 }
      },
      repo: { 
        type: 'string', 
        required: true,
        description: 'GitHub repository name',
        validation: { pattern: '^[a-zA-Z0-9-_.]+$', maxLength: 100 }
      },
      confirm: { 
        type: 'boolean', 
        required: false,
        description: 'Confirm setup without additional prompts',
        default: false
      }
    },
    responseFormat: {
      success: { type: 'boolean', description: 'Setup completion status' },
      status: { type: 'string', description: 'Detailed setup status' }
    },
    estimatedDuration: '30-120 seconds',
    rateLimit: '10 requests per hour'
  },

  {
    name: 'check-prerequisites',
    description: 'Validate repository prerequisites and environment setup for Remcode integration',
    category: 'setup-configuration',
    tags: ['validation', 'prerequisites', 'environment', 'diagnostics'],
    priority: 'medium',
    aiGuidance: {
      whenToUse: 'Before repository setup or when troubleshooting setup issues',
      scenarios: ['pre-setup validation', 'troubleshooting', 'environment verification'],
      dependencies: ['git repository'],
      suggestedFollowUp: ['setup-repository']
    },
    parameters: {},
    responseFormat: {
      checks: { type: 'array', description: 'List of prerequisite check results' },
      allPassed: { type: 'boolean', description: 'Whether all checks passed' }
    },
    estimatedDuration: '5-15 seconds',
    rateLimit: '30 requests per hour'
  }
];
