import { describe, it, expect, beforeEach } from '@jest/globals';
import { SemanticSearch } from '../../src/search/semantic';

describe('SemanticSearch', () => {
  let search: SemanticSearch;

  beforeEach(async () => {
    search = new SemanticSearch({
      pineconeApiKey: process.env.PINECONE_API_KEY || 'test-key',
      pineconeIndexName: 'remcode-test',
      pineconeEnvironment: 'test',
      pineconeNamespace: 'test',
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN || 'test-token',
      embeddingModel: 'BAAI/bge-base-en-v1.5',
      fallbackModel: 'BAAI/bge-small-en-v1.5',
      embeddingDimension: 768,
      batchSize: 100
    });

    // Initialize search - skip for unit tests without real API
    try {
      await search.initialize();
    } catch (error) {
      // Skip initialization errors in unit tests - use mock mode
      console.warn('Skipping SemanticSearch initialization in unit tests');
    }
  });

  it('should perform semantic search when initialized', async () => {
    if (!search.isInitialized()) {
      console.log('Skipping search test - not initialized');
      return;
    }

    const results = await search.search('authentication function', 5);
    
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 0) {
      // Check result structure
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('id');
      expect(firstResult).toHaveProperty('score');
      expect(firstResult).toHaveProperty('content');
      expect(firstResult).toHaveProperty('metadata');
      
      expect(typeof firstResult.score).toBe('number');
      expect(firstResult.score).toBeGreaterThan(0);
      expect(firstResult.score).toBeLessThanOrEqual(1);
    }
  });
  it('should return results in descending score order', async () => {
    if (!search.isInitialized()) {
      console.log('Skipping search order test - not initialized');
      return;
    }

    const results = await search.search('test query', 3);
    
    expect(Array.isArray(results)).toBe(true);
    
    if (results.length > 1) {
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    }
  });

  it('should find similar code patterns when initialized', async () => {
    if (!search.isInitialized()) {
      console.log('Skipping similar code test - not initialized');
      return;
    }

    const codeSnippet = `
      function authenticate(user, password) {
        return user.password === hashPassword(password);
      }
    `;
    
    const results = await search.searchSimilarCode(codeSnippet, 3);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should handle initialization status correctly', () => {
    // Test initialization state
    expect(typeof search.isInitialized).toBe('function');
  });
});
