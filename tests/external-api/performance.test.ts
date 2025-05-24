import * as dotenv from 'dotenv';
import { SemanticSearch } from '../../src/search/semantic';
import { getLogger } from '../../src/utils/logger';

dotenv.config();
const logger = getLogger('PerformanceTest');

/**
 * Performance Testing with Real External APIs
 */
describe('Performance Testing with External APIs', () => {
  let semanticSearch: SemanticSearch;
  
  const PERFORMANCE_TARGETS = {
    EMBEDDING_GENERATION: 3000,    // < 3s per embedding
    VECTOR_STORAGE: 2000,          // < 2s per storage operation
    SEMANTIC_SEARCH: 1000,         // < 1s per search
    BATCH_PROCESSING: 10000        // < 10s for batch of 10
  };

  beforeAll(async () => {
    semanticSearch = new SemanticSearch({
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeIndexName: 'remcode-test-performance',
      pineconeNamespace: 'performance-testing',
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
      embeddingModel: 'BAAI/bge-base-en-v1.5'
    });

    await semanticSearch.initialize();
    logger.info('🚀 Performance testing setup complete');
  }, 30000);

  describe('Embedding Generation Performance', () => {
    it('should meet embedding generation time targets', async () => {
      const testCode = 'function complexFunction(data) { return data.map(item => processItem(item)).filter(item => validateItem(item)); }';
      
      const startTime = Date.now();
      const results = await semanticSearch.search(testCode, 1);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.EMBEDDING_GENERATION);
      logger.info(`✅ Embedding generation: ${duration}ms (target: <${PERFORMANCE_TARGETS.EMBEDDING_GENERATION}ms)`);
    }, 10000);
  });

  describe('Search Performance', () => {
    it('should meet search response time targets', async () => {
      const queries = ['authentication', 'data processing', 'error handling', 'user management'];
      const searchTimes: number[] = [];

      for (const query of queries) {
        const startTime = Date.now();
        await semanticSearch.search(query, 5);
        const duration = Date.now() - startTime;
        
        searchTimes.push(duration);
        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.SEMANTIC_SEARCH);
      }

      const avgTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
      logger.info(`✅ Average search time: ${avgTime.toFixed(0)}ms across ${queries.length} queries`);
    }, 30000);
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent searches efficiently', async () => {
      const concurrentQueries = [
        'user authentication function',
        'payment processing logic', 
        'data validation methods',
        'error handling patterns',
        'async await implementation'
      ];

      const startTime = Date.now();
      const results = await Promise.all(
        concurrentQueries.map(query => semanticSearch.search(query, 3))
      );
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(concurrentQueries.length);
      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.BATCH_PROCESSING);
      
      logger.info(`✅ Concurrent searches: ${duration}ms for ${concurrentQueries.length} queries`);
    }, 30000);
  });
});
