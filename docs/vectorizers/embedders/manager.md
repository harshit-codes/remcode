# manager.ts

**File Path:** `vectorizers/embedders/manager.ts`

## Overview

Embeds code chunks using the specified model
@param chunks Array of code chunks to embed
@returns The chunks with embeddings added

## Dependencies

- `../../utils/logger`
- `@huggingface/inference`
- `../types`

## Classes

### `EmbeddingManager`

Embeds code chunks using the specified model

```typescript
class EmbeddingManager {
// ... implementation
}
```

**Methods:**

#### `embedChunks()`

Embeds code chunks using the specified model
@param chunks Array of code chunks to embed
@returns The chunks with embeddings added

```typescript
embedChunks(chunks: CodeChunk[]): Promise<CodeChunk[]> {
```

#### `if()`

```typescript
if (Array.isArray(result[0])) {
```

#### `averageEmbeddings()`

Averages token embeddings to get a single vector

```typescript
averageEmbeddings(embeddings: number[][]): number[] {
```

#### `generateRandomEmbeddings()`

Generates random embeddings as a fallback

```typescript
generateRandomEmbeddings(chunks: CodeChunk[]): CodeChunk[] {
```

