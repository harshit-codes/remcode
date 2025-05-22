import { describe, it, expect, beforeEach } from '@jest/globals';
import { SemanticSearch } from '../../src/search/semantic';

describe('SemanticSearch', () => {
  let search: SemanticSearch;

  beforeEach(() => {
    search = new SemanticSearch();
  });

  it('should perform semantic search', async () => {
    const results = await search.search('authentication function', 5);
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    // Check result structure
    const firstResult = results[0];
    expect(firstResult).toHaveProperty('id');
    expect(firstResult).toHaveProperty('score');
    expect(firstResult).toHaveProperty('content');
    expect(firstResult).toHaveProperty('metadata');
    
    expect(typeof firstResult.score).toBe('number');
    expect(firstResult.score).toBeGreaterThan(0);
    expect(firstResult.score).toBeLessThanOrEqual(1);
  });

  it('should return results in descending score order', async () => {
    const results = await search.search('test query', 3);
    
    if (results.length > 1) {
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    }
  });

  it('should find similar code patterns', async () => {
    const codeSnippet = 'function authenticate(user) { return user.isValid; }';
    const results = await search.searchSimilarCode(codeSnippet, 3);
    
    expect(Array.isArray(results)).toBe(true);
    results.forEach(result => {
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('language');
    });
  });
});
