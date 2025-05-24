/**
 * Comprehensive Vectorization Feature Tests
 * Tests the complete vectorization pipeline functionality
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { VectorizationPipeline } from '../../../src/vectorizers/pipeline';
import { EmbeddingManager } from '../../../src/vectorizers/embedders/manager';
import { PineconeStorage } from '../../../src/vectorizers/storage/pinecone';
import { ChunkingManager } from '../../../src/vectorizers/chunkers/manager';
import { logger } from '../../../src/utils/logger';
import { TEST_CONFIG } from '../../config/test-constants';
import { TestSetupHelper } from '../../config/test-utils';
import * as fs from 'fs';
import * as path from 'path';

const TEST_INDEX = TEST_CONFIG.TEST_INDEXES.UNIT;
const TEST_NAMESPACE = 'vectorization-feature';

describe('Vectorization Feature', () => {
  let pipeline: VectorizationPipeline;
  let embeddingManager: EmbeddingManager;
  let storage: PineconeStorage;
  let chunkingManager: ChunkingManager;
  
  beforeAll(async () => {
    if (!process.env.PINECONE_API_KEY || !process.env.HUGGINGFACE_TOKEN) {
      throw new Error('Required environment variables not set');
    }
    
    // Initialize components
    pipeline = await TestSetupHelper.createVectorizationPipeline(TEST_INDEX);
    embeddingManager = await TestSetupHelper.createEmbeddingManager();
    storage = await TestSetupHelper.createPineconeStorage(TEST_INDEX, TEST_NAMESPACE);
    chunkingManager = new ChunkingManager({
      clean_modules: 'function_level',
      complex_modules: 'file_level',
      monolithic_files: 'sliding_window_with_high_overlap'
    });
    
    logger.info('🧪 Vectorization feature tests initialized');
  }, TEST_CONFIG.TIMEOUTS.INTEGRATION);  
  describe('Code Chunking', () => {
    it('should chunk code at function level', async () => {
      const testCode = `
        function testFunction() {
          return "test";
        }
        
        function anotherFunction() {
          return "another";
        }
      `;
      
      const chunks = await chunkingManager.chunkFile(
        testCode, 
        'function_level',
        { 
          file_path: '/test/file.ts',
          language: 'typescript',
          extension: '.ts'
        }
      );
      
      expect(chunks).toHaveLength(2);
      expect(chunks[0].metadata.chunk_type).toBe('function');
      expect(chunks[0].metadata.function_name).toBe('testFunction');
      expect(chunks[1].metadata.function_name).toBe('anotherFunction');
      
      logger.info(`✅ Chunked code into ${chunks.length} function-level chunks`);
    });

    it('should chunk code at class level', async () => {
      const testCode = `
        class TestClass {
          method1() {
            return "method1";
          }
          
          method2() {
            return "method2";  
          }
        }
      `;      
      const chunks = await chunkingManager.chunkFile(
        testCode,
        'class_level', 
        {
          file_path: '/test/class.ts',
          language: 'typescript',
          extension: '.ts'
        }
      );
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0].metadata.chunk_type).toBe('class');
      expect(chunks[0].metadata.class_name).toBe('TestClass');
      
      logger.info(`✅ Chunked class code into ${chunks.length} class-level chunk`);
    });
  });

  describe('Embedding Generation', () => {
    it('should generate embeddings for code chunks', async () => {
      const testChunks = TEST_CONFIG.SAMPLE_CODE_CHUNKS;
      
      const { result: embeddedChunks, duration } = await TestSetupHelper.measurePerformance(
        () => embeddingManager.embedChunks(testChunks),
        'Embedding Generation'
      );
      
      expect(embeddedChunks).toHaveLength(testChunks.length);
      
      for (const chunk of embeddedChunks) {
        expect(chunk.embedding).toBeDefined();
        expect(chunk.embedding).not.toBeNull();
        if (chunk.embedding) {
          expect(chunk.embedding).toHaveLength(768);
          expect(chunk.embedding.every(val => typeof val === 'number')).toBe(true);
        }
      }
      
      TestSetupHelper.expectPerformance(duration, TEST_CONFIG.PERFORMANCE_TARGETS.EMBEDDING_GENERATION, 'Embedding Generation');
      
      logger.info(`✅ Generated embeddings for ${embeddedChunks.length} chunks`);
    });
  });

  describe('Vector Storage', () => {
    it('should store and retrieve vectors', async () => {
      const testVectors = TEST_CONFIG.SAMPLE_CODE_CHUNKS.map((chunk, index) => ({
        id: `vectorization-test-${index}`,
        embedding: Array(768).fill(0).map(() => Math.random()),
        metadata: chunk.metadata
      }));
      
      // Store vectors
      await storage.storeVectors(testVectors);
      
      // Query vectors
      const queryVector = Array(768).fill(0).map(() => Math.random());
      const results = await storage.queryVectors(queryVector, 3, {}, TEST_NAMESPACE);
      
      expect(results).toHaveLength(3);
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('metadata');
      
      logger.info(`✅ Stored and retrieved ${testVectors.length} vectors`);
      
      // Cleanup
      const vectorIds = testVectors.map(v => v.id!);
      await TestSetupHelper.cleanupTestData(storage, vectorIds, TEST_NAMESPACE);
    });
  });

  afterAll(async () => {
    logger.info('🧹 Vectorization feature tests completed');
  });
});
