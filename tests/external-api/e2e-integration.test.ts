import * as dotenv from 'dotenv';
import { SemanticSearch } from '../../src/search/semantic';
import { PineconeStorage } from '../../src/vectorizers/storage/pinecone';
import { EmbeddingManager } from '../../src/vectorizers/embedders/manager';
import { logger } from '../../src/utils/logger';
import { TEST_CONFIG } from '../config/test-constants';
import { TestSetupHelper } from '../config/test-utils';

dotenv.config();

/**
 * End-to-End External API Integration Test
 * 
 * Tests the complete pipeline using real Pinecone and HuggingFace APIs
 */
describe('End-to-End External API Integration', () => {
  let semanticSearch: SemanticSearch;
  let pineconeStorage: PineconeStorage;
  let embeddingManager: EmbeddingManager;
  
  const TEST_INDEX = TEST_CONFIG.TEST_INDEXES.E2E;
  const TEST_NAMESPACE = 'e2e-testing';

  beforeAll(async () => {
    // Validate environment variables
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }
    if (!process.env.HUGGINGFACE_TOKEN) {
      throw new Error('HUGGINGFACE_TOKEN environment variable is required');
    }

    logger.info('🚀 Starting end-to-end external API integration test...');

    // Initialize components using TestSetupHelper
    semanticSearch = await TestSetupHelper.createSemanticSearch(TEST_INDEX, TEST_NAMESPACE);
    pineconeStorage = await TestSetupHelper.createPineconeStorage(TEST_INDEX, TEST_NAMESPACE);
    embeddingManager = await TestSetupHelper.createEmbeddingManager();
      batchSize: 5
    });

    // Initialize all components
    await Promise.all([
      semanticSearch.initialize(),
      pineconeStorage.initialize()
    ]);

    logger.info('✅ All components initialized successfully');
  }, 60000);

  describe('Real API Pipeline Testing', () => {
    const testCodeChunks = TEST_CONFIG.SAMPLE_CODE_CHUNKS;

    it('should generate real embeddings via HuggingFace', async () => {
      logger.info('📡 Testing real HuggingFace embedding generation...');

      const codeChunks = testCodeChunks.map(chunk => ({
        content: chunk.content,
        metadata: chunk.metadata
      }));

      const embeddedChunks = await embeddingManager.embedChunks(codeChunks);

      // Validate embeddings
      expect(embeddedChunks).toHaveLength(testCodeChunks.length);
      
      for (const chunk of embeddedChunks) {
        expect(chunk.embedding).toBeDefined();
        expect(chunk.embedding).not.toBeNull();
        if (chunk.embedding) {
          expect(chunk.embedding).toHaveLength(768); // BGE base model dimension
          expect(chunk.embedding.every(val => typeof val === 'number')).toBe(true);
        }
      }

      logger.info(`✅ Generated ${embeddedChunks.length} real embeddings with ${embeddedChunks[0].embedding!.length} dimensions`);
    }, 30000);

    it('should store vectors in real Pinecone index', async () => {
      logger.info('🗄️ Testing real Pinecone vector storage...');

      // Generate embeddings first
      const codeChunks = testCodeChunks.map(chunk => ({
        content: chunk.content,
        metadata: chunk.metadata
      }));

      const embeddedChunks = await embeddingManager.embedChunks(codeChunks);

      // Store in Pinecone
      const vectorData = embeddedChunks.map((chunk, index) => ({
        id: `e2e-test-${index + 1}`,
        embedding: chunk.embedding!,
        metadata: {
          content: chunk.content,
          ...chunk.metadata
        }
      }));

      await pineconeStorage.storeVectors(vectorData);

      // Verify storage
      const stats = await pineconeStorage.getIndexStats(TEST_NAMESPACE);
      expect(stats.namespaces?.[TEST_NAMESPACE]?.vectorCount).toBeGreaterThan(0);

      logger.info(`✅ Stored ${vectorData.length} vectors in Pinecone successfully`);
    }, 60000);

    it('should perform real semantic search', async () => {
      logger.info('🔍 Testing real semantic search pipeline...');

      const searchQueries = [
        'authentication function',
        'payment processing',
        'data transformation',
        'user validation'
      ];

      for (const query of searchQueries) {
        const results = await semanticSearch.search(query, 3);
        
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        
        if (results.length > 0) {
          expect(results[0].score).toBeGreaterThan(0);
          expect(results[0].content).toBeDefined();
          expect(results[0].metadata).toBeDefined();
          
          logger.info(`✅ Query "${query}": ${results.length} results, top score: ${results[0].score.toFixed(3)}`);
        } else {
          logger.warn(`⚠️ Query "${query}": No results found`);
        }
      }

      logger.info('✅ Semantic search pipeline working with real APIs');
    }, 90000);
  });

  afterAll(async () => {
    // Cleanup test data
    const testVectorIds = ['e2e-test-1', 'e2e-test-2', 'e2e-test-3'];
    await TestSetupHelper.cleanupTestData(pineconeStorage, testVectorIds, TEST_NAMESPACE);
  });
});
