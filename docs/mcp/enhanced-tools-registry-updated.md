# enhanced-tools-registry-updated.ts

**File Path:** `mcp/enhanced-tools-registry-updated.ts`

## Overview

Enhanced MCP Tools Registry - Updated

Consolidates all enhanced tool definitions and provides utilities for tool management

## Dependencies

- `./types/enhanced-tool-types`
- `./tools/setup-configuration`
- `./tools/repository-management`
- `./tools/code-search-analysis`
- `./tools/processing-workflows`
- `./tools/ai-swe-assistance`

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

#### `getCategoryStats()`

```typescript
getCategoryStats(): Record<string, number> {
```

#### `getToolSummary()`

```typescript
getToolSummary(): any {
```

## Variables

- `enhancedToolsRegistry`

