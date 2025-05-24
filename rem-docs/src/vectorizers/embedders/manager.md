# manager.ts

**File Path:** `src/vectorizers/embedders/manager.ts`

## Overview

Embeds code chunks using the specified model
@param chunks Array of code chunks to embed
@returns The chunks with embeddings added

Embeds a single code chunk

Embeds a single chunk with fallback strategy

Gets an embedding from the HuggingFace model

Get embedding via direct API call

Process embedding result from API based on model type

Preprocess text for better embedding quality

Get dimension for a specific model

Averages token embeddings to get a single vector

Generates random embeddings as a fallback

Get model information

List available models

## Dependencies

- `../../utils/logger`
- `@huggingface/inference`
- `../types`

## Classes

### `EmbeddingManager`

```typescript
class EmbeddingManager {
// ... implementation
}
```

## Interfaces

### `ModelInfo`

```typescript
interface ModelInfo {
// ... properties
}
```

## Variables

- `logger`
- `EMBEDDING_MODELS`
- `DEFAULT_MODEL`
- `FALLBACK_MODEL`
- `result`
- `i`
- `chunk`
- `embeddedChunk`
- `fallbackChunk`
- `embedding`
- `embedding`
- `dimension`
- `embedding`
- `processedText`
- `modelInfo`
- `attempt`
- `requestBody`
- `apiUrl`
- `response`
- `errorMessage`
- `processed`
- `dim`
- `avg`
- `i`
- `j`
- `j`
- `dimension`

