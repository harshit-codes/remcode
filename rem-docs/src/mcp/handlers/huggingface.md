# huggingface.ts

**File Path:** `src/mcp/handlers/huggingface.ts`

## Overview

HuggingFace MCP Handler

Handles HuggingFace-related MCP requests, allowing AI assistants
to generate embeddings for code vectorization.

Fixed: Uses correct HuggingFace Inference API with working models

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
function test() {
  // ... implementation
}
```

### `scope()`

```typescript
function scope() {
  // ... implementation
}
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

## Additional Documentation

### Comment 1

Find a working embedding model from our hierarchy

### Comment 2

Check if a model is healthy and available

### Comment 3

Get embedding from model using correct HuggingFace Inference API format
Uses the same patterns as the working EmbeddingManager

### Comment 4

Process embedding result from API (same logic as EmbeddingManager)

### Comment 5

Preprocess text for better embedding quality (same as EmbeddingManager)

### Comment 6

Average token embeddings to get a single vector

## File Statistics

- **Lines of Code**: 425
- **File Size**: 14811 bytes
- **Last Modified**: 2025-05-25T22:47:10.900Z

