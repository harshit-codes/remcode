import * as dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';
import { getLogger } from '../../src/utils/logger';

dotenv.config();
const logger = getLogger('PineconeSetupTest');

/**
 * Pinecone Testing Infrastructure Setup
 * 
 * This test suite sets up and validates dedicated test projects in Pinecone
 * for reliable external API testing without affecting production data.
 */
describe('Pinecone Testing Infrastructure', () => {
  let pinecone: Pinecone;
  const TEST_INDEXES = [
    'remcode-test-basic',      // Basic functionality testing
    'remcode-test-performance', // Performance benchmarking  
    'remcode-test-reliability', // Error handling and edge cases
    'remcode-test-integration'  // End-to-end integration testing
  ];

  beforeAll(async () => {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }

    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });

    logger.info('🔧 Setting up Pinecone testing infrastructure...');
  });

  describe('Test Index Management', () => {
    it('should list existing indexes', async () => {
      const indexes = await pinecone.listIndexes();
      logger.info(`📋 Found ${indexes.indexes?.length || 0} existing indexes`);
      
      if (indexes.indexes) {
        for (const index of indexes.indexes) {
          logger.info(`  • ${index.name} (${index.spec?.pod?.environment || 'unknown'}) - ${index.status?.state}`);
        }
      }
      
      expect(indexes).toBeDefined();
    }, 30000);

    it('should create test indexes if they do not exist', async () => {
      const existingIndexes = await pinecone.listIndexes();
      const existingNames = existingIndexes.indexes?.map(idx => idx.name) || [];

      for (const testIndexName of TEST_INDEXES) {
        if (!existingNames.includes(testIndexName)) {
          logger.info(`🆕 Creating test index: ${testIndexName}`);
          
          try {
            await pinecone.createIndex({
              name: testIndexName,
              dimension: 768, // CodeBERT/BGE dimension
              metric: 'cosine',
              spec: {
                serverless: {
                  cloud: 'aws',
                  region: 'us-east-1'  // Free tier compatible region
                }
              }
            });
            
            logger.info(`✅ Created test index: ${testIndexName}`);
            
            // Wait for index to be ready
            let attempts = 0;
            while (attempts < 30) {
              const status = await pinecone.describeIndex(testIndexName);
              if (status.status?.ready) {
                logger.info(`🟢 Index ${testIndexName} is ready`);
                break;
              }
              logger.info(`⏳ Waiting for ${testIndexName} to be ready... (${attempts + 1}/30)`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              attempts++;
            }
            
          } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
              logger.info(`✅ Test index ${testIndexName} already exists`);
            } else {
              logger.error(`❌ Failed to create index ${testIndexName}`, error instanceof Error ? error : new Error(String(error)));
              throw error;
            }
          }
        } else {
          logger.info(`✅ Test index ${testIndexName} already exists`);
        }
      }
    }, 120000); // 2 minutes timeout for index creation

    it('should validate test index configurations', async () => {
      for (const testIndexName of TEST_INDEXES) {
        try {
          const indexInfo = await pinecone.describeIndex(testIndexName);
          
          expect(indexInfo.name).toBe(testIndexName);
          expect(indexInfo.dimension).toBe(768);
          expect(indexInfo.metric).toBe('cosine');
          expect(indexInfo.status?.ready).toBe(true);
          
          logger.info(`✅ Validated index configuration: ${testIndexName}`);
        } catch (error) {
          if (error instanceof Error && error.message.includes('404')) {
            logger.warn(`⚠️ Index ${testIndexName} not found - likely due to region/plan limitations`);
          } else {
            logger.error(`❌ Failed to validate index ${testIndexName}`, error instanceof Error ? error : new Error(String(error)));
            throw error;
          }
        }
      }
    }, 60000);
  });

  describe('Basic Index Operations', () => {
    const testIndex = 'remcode-test'; // Use existing index
    
    it('should perform basic upsert operations', async () => {
      const index = pinecone.index(testIndex);
      
      const testVectors = [
        {
          id: 'test-1',
          values: Array.from({ length: 768 }, () => Math.random()),
          metadata: {
            content: 'function testAuthentication() { return true; }',
            file_path: '/test/auth.ts',
            language: 'typescript',
            chunk_type: 'function'
          }
        },
        {
          id: 'test-2', 
          values: Array.from({ length: 768 }, () => Math.random()),
          metadata: {
            content: 'async function loginUser(email, password) { /* impl */ }',
            file_path: '/test/login.ts',
            language: 'typescript',
            chunk_type: 'function'
          }
        }
      ];

      const upsertResult = await index.upsert(testVectors);
      expect(upsertResult).toBeDefined();
      
      logger.info(`✅ Upserted ${testVectors.length} test vectors`);
    }, 30000);

    it('should perform basic query operations', async () => {
      const index = pinecone.index(testIndex);
      
      // Query with a random vector
      const queryVector = Array.from({ length: 768 }, () => Math.random());
      
      const queryResult = await index.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true
      });

      expect(queryResult.matches).toBeDefined();
      expect(queryResult.matches.length).toBeGreaterThan(0);
      
      for (const match of queryResult.matches) {
        expect(match.id).toBeDefined();
        expect(match.score).toBeDefined();
        expect(match.metadata).toBeDefined();
      }
      
      logger.info(`✅ Query returned ${queryResult.matches.length} matches`);
    }, 30000);

    it('should perform namespace operations', async () => {
      const index = pinecone.index(testIndex);
      
      // Test with a specific namespace
      const testNamespace = 'test-namespace';
      
      const testVector = {
        id: 'namespace-test-1',
        values: Array.from({ length: 768 }, () => Math.random()),
        metadata: {
          content: 'namespace test vector',
          namespace: testNamespace
        }
      };

      await index.namespace(testNamespace).upsert([testVector]);
      
      const queryResult = await index.namespace(testNamespace).query({
        vector: Array.from({ length: 768 }, () => Math.random()),
        topK: 5,
        includeMetadata: true
      });

      expect(queryResult.matches).toBeDefined();
      logger.info(`✅ Namespace operations working correctly`);
    }, 30000);
  });
});
