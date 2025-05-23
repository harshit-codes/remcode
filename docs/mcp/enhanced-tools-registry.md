# enhanced-tools-registry.ts

**File Path:** `mcp/enhanced-tools-registry.ts`

## Overview

Enhanced MCP Tools Registry

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

#### `getToolsByTag()`

```typescript
getToolsByTag(tag: string): EnhancedMCPTool[] {
```

#### `getToolsByPriority()`

```typescript
getToolsByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): EnhancedMCPTool[] {
```

#### `convertToMCPSpec()`

```typescript
convertToMCPSpec(): any {
```

## Variables

- `enhancedToolsRegistry`

