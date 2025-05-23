# enhanced-tools.ts

**File Path:** `mcp/enhanced-tools.ts`

## Overview

Enhanced MCP Tool Definitions with Rich Metadata

This module provides comprehensive tool definitions for Model Context Protocol (MCP)
integration, enabling AI assistants to understand and use Remcode capabilities effectively.

## Classes

### `MCPToolRecommendationEngine`

```typescript
class MCPToolRecommendationEngine {
// ... implementation
}
```

**Methods:**

#### `getToolsByCategory()`

```typescript
getToolsByCategory(category: MCPToolCategory): EnhancedMCPTool[] {
```

#### `getToolsByPriority()`

```typescript
getToolsByPriority(priority: MCPToolPriority): EnhancedMCPTool[] {
```

#### `getToolsByUsageContext()`

```typescript
getToolsByUsageContext(context: MCPUsageContext): EnhancedMCPTool[] {
```

#### `recommendToolsForNewUser()`

```typescript
recommendToolsForNewUser(): EnhancedMCPTool[] {
```

#### `recommendFollowUpTools()`

```typescript
recommendFollowUpTools(currentTool: string): string[] {
```

#### `getToolByName()`

```typescript
getToolByName(name: string): EnhancedMCPTool | undefined {
```

## Interfaces

### `EnhancedMCPTool`

```typescript
interface EnhancedMCPTool {
// ... properties
}
```

## Variables

- `ENHANCED_MCP_TOOLS`

