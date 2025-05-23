/**
 * Code Search and Analysis Tools
 * 
 * Enhanced MCP tool definitions for code search, analysis, and understanding
 */

import { EnhancedMCPTool } from '../types/enhanced-tool-types';

export const codeSearchAnalysisTools: EnhancedMCPTool[] = [
  {
    name: 'search',
    description: 'Intelligent unified search across vectorized codebase with automatic query processing and context extraction',
    category: 'code-search-analysis',
    tags: ['search', 'semantic', 'vectorized', 'intelligent', 'context-aware'],
    priority: 'critical',
    aiGuidance: {
      whenToUse: 'For any codebase search, code understanding, or when user asks questions about their code',
      scenarios: ['code exploration', 'understanding implementation', 'finding similar patterns', 'architectural analysis'],
      dependencies: ['repository vectorization', 'Pinecone index'],
      suggestedFollowUp: ['get-code-context', 'find-similar-patterns']
    },
    parameters: {
      query: { 
        type: 'string', 
        required: true,
        description: 'Natural language search query or code-related question',
        validation: { minLength: 3, maxLength: 500 }
      },
      topK: { 
        type: 'number', 
        required: false,
        description: 'Maximum number of results to return',
        default: 10,
        validation: { min: 1, max: 50 }
      },
      filters: { 
        type: 'object', 
        required: false,
        description: 'Search filters for language, file type, complexity, path patterns',
        properties: {
          language: { type: 'string', description: 'Programming language filter' },
          fileType: { type: 'string', description: 'File extension filter' },
          complexity: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Code complexity filter' },
          path: { type: 'string', description: 'File path pattern filter' }
        }
      }
    },
    responseFormat: {
      success: { type: 'boolean', description: 'Search operation success status' },
      query: { type: 'object', description: 'Processed query information and metadata' },
      results: { type: 'array', description: 'Search results with content, metadata, and relevance scores' },
      totalResults: { type: 'number', description: 'Total number of results found' },
      searchTime: { type: 'number', description: 'Search execution time in milliseconds' },
      cached: { type: 'boolean', description: 'Whether results were served from cache' }
    },
    estimatedDuration: '100-2000 milliseconds',
    rateLimit: '120 requests per hour'
  }
];
