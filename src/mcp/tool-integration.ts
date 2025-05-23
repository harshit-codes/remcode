/**
 * MCP Tool Integration Utility - Updated
 * 
 * Provides methods to integrate enhanced tool definitions with the existing MCP server
 */

import { enhancedToolsRegistry } from './enhanced-tools-registry-clean';

export function getEnhancedMCPSpec(): any {
  const tools = enhancedToolsRegistry.getAllTools();
  
  return {
    name: 'remcode-mcp',
    version: '0.1.0',
    description: 'Remcode Model Context Protocol server for codebase-aware AI development assistance',
    categories: [
      'setup-configuration',
      'repository-management', 
      'code-search-analysis',
      'processing-workflows',
      'ai-swe-assistance',
      'external-integrations'
    ],
    tools: tools
  };
}

export function getToolByName(name: string) {
  return enhancedToolsRegistry.getToolByName(name);
}

export function getToolsByCategory(category: string) {
  return enhancedToolsRegistry.getToolsByCategory(category as any);
}

export function getAllEnhancedTools() {
  return enhancedToolsRegistry.getAllTools();
}

export function getToolSummary() {
  return enhancedToolsRegistry.getToolSummary();
}
