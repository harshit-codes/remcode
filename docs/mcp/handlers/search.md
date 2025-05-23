# search.ts

**File Path:** `mcp/handlers/search.ts`

## Overview

Unified search handler that automatically processes queries

## Dependencies

- `express`
- `../../utils/logger`
- `../../search/semantic`
- `../../search/context-extractor`
- `../../search/similarity`
- `../../search/unified-search`

## Classes

### `SearchMCPHandler`

Unified search handler that automatically processes queries

```typescript
class SearchMCPHandler {
// ... implementation
}
```

**Methods:**

#### `handleSearch()`

Unified search handler that automatically processes queries

```typescript
handleSearch(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleSearchCode()`

Legacy search handler (deprecated - use handleSearch instead)

```typescript
handleSearchCode(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGetCodeContext()`

```typescript
handleGetCodeContext(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleFindSimilarPatterns()`

```typescript
handleFindSimilarPatterns(req: Request, res: Response, params?: any): Promise<void> {
```

