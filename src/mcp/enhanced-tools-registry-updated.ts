/**
 * Enhanced MCP Tools Registry - Updated
 * 
 * Consolidates all enhanced tool definitions and provides utilities for tool management
 */

import { EnhancedMCPTool, ToolCategory } from './types/enhanced-tool-types';
import { setupConfigurationTools } from './tools/setup-configuration';
import { repositoryManagementTools } from './tools/repository-management';
import { codeSearchAnalysisTools } from './tools/code-search-analysis';
import { processingWorkflowsTools } from './tools/processing-workflows';
import { aiSweAssistanceTools } from './tools/ai-swe-assistance';

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
      ...codeSearchAnalysisTools,
      ...processingWorkflowsTools,
      ...aiSweAssistanceTools
    ];

    // Build tools map
    allTools.forEach(tool => {
      this.toolsMap.set(tool.name, tool);
    });

    // Build categories map
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

  public getToolsByTag(tag: string): EnhancedMCPTool[] {
    return this.getAllTools().filter(tool => tool.tags.includes(tag));
  }

  public getToolsByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): EnhancedMCPTool[] {
    return this.getAllTools().filter(tool => tool.priority === priority);
  }

  public convertToMCPSpec(): any {
    return this.getAllTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      ...tool
    }));
  }

  public getCategoryStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.getAllTools().forEach(tool => {
      stats[tool.category] = (stats[tool.category] || 0) + 1;
    });
    return stats;
  }

  public getToolSummary(): any {
    const tools = this.getAllTools();
    return {
      totalTools: tools.length,
      categories: Array.from(this.categoriesMap.keys()),
      priorityDistribution: {
        critical: tools.filter(t => t.priority === 'critical').length,
        high: tools.filter(t => t.priority === 'high').length,
        medium: tools.filter(t => t.priority === 'medium').length,
        low: tools.filter(t => t.priority === 'low').length
      },
      categoryStats: this.getCategoryStats()
    };
  }
}

export const enhancedToolsRegistry = EnhancedToolsRegistry.getInstance();
