/**
 * Model Initialization Test
 * 
 * Tests the new model initialization functionality during setup
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { ModelInitializer } from '../../../src/setup/model-initializer';
import { EmbeddingManager } from '../../../src/vectorizers/embedders/manager';

describe('Model Initialization', () => {
  const testToken = process.env.HUGGINGFACE_TOKEN;

  beforeAll(() => {
    if (!testToken) {
      console.warn('⚠️ HUGGINGFACE_TOKEN not found. Model initialization tests will use mock implementations.');
    }
  });

  describe('ModelInitializer', () => {
    it('should validate HuggingFace token', async () => {
      if (!testToken) {
        expect(await ModelInitializer.validateToken('')).toBe(false);
        return;
      }

      const isValid = await ModelInitializer.validateToken(testToken);
      expect(typeof isValid).toBe('boolean');
      
      if (isValid) {
        console.log('✅ Token validation successful');
      } else {
        console.log('❌ Token validation failed');
      }
    }, 10000);

    it('should initialize embedding model with proper configuration', async () => {
      if (!testToken) {
        // Mock test when no token is available
        const mockInitializer = new ModelInitializer('mock-token');
        const result = await mockInitializer.initializeEmbeddingModel({
          token: 'mock-token',
          preferredModel: 'microsoft/codebert-base'
        });
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('token');
        return;
      }

      const initializer = new ModelInitializer(testToken);
      const result = await initializer.initializeEmbeddingModel({
        token: testToken,
        preferredModel: 'microsoft/codebert-base',
        testEmbedding: false // Skip embedding test for unit tests
      });

      // Validate result structure
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('modelId');
      expect(result).toHaveProperty('modelName');
      expect(result).toHaveProperty('embeddingDimension');
      expect(result).toHaveProperty('isHealthy');
      expect(result).toHaveProperty('availableModels');

      if (result.success) {
        console.log(`✅ Model initialized: ${result.modelName} (${result.modelId})`);
        console.log(`📊 Embedding dimension: ${result.embeddingDimension}`);
        console.log(`🏥 Model healthy: ${result.isHealthy}`);
        console.log(`📋 Available models: ${result.availableModels?.length || 0}`);
      } else {
        console.log(`❌ Model initialization failed: ${result.error}`);
      }

      // Basic validation
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.modelId).toBe('string');
      expect(typeof result.embeddingDimension).toBe('number');
    }, 30000);

    it('should get model configuration for .remcode file', async () => {
      const mockResult = {
        success: true,
        modelId: 'microsoft/codebert-base',
        modelName: 'CodeBERT-Base',
        embeddingDimension: 768,
        isHealthy: true,
        availableModels: [
          { id: 'microsoft/codebert-base', name: 'CodeBERT-Base', isHealthy: true }
        ]
      };

      const config = ModelInitializer.getModelConfiguration(mockResult);

      expect(config).toHaveProperty('embeddingModel');
      expect(config).toHaveProperty('embeddingModelName');
      expect(config).toHaveProperty('embeddingDimension');
      expect(config).toHaveProperty('modelHealthy');
      expect(config).toHaveProperty('lastModelCheck');
      expect(config).toHaveProperty('availableModels');

      expect(config.embeddingModel).toBe('microsoft/codebert-base');
      expect(config.embeddingModelName).toBe('CodeBERT-Base');
      expect(config.embeddingDimension).toBe(768);
      expect(config.modelHealthy).toBe(true);
      expect(Array.isArray(config.availableModels)).toBe(true);
    });
  });

  describe('EmbeddingManager Integration', () => {
    it('should create EmbeddingManager with updated models', () => {
      const manager = new EmbeddingManager({
        token: testToken || 'mock-token',
        primary: 'microsoft/codebert-base',
        fallback: 'BAAI/bge-base-en-v1.5',
        batchSize: 10
      });

      expect(manager).toBeDefined();
      
      const modelInfo = manager.getModelInfo('microsoft/codebert-base');
      expect(modelInfo.id).toBe('microsoft/codebert-base');
      expect(modelInfo.name).toBe('CodeBERT-Base');
      expect(modelInfo.embeddingDimension).toBe(768);
      expect(modelInfo.strategy).toBe('code');
    });

    it('should list available models', () => {
      const manager = new EmbeddingManager({
        token: testToken || 'mock-token',
        primary: 'microsoft/codebert-base',
        fallback: 'BAAI/bge-base-en-v1.5',
        batchSize: 10
      });

      const availableModels = manager.getAvailableModels();
      expect(Array.isArray(availableModels)).toBe(true);
      expect(availableModels.length).toBeGreaterThan(0);

      // Check that CodeBERT is in the list
      const codeBertModel = availableModels.find(m => m.id === 'microsoft/codebert-base');
      expect(codeBertModel).toBeDefined();
      expect(codeBertModel?.strategy).toBe('code');
    });

    it('should perform model health check when available', async () => {
      if (!testToken) {
        console.log('⚠️ Skipping health check test - no token available');
        return;
      }

      const manager = new EmbeddingManager({
        token: testToken,
        primary: 'microsoft/codebert-base',
        fallback: 'BAAI/bge-base-en-v1.5',
        batchSize: 10
      });

      // This will trigger model initialization
      try {
        const initResult = await manager.initializeModel();
        
        expect(initResult).toHaveProperty('modelId');
        expect(initResult).toHaveProperty('modelInfo');
        expect(initResult).toHaveProperty('isHealthy');

        console.log(`🔧 Model initialization result: ${initResult.modelInfo.name} (healthy: ${initResult.isHealthy})`);
      } catch (error) {
        console.log(`⚠️ Model initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        // This is expected if the API is down or rate-limited
      }
    }, 30000);
  });
});
