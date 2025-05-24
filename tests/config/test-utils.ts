/**
 * Test utilities for production-ready testing infrastructure
 */

import { SemanticSearch } from '../../src/search/semantic';
import { PineconeStorage } from '../../src/vectorizers/storage/pinecone';
import { EmbeddingManager } from '../../src/vectorizers/embedders/manager';
import { VectorizationPipeline } from '../../src/vectorizers/pipeline';
import { logger } from '../../src/utils/logger';
import { TEST_CONFIG, MOCK_CONFIG } from './test-constants';

export class TestSetupHelper {
  static async createSemanticSearch(indexName: string, namespace?: string): Promise<SemanticSearch> {
    if (!process.env.PINECONE_API_KEY || !process.env.HUGGINGFACE_TOKEN) {
      throw new Error('Required environment variables not set for SemanticSearch');
    }
    
    return new SemanticSearch({
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeIndexName: indexName,
      pineconeNamespace: namespace,
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
      embeddingModel: 'BAAI/bge-base-en-v1.5',
      fallbackModel: 'BAAI/bge-small-en-v1.5'
    });
  }
  static async createPineconeStorage(indexName: string, namespace?: string): Promise<PineconeStorage> {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable not set');
    }
    
    return new PineconeStorage({
      apiKey: process.env.PINECONE_API_KEY,
      indexName,
      namespace,
      dimension: 768
    });
  }

  static async createEmbeddingManager(): Promise<EmbeddingManager> {
    if (!process.env.HUGGINGFACE_TOKEN) {
      throw new Error('HUGGINGFACE_TOKEN environment variable not set');
    }
    
    return new EmbeddingManager({
      primary: 'BAAI/bge-base-en-v1.5',
      fallback: 'BAAI/bge-small-en-v1.5',
      token: process.env.HUGGINGFACE_TOKEN,
      dimension: 768,
      batchSize: 5
    });
  }
  static async createVectorizationPipeline(indexName: string): Promise<VectorizationPipeline> {
    if (!process.env.PINECONE_API_KEY || !process.env.HUGGINGFACE_TOKEN) {
      throw new Error('Required environment variables not set for VectorizationPipeline');
    }
    
    return new VectorizationPipeline({
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeIndexName: indexName,
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
      embeddingModel: 'BAAI/bge-base-en-v1.5',
      fallbackModel: 'BAAI/bge-small-en-v1.5'
    });
  }

  static async cleanupTestData(storage: PineconeStorage, vectorIds: string[], namespace?: string): Promise<void> {
    try {
      await storage.deleteVectors(vectorIds, false, {}, namespace);
      logger.info(`🧹 Cleaned up ${vectorIds.length} test vectors`);
    } catch (error) {
      logger.warn('⚠️ Could not clean up test data:', { error: error instanceof Error ? error.message : String(error) });
    }
  }
  static generateTestId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static async measurePerformance<T>(operation: () => Promise<T>, name: string): Promise<{ result: T, duration: number }> {
    const startTime = Date.now();
    const result = await operation();
    const duration = Date.now() - startTime;
    logger.info(`📊 ${name}: ${duration}ms`);
    return { result, duration };
  }

  static expectPerformance(duration: number, target: number, operation: string): void {
    if (duration > target) {
      logger.warn(`⚠️ Performance warning: ${operation} took ${duration}ms (target: ${target}ms)`);
    }
    expect(duration).toBeLessThan(target * 1.5); // Allow 50% tolerance
  }
}
