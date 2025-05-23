/**
 * Enhanced MCP Tools Registry - Final
 * 
 * Consolidates all enhanced tool definitions and provides utilities for tool management
 */

import { EnhancedMCPTool, ToolCategory } from './types/enhanced-tool-types';
import { setupConfigurationTools } from './tools/setup-configuration';
import { repositoryManagementTools } from './tools/repository-management';
import { codeSearchAnalysisTools } from './tools/code-search-analysis';

export class EnhancedToolsRegistry {
  private static instance: EnhancedToolsRegistry;
  private toolsMap: Map<string, EnhancedMCPTool>;
  private categoriesMap: Map<ToolCategory, EnhancedMCPTool[]>;

  private constructor() {
    this.toolsMap = new Map();
    this.categoriesMap = new Map();
    this.initializeTools();
  }

  public static getInstance(): EnhancedToolsRegistry {
    if (!EnhancedToolsRegistry.instance) {
      EnhancedToolsRegistry.instance = new EnhancedToolsRegistry();
    }
    return EnhancedToolsRegistry.instance;
  }

  private initializeTools(): void {
    const allTools = [
      ...setupConfigurationTools,
      ...repositoryManagementTools,
      ...codeSearchAnalysisTools
    ];

    allTools.forEach(tool => {
      this.toolsMap.set(tool.name, tool);
    });

    allTools.forEach(tool => {
      if (!this.categoriesMap.has(tool.category)) {
        this.categoriesMap.set(tool.category, []);
      }
      this.categoriesMap.get(tool.category)!.push(tool);
    });
  }

  public getAllTools(): EnhancedMCPTool[] {
    return Array.from(this.toolsMap.values());
  }

  public getToolByName(name: string): EnhancedMCPTool | undefined {
    return this.toolsMap.get(name);
  }

  public getToolsByCategory(category: ToolCategory): EnhancedMCPTool[] {
    return this.categoriesMap.get(category) || [];
  }
}

export const enhancedToolsRegistry = EnhancedToolsRegistry.getInstance();
