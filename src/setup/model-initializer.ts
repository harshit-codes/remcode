/**
 * Model Initialization Service
 * 
 * Handles programmatic initialization and validation of HuggingFace models
 * during remcode setup. Ensures embedding models are available and working
 * before proceeding with repository processing.
 */

import { getLogger } from '../utils/logger';
import { EmbeddingManager } from '../vectorizers/embedders/manager';

const logger = getLogger('ModelInitializer');

/**
 * Model initialization result
 */
export interface ModelInitializationResult {
  success: boolean;
  modelId: string;
  modelName: string;
  embeddingDimension: number;
  isHealthy: boolean;
  error?: string;
  availableModels?: Array<{ id: string; name: string; isHealthy: boolean }>;
}

/**
 * Model initialization options
 */
export interface ModelInitializationOptions {
  token: string;
  preferredModel?: string;
  testEmbedding?: boolean;
}

/**
 * Class for initializing and validating embedding models during setup
 */
export class ModelInitializer {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Initialize embedding model for remcode setup
   * Tests model availability and validates embedding generation
   * @param options Initialization options
   * @returns Model initialization result
   */
  async initializeEmbeddingModel(options: ModelInitializationOptions): Promise<ModelInitializationResult> {
    logger.info('🔧 Initializing embedding model for remcode setup...');

    try {
      // Validate token first
      if (!this.token) {
        return {
          success: false,
          modelId: '',
          modelName: '',
          embeddingDimension: 0,
          isHealthy: false,
          error: 'HuggingFace token is required for model initialization'
        };
      }

      // Create embedding manager with provided token
      const embeddingManager = new EmbeddingManager({
        token: this.token,
        primary: options.preferredModel || 'microsoft/codebert-base',
        fallback: 'BAAI/bge-base-en-v1.5',
        batchSize: 10
      });

      // Initialize and test the model
      const initResult = await embeddingManager.initializeModel();

      if (!initResult.isHealthy) {
        logger.warn(`⚠️ Model ${initResult.modelId} initialized but failed health checks`);
      }

      // Get available models for reporting
      const availableModels = await embeddingManager.getAvailableModelsWithHealth();
      const healthyModels = availableModels.filter(m => m.isHealthy);

      logger.info(`✅ Model initialization complete: ${initResult.modelInfo.name}`);
      logger.info(`📊 Available models: ${healthyModels.length}/${availableModels.length} healthy`);

      // Optionally test embedding generation
      if (options.testEmbedding && initResult.isHealthy) {
        await this.testEmbeddingGeneration(embeddingManager);
      }

      return {
        success: true,
        modelId: initResult.modelId,
        modelName: initResult.modelInfo.name,
        embeddingDimension: initResult.modelInfo.embeddingDimension,
        isHealthy: initResult.isHealthy,
        availableModels: availableModels.map(m => ({
          id: m.id,
          name: m.name,
          isHealthy: m.isHealthy
        }))
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`❌ Model initialization failed: ${errorMessage}`);

      return {
        success: false,
        modelId: '',
        modelName: '',
        embeddingDimension: 0,
        isHealthy: false,
        error: errorMessage
      };
    }
  }

  /**
   * Test embedding generation with sample code
   * @param embeddingManager The embedding manager to test
   */
  private async testEmbeddingGeneration(embeddingManager: EmbeddingManager): Promise<void> {
    logger.info('🧪 Testing embedding generation with sample code...');

    try {
      const testChunks = [
        {
          id: 'test-1',
          content: 'function authenticate(user, password) { return validateCredentials(user, password); }',
          metadata: {
            file_path: 'test.js',
            strategy: 'function_level',
            language: 'javascript',
            start_line: 1,
            end_line: 1,
            function_name: 'authenticate',
            chunk_type: 'function'
          }
        }
      ];

      const embeddedChunks = await embeddingManager.embedChunks(testChunks);

      if (embeddedChunks.length > 0 && embeddedChunks[0].embedding) {
        const embedding = embeddedChunks[0].embedding;
        logger.info(`✅ Embedding test successful: Generated ${embedding.length}-dimensional vector`);
      } else {
        logger.warn('⚠️ Embedding test failed: No embedding generated');
      }

    } catch (error) {
      logger.warn(`⚠️ Embedding test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate HuggingFace token by testing API access
   * @param token The token to validate
   * @returns True if token is valid and has required permissions
   */
  static async validateToken(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    try {
      // Test token by making a simple API call
      const response = await fetch('https://huggingface.co/api/whoami', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json() as { name?: string };
        logger.debug(`✅ Token validated for user: ${data.name || 'unknown'}`);
        return true;
      } else {
        logger.warn(`❌ Token validation failed: ${response.status} ${response.statusText}`);
        return false;
      }

    } catch (error) {
      logger.warn(`❌ Token validation error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Get model configuration for .remcode file
   * @param initResult Model initialization result
   * @returns Model configuration object
   */
  static getModelConfiguration(initResult: ModelInitializationResult) {
    return {
      embeddingModel: initResult.modelId,
      embeddingModelName: initResult.modelName,
      embeddingDimension: initResult.embeddingDimension,
      modelHealthy: initResult.isHealthy,
      lastModelCheck: new Date().toISOString(),
      availableModels: initResult.availableModels || []
    };
  }
}
