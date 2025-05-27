# manager.ts

**File Path**: `vectorizers/embedders/manager.ts`

## Description

Initialize and validate the embedding model
 Tests the primary model and falls back to alternatives if needed
 @returns The initialized model ID and configuration

## Classes

- `EmbeddingManager`

## Documentation Comments

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

## Code Overview

```typescript
import { getLogger } from '../../utils/logger';
import axios from 'axios';
import { HfInference } from '@huggingface/inference';
import * as dotenv from 'dotenv';
import { CodeChunk, EmbeddingManagerOptions } from '../types';

// Key exports:
export class EmbeddingManager { ... }
```

## File Statistics

- **Lines of Code**: 451
- **File Size**: 15416 bytes
- **Last Modified**: 2025-05-25T05:51:54.918Z

