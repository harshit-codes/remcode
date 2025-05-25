# manager.ts

**File Path:** `src/vectorizers/embedders/manager.ts`

## Overview

Initialize and validate the embedding model
Tests the primary model and falls back to alternatives if needed
@returns The initialized model ID and configuration

Check if a model is healthy and available via Inference API
@param modelId The model ID to check
@returns True if the model is available and working

Get available models with their health status
@returns Array of available models with health information

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

## Functions

### `test()`

```typescript
export function test()
```

## Variables

- `logger`
- `EMBEDDING_MODELS`
- `DEFAULT_MODEL`
- `FALLBACK_MODEL`
- `LIGHTWEIGHT_MODEL`
- `modelsToTry`
- `modelId`
- `isHealthy`
- `modelInfo`
- `fallbackModelId`
- `fallbackModelInfo`
- `testInput`
- `embedding`
- `results`
- `isHealthy`
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

