# pinecone.ts

**File Path:** `vectorizers/storage/pinecone.ts`

## Overview

No overview provided.

## Dependencies

- `../../utils/logger`
- `@pinecone-database/pinecone`
- `uuid`

## Classes

### `PineconeStorage`

```typescript
class PineconeStorage {
// ... implementation
}
```

**Methods:**

#### `initialize()`

```typescript
initialize(): Promise<void> {
```

#### `storeVectors()`

```typescript
storeVectors(vectors: VectorData[]): Promise<void> {
```

#### `queryVectors()`

```typescript
queryVectors(embeddings: number[], topK: number = 10, filter?: Record<string, any>, namespace?: string): Promise<any[]> {
```

#### `deleteVectors()`

```typescript
deleteVectors(ids?: string[], deleteAll: boolean = false, filter?: Record<string, any>, namespace?: string): Promise<number> {
```

#### `deleteVectorsByMetadata()`

```typescript
deleteVectorsByMetadata(metadata: Record<string, any>, namespace?: string): Promise<number> {
```

#### `listIndexes()`

```typescript
listIndexes(): Promise<any[]> {
```

#### `getIndexStats()`

```typescript
getIndexStats(namespace?: string): Promise<any> {
```

