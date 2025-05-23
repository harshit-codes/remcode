/**
 * Repository Management Tools
 * 
 * Enhanced MCP tool definitions for repository status and management
 */

import { EnhancedMCPTool } from '../types/enhanced-tool-types';

export const repositoryManagementTools: EnhancedMCPTool[] = [
  {
    name: 'get-repository-status',
    description: 'Check repository initialization status and get current processing information',
    category: 'repository-management',
    tags: ['status', 'monitoring', 'information', 'health-check'],
    priority: 'high',
    aiGuidance: {
      whenToUse: 'To check if repository is set up with Remcode and get current processing status',
      scenarios: ['status checking', 'health monitoring', 'setup verification'],
      dependencies: ['repository access'],
      suggestedFollowUp: ['setup-repository', 'trigger-reprocessing']
    },
    parameters: {
      owner: { 
        type: 'string', 
        required: true,
        description: 'GitHub repository owner/organization name' 
      },
      repo: { 
        type: 'string', 
        required: true,
        description: 'GitHub repository name' 
      }
    },
    responseFormat: {
      initialized: { type: 'boolean', description: 'Whether repository is initialized with Remcode' },
      status: { type: 'string', description: 'Current processing status' },
      lastUpdate: { type: 'string', description: 'Last processing update timestamp' },
      statistics: { type: 'object', description: 'Processing statistics and metrics' }
    },
    estimatedDuration: '2-5 seconds',
    rateLimit: '60 requests per hour'
  },

  {
    name: 'list-repositories',
    description: 'List accessible GitHub repositories for the authenticated user',
    category: 'repository-management',
    tags: ['listing', 'discovery', 'repositories', 'access'],
    priority: 'medium',
    aiGuidance: {
      whenToUse: 'When user needs to see available repositories or select a repository for setup',
      scenarios: ['repository discovery', 'repository selection', 'access verification'],
      dependencies: ['GitHub authentication'],
      suggestedFollowUp: ['get-repository-status', 'setup-repository']
    },
    parameters: {},
    responseFormat: {
      repositories: { type: 'array', description: 'List of accessible repositories' },
      totalCount: { type: 'number', description: 'Total number of repositories' }
    },
    estimatedDuration: '3-10 seconds',
    rateLimit: '30 requests per hour'
  }
];
