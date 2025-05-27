# manager.ts

**File Path:** `src/vectorizers/embedders/manager.ts`

## Overview

Initialize and validate the embedding model
Tests the primary model and falls back to alternatives if needed
@returns The initialized model ID and configuration

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
function test() {
  // ... implementation
}
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

## Additional Documentation

### Comment 1

Check if a model is healthy and available via Inference API
@param modelId The model ID to check
@returns True if the model is available and working

### Comment 2

Get available models with their health status
@returns Array of available models with health information

### Comment 3

Embeds code chunks using the specified model
@param chunks Array of code chunks to embed
@returns The chunks with embeddings added

### Comment 4

Embeds a single code chunk

### Comment 5

Embeds a single chunk with fallback strategy

### Comment 6

Gets an embedding from the HuggingFace model

### Comment 7

Get embedding via direct API call

### Comment 8

Process embedding result from API based on model type

### Comment 9

Preprocess text for better embedding quality

### Comment 10

Get dimension for a specific model

### Comment 11

Averages token embeddings to get a single vector

### Comment 12

Generates random embeddings as a fallback

### Comment 13

Get model information

### Comment 14

List available models

## File Statistics

- **Lines of Code**: 451
- **File Size**: 15416 bytes
- **Last Modified**: 2025-05-25T05:51:54.918Z

