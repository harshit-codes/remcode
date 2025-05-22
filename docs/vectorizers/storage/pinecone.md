# pinecone.ts

**File Path:** `vectorizers/storage/pinecone.ts`

## Overview

Delete vectors by metadata fields
This is a convenience method for incremental updates when vectors need
to be deleted by file path or other metadata criteria
@param metadata Metadata field criteria to match
@param namespace Optional namespace (uses default if not provided)
@returns A promise that resolves when deletion is complete

## Dependencies

- `../../utils/logger`
- `@pinecone-database/pinecone`
- `uuid`

## Classes

### `PineconeStorage`

Delete vectors by metadata fields
This is a convenience method for incremental updates when vectors need
to be deleted by file path or other metadata criteria

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

Delete vectors by metadata fields
This is a convenience method for incremental updates when vectors need
to be deleted by file path or other metadata criteria
@param metadata Metadata field criteria to match
@param namespace Optional namespace (uses default if not provided)
@returns A promise that resolves when deletion is complete

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

