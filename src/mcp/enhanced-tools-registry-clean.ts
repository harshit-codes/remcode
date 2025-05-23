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
    return this.getAllTools();
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
