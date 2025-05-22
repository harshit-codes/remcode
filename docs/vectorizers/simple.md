# simple.ts

**File Path:** `vectorizers/simple.ts`

## Overview

Simplified vectorizer for testing core functionality

## Dependencies

- `../utils/logger`
- `./storage/pinecone`
- `./embedders/manager`

## Classes

### `SimpleVectorizer`

**Class Definition:**

```typescript
export class SimpleVectorizer {
  private storage: PineconeStorage;
  private embedder: EmbeddingManager;
  private initialized = false;

  constructor(options: SimpleOptions) {
    this.storage = new PineconeStorage({
      apiKey: options.pineconeApiKey,
      indexName: options.pineconeIndexName,
      namespace: options.namespace || 'default',
      dimension: 768,
      metric: 'cosine'
    });

    this.embedder = new EmbeddingManager({
      primary: 'microsoft/graphcodebert-base',
      fallback: 'sentence-transformers/all-MiniLM-L6-v2',
      batchSize: 5,
      token: options.huggingfaceToken,
      dimension: 768
    });
  }

  async initialize(): Promise<void> {
    await this.storage.initialize();
    this.initialized = true;
    logger.info('Simple vectorizer initialized');
  }

  async vectorizeText(text: string, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.initialized) {
      throw new Error('Not initialized');
    }

    // Create a chunk with the expected structure
    const chunk = {
      content: text,
      metadata: {
        file_path: metadata.file_path || 'test',
        strategy: 'manual',
        chunk_type: 'text',
        ...metadata
      }
    };

    // Generate embedding
    const embeddedChunks = await this.embedder.embedChunks([chunk]);
    
    if (embeddedChunks[0] && embeddedChunks[0].embedding) {
      // Store in Pinecone
      await this.storage.storeVectors([{
        embedding: embeddedChunks[0].embedding,
        metadata: embeddedChunks[0].metadata
      }]);
      
      logger.info('Text vectorized and stored successfully');
    } else {
      throw new Error('Failed to generate embedding');
    }
  }

  async search(query: string, topK: number = 5): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('Not initialized');
    }

    // Generate embedding for query
    const queryChunk = {
      content: query,
      metadata: { file_path: 'query', strategy: 'search', chunk_type: 'query' }
    };

    const embeddedQuery = await this.embedder.embedChunks([queryChunk]);
    
    if (!embeddedQuery[0] || !embeddedQuery[0].embedding) {
      throw new Error('Failed to generate query embedding');
    }

    // Search
    return await this.storage.queryVectors(embeddedQuery[0].embedding, topK);
  }

  async getStats(): Promise<any> {
    if (!this.initialized) {
      throw new Error('Not initialized');
    }
    return await this.storage.getIndexStats();
  }
}
```

**Methods:**

#### `initialize()`

```typescript
initialize(): Promise<void> {
```

#### `vectorizeText()`

```typescript
vectorizeText(text: string, metadata: Record<string, any> = {}
```

#### `search()`

```typescript
search(query: string, topK: number = 5): Promise<any[]> {
```

#### `getStats()`

```typescript
getStats(): Promise<any> {
```

