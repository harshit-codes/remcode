/**
 * MCP Tool Integration Utility - Final
 */

import { enhancedToolsRegistry } from './enhanced-tools-registry-final';

export function getEnhancedMCPSpec(): any {
  const tools = enhancedToolsRegistry.getAllTools();
  
  return {
    name: 'remcode-mcp',
    version: '0.1.0',
    description: 'Remcode Model Context Protocol server for codebase-aware AI development assistance',
    tools: tools
  };
}

export function getToolByName(name: string) {
  return enhancedToolsRegistry.getToolByName(name);
}

export function getAllEnhancedTools() {
  return enhancedToolsRegistry.getAllTools();
}
