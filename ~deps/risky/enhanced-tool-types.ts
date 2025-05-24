/**
 * Enhanced MCP Tool Types and Interfaces
 * 
 * This module defines the type structure for enhanced MCP tools with rich metadata
 */

export interface ParameterValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface ParameterDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  default?: any;
  enum?: string[];
  validation?: ParameterValidation;
  sensitive?: boolean;
  properties?: Record<string, any>;
}

export interface AIGuidance {
  whenToUse: string;
  scenarios: string[];
  dependencies: string[];
  suggestedFollowUp: string[];
}

export interface ResponseFormat {
  [key: string]: {
    type: string;
    description: string;
  };
}

export interface EnhancedMCPTool {
  name: string;
  description: string;
  category: 'setup-configuration' | 'repository-management' | 'code-search-analysis' | 'processing-workflows' | 'ai-swe-assistance' | 'external-integrations';
  tags: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  aiGuidance: AIGuidance;
  parameters: Record<string, ParameterDefinition>;
  responseFormat: ResponseFormat;
  estimatedDuration: string;
  rateLimit: string;
}

export type ToolCategory = EnhancedMCPTool['category'];
export type ToolPriority = EnhancedMCPTool['priority'];
