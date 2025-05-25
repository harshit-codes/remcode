# huggingface.ts

**File Path:** `src/mcp/handlers/huggingface.ts`

## Overview

HuggingFace MCP Handler

Handles HuggingFace-related MCP requests, allowing AI assistants
to generate embeddings for code vectorization.

Fixed: Uses correct HuggingFace Inference API with working models

Find a working embedding model from our hierarchy

Check if a model is healthy and available

Get embedding from model using correct HuggingFace Inference API format

Process embedding result from API

Preprocess text for better embedding quality

Average token embeddings to get a single vector

## Dependencies

- `express`
- `../../utils/logger`

## Classes

### `HuggingFaceMCPHandler`

```typescript
class HuggingFaceMCPHandler {
// ... implementation
}
```

## Interfaces

### `HuggingFaceMCPOptions`

```typescript
interface HuggingFaceMCPOptions {
// ... properties
}
```

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
- `FALLBACK_MODELS`
- `modelsToTry`
- `modelId`
- `isHealthy`
- `testInput`
- `embedding`
- `action`
- `modelId`
- `processedText`
- `modelInfo`
- `requestBody`
- `apiUrl`
- `response`
- `processed`
- `dim`
- `avg`
- `i`
- `j`
- `j`
- `requestParams`
- `modelToUse`
- `embeddings`
- `codeItem`
- `embedding`
- `embedding`
- `requestParams`
- `modelToUse`
- `embedding`
- `models`

