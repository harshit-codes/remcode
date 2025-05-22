# search.ts

**File Path:** `mcp/handlers/search.ts`

## Overview

No overview provided.

## Dependencies

- `express`
- `../../utils/logger`
- `../../search/semantic`
- `../../search/context-extractor`
- `../../search/similarity`

## Classes

### `SearchMCPHandler`

**Class Definition:**

```typescript
export class SearchMCPHandler {
  private semanticSearch: SemanticSearch;
  private contextExtractor: ContextExtractor;
  private similarityAnalyzer: SimilarityAnalyzer;

  constructor() {
    this.semanticSearch = new SemanticSearch({
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'remcode-default',
      pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
      pineconeNamespace: process.env.PINECONE_NAMESPACE || 'default',
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
      embeddingModel: 'microsoft/graphcodebert-base',
      fallbackModel: 'sentence-transformers/all-MiniLM-L6-v2'
    });
    
    this.contextExtractor = new ContextExtractor();
    this.similarityAnalyzer = new SimilarityAnalyzer({
      semanticSearch: this.semanticSearch,
      enableSemanticSearch: true,
      enableSyntaxAnalysis: true,
      enablePatternDetection: true
    });
  }

  async handleSearchCode(req: Request, res: Response, params?: any): Promise<void> {
    const { query, topK = 10, filters } = params || req.body;

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    try {
      // Initialize semantic search if not already done
      if (!this.semanticSearch.isInitialized()) {
        await this.semanticSearch.initialize();
      }

      const results = await this.semanticSearch.search(query, topK, filters);
      res.status(200).json({ 
        results, 
        totalResults: results.length,
        query,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Search failed', details: error instanceof Error ? error.message : String(error) });
    }
  }

  async handleGetCodeContext(req: Request, res: Response, params?: any): Promise<void> {
    const { filePath, startLine, endLine } = params || req.body;

    if (!filePath) {
      res.status(400).json({ error: 'File path is required' });
      return;
    }

    try {
      const context = await this.contextExtractor.extractContext(
        filePath, 
        startLine || 0, 
        endLine || startLine || 10
      );
      
      res.status(200).json({ 
        context,
        filePath,
        range: { startLine: startLine || 0, endLine: endLine || startLine || 10 },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Context extraction failed: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Context extraction failed', details: error instanceof Error ? error.message : String(error) });
    }
  }

  async handleFindSimilarPatterns(req: Request, res: Response, params?: any): Promise<void> {
    const { codeSnippet, threshold = 0.8 } = params || req.body;

    if (!codeSnippet) {
      res.status(400).json({ error: 'Code snippet is required' });
      return;
    }

    try {
      const similarityResult = await this.similarityAnalyzer.findSimilarPatterns(codeSnippet, threshold);
      
      res.status(200).json({ 
        ...similarityResult,
        threshold,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Similarity analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Similarity analysis failed', details: error instanceof Error ? error.message : String(error) });
    }
  }
}
```

**Methods:**

#### `handleSearchCode()`

```typescript
handleSearchCode(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleGetCodeContext()`

```typescript
handleGetCodeContext(req: Request, res: Response, params?: any): Promise<void> {
```

#### `handleFindSimilarPatterns()`

```typescript
handleFindSimilarPatterns(req: Request, res: Response, params?: any): Promise<void> {
```

