# enhanced-tools-registry-final.ts

**File Path:** `mcp/enhanced-tools-registry-final.ts`

## Overview

Enhanced MCP Tools Registry - Final

Consolidates all enhanced tool definitions and provides utilities for tool management

## Dependencies

- `./types/enhanced-tool-types`
- `./tools/setup-configuration`
- `./tools/repository-management`
- `./tools/code-search-analysis`

## Classes

### `EnhancedToolsRegistry`

```typescript
class EnhancedToolsRegistry {
// ... implementation
}
```

**Methods:**

#### `initializeTools()`

```typescript
initializeTools(): void {
```

#### `getAllTools()`

```typescript
getAllTools(): EnhancedMCPTool[] {
```

#### `getToolByName()`

```typescript
getToolByName(name: string): EnhancedMCPTool | undefined {
```

#### `getToolsByCategory()`

```typescript
getToolsByCategory(category: ToolCategory): EnhancedMCPTool[] {
```

## Variables

- `enhancedToolsRegistry`

