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

#### `processEmbeddingResult()`

Process embedding result from API based on model type

```typescript
processEmbeddingResult(result: any, modelInfo: ModelInfo): number[] {
    // Handle CodeBERT/GraphCodeBERT response format
```

#### `preprocessText()`

Preprocess text for better embedding quality

```typescript
preprocessText(text: string): string {
    // Remove excessive whitespace but preserve code structure
```

#### `getDimensionForModel()`

Get dimension for a specific model

```typescript
getDimensionForModel(modelId: string): number {
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

