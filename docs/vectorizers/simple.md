# simple.ts

**File Path:** `vectorizers/simple.ts`

## Overview

Simplified vectorizer for testing core functionality

## Dependencies

- `../utils/logger`
- `./storage/pinecone`
- `./embedders/manager`

## Classes

### `SimpleVectorizer`

```typescript
class SimpleVectorizer {
// ... implementation
}
```

**Methods:**

#### `initialize()`

```typescript
initialize(): Promise<void> {
```

#### `vectorizeText()`

```typescript
vectorizeText(text: string, metadata: Record<string, any> = {}
```

#### `search()`

```typescript
search(query: string, topK: number = 5): Promise<any[]> {
```

#### `getStats()`

```typescript
getStats(): Promise<any> {
```

