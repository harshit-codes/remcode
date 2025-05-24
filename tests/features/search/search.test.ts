/**
 * Comprehensive Search Feature Tests
 * Tests semantic search functionality and performance
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SemanticSearch } from '../../../src/search/semantic';
import { UnifiedSearch } from '../../../src/search/unified-search';
import { logger } from '../../../src/utils/logger';
import { TEST_CONFIG } from '../../config/test-constants';
import { TestSetupHelper } from '../../config/test-utils';

const TEST_INDEX = TEST_CONFIG.TEST_INDEXES.UNIT;
const TEST_NAMESPACE = 'search-feature';

describe('Search Feature', () => {
  let semanticSearch: SemanticSearch;
  let unifiedSearch: UnifiedSearch;
  
  beforeAll(async () => {
    if (!process.env.PINECONE_API_KEY || !process.env.HUGGINGFACE_TOKEN) {
      throw new Error('Required environment variables not set');
    }
    
    semanticSearch = await TestSetupHelper.createSemanticSearch(TEST_INDEX, TEST_NAMESPACE);
    unifiedSearch = new UnifiedSearch(semanticSearch);
    
    logger.info('🔍 Search feature tests initialized');
  }, TEST_CONFIG.TIMEOUTS.INTEGRATION);  
  describe('Semantic Search', () => {
    it('should perform basic semantic search', async () => {
      const { result: searchResults, duration } = await TestSetupHelper.measurePerformance(
        () => semanticSearch.searchSimilarCode('authentication function', 5),
        'Semantic Search'
      );
      
      expect(searchResults).toBeDefined();
      expect(Array.isArray(searchResults)).toBe(true);
      
      TestSetupHelper.expectPerformance(duration, TEST_CONFIG.PERFORMANCE_TARGETS.SEARCH_RESPONSE, 'Semantic Search');
      
      logger.info(`✅ Semantic search returned ${searchResults.length} results`);
    });

    it('should handle multiple query types', async () => {
      const queries = TEST_CONFIG.TEST_QUERIES;
      const searchPromises = queries.map(query => 
        semanticSearch.searchSimilarCode(query, 3)
      );
      
      const allResults = await Promise.all(searchPromises);
      
      expect(allResults).toHaveLength(queries.length);
      allResults.forEach((results, index) => {
        expect(Array.isArray(results)).toBe(true);
        logger.info(`✅ Query "${queries[index]}" returned ${results.length} results`);
      });
    });

    it('should return empty results for non-matching queries', async () => {
      const nonsenseQuery = 'xyz123nonexistentpattern456';
      const results = await semanticSearch.searchSimilarCode(nonsenseQuery, 5);
      
      expect(Array.isArray(results)).toBe(true);
      logger.info(`✅ Non-matching query returned ${results.length} results`);
    });
  });
  describe('Unified Search', () => {
    it('should provide enhanced search with context', async () => {
      const query = 'authentication patterns';
      const context = 'security implementation';
      
      const results = await unifiedSearch.searchWithContext(query, context, 5);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      logger.info(`✅ Unified search with context returned ${results.length} results`);
    });

    it('should analyze code similarity', async () => {
      const codeSnippet = 'function authenticate(user, password) { return true; }';
      
      const similarityAnalyzer = unifiedSearch.getSimilarityAnalyzer();
      const analysis = await similarityAnalyzer.analyzeCodeSimilarity(codeSnippet, 'typescript');
      
      expect(analysis).toBeDefined();
      expect(analysis).toHaveProperty('patterns');
      expect(Array.isArray(analysis.patterns)).toBe(true);
      
      logger.info(`✅ Code similarity analysis completed with ${analysis.patterns.length} patterns`);
    });
  });

  afterAll(async () => {
    logger.info('🔍 Search feature tests completed');
  });
});
