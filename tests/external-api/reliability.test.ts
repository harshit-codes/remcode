import * as dotenv from 'dotenv';
import { SemanticSearch } from '../../src/search/semantic';
import { PineconeStorage } from '../../src/vectorizers/storage/pinecone';
import { getLogger } from '../../src/utils/logger';

dotenv.config();
const logger = getLogger('ReliabilityTest');

/**
 * Reliability Testing with Real External APIs
 * Tests error handling, edge cases, and recovery scenarios
 */
describe('Reliability Testing with External APIs', () => {
  let semanticSearch: SemanticSearch;
  let pineconeStorage: PineconeStorage;

  beforeAll(async () => {
    semanticSearch = new SemanticSearch({
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeIndexName: 'remcode-test-reliability',
      pineconeNamespace: 'reliability-testing',
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
      embeddingModel: 'BAAI/bge-base-en-v1.5',
      fallbackModel: 'BAAI/bge-small-en-v1.5'
    });

    pineconeStorage = new PineconeStorage({
      apiKey: process.env.PINECONE_API_KEY!,
      indexName: 'remcode-test-reliability',
      namespace: 'reliability-testing',
      dimension: 768
    });

    await Promise.all([
      semanticSearch.initialize(),
      pineconeStorage.initialize()
    ]);

    logger.info('🔧 Reliability testing setup complete');
  }, 30000);

  describe('Error Handling and Recovery', () => {
    it('should handle empty queries gracefully', async () => {
      await expect(semanticSearch.search('')).rejects.toThrow('Search query cannot be empty');
      await expect(semanticSearch.search('   ')).rejects.toThrow('Search query cannot be empty');
      
      logger.info('✅ Empty query validation working correctly');
    });

    it('should handle very long queries', async () => {
      const longQuery = 'a'.repeat(10000); // 10k character query
      
      const results = await semanticSearch.search(longQuery, 1);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      logger.info('✅ Long query handling working correctly');
    }, 15000);

    it('should handle special characters and unicode', async () => {
      const specialQueries = [
        'function test() { return "Hello 世界"; }',
        'const emoji = "🚀💻🔍";',
        'const special = `template ${variable} with symbols !@#$%^&*()`;'
      ];

      for (const query of specialQueries) {
        const results = await semanticSearch.search(query, 1);
        expect(results).toBeDefined();
      }
      
      logger.info('✅ Special character handling working correctly');
    }, 30000);
  });

  describe('Network Resilience', () => {
    it('should handle rate limiting gracefully', async () => {
      // Rapid-fire requests to test rate limiting
      const rapidQueries = Array.from({ length: 10 }, (_, i) => `test query ${i}`);
      
      const results = await Promise.allSettled(
        rapidQueries.map(query => semanticSearch.search(query, 1))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info(`📊 Rate limiting test: ${successful} successful, ${failed} failed out of ${rapidQueries.length}`);
      
      // At least some should succeed, some might fail due to rate limiting
      expect(successful).toBeGreaterThan(0);
    }, 60000);
  });
});
