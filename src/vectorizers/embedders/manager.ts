import { getLogger } from '../../utils/logger';
import axios from 'axios';
import { HfInference } from '@huggingface/inference';
import * as dotenv from 'dotenv';
import { CodeChunk, EmbeddingManagerOptions } from '../types';

// Load environment variables
dotenv.config();

const logger = getLogger('EmbeddingManager');

interface ModelInfo {
  id: string;
  name: string;
  embeddingDimension: number;
  strategy: 'code' | 'text';
  apiType: 'feature_extraction' | 'sentence_similarity';
}

// Working embedding models available on HuggingFace Inference API (Free Tier Compatible)
const EMBEDDING_MODELS: Record<string, ModelInfo> = {
  // Primary code-specific model (Inference API compatible)
  'microsoft/codebert-base': {
    id: 'microsoft/codebert-base',
    name: 'CodeBERT-Base',
    embeddingDimension: 768,
    strategy: 'code',
    apiType: 'feature_extraction'
  },
  // High-quality general embedding model (works well with code)
  'BAAI/bge-base-en-v1.5': {
    id: 'BAAI/bge-base-en-v1.5',
    name: 'BGE-Base',
    embeddingDimension: 768,
    strategy: 'text',
    apiType: 'feature_extraction'
  },
  // Lightweight fallback model
  'sentence-transformers/all-MiniLM-L12-v2': {
    id: 'sentence-transformers/all-MiniLM-L12-v2',
    name: 'MiniLM-L12',
    embeddingDimension: 384,
    strategy: 'text',
    apiType: 'feature_extraction'
  },
  // Small BGE model for rate-limited scenarios
  'BAAI/bge-small-en-v1.5': {
    id: 'BAAI/bge-small-en-v1.5',
    name: 'BGE-Small',
    embeddingDimension: 384,
    strategy: 'text',
    apiType: 'feature_extraction'
  }
};

// Updated model hierarchy: CodeBERT -> BGE-Base -> MiniLM -> BGE-Small
const DEFAULT_MODEL = EMBEDDING_MODELS['microsoft/codebert-base'];
const FALLBACK_MODEL = EMBEDDING_MODELS['BAAI/bge-base-en-v1.5'];
const LIGHTWEIGHT_MODEL = EMBEDDING_MODELS['sentence-transformers/all-MiniLM-L12-v2'];

export class EmbeddingManager {
  private options: EmbeddingManagerOptions;
  private hfClient: HfInference | null = null;
  private apiBaseUrl = 'https://api-inference.huggingface.co/models';
  private healthCheckedModels: Set<string> = new Set();

  constructor(options: EmbeddingManagerOptions) {
    this.options = {
      ...options,
      token: options.token || process.env.HUGGINGFACE_TOKEN,
      dimension: options.dimension || DEFAULT_MODEL.embeddingDimension
    };
    
    // Initialize HuggingFace client if token is available
    if (this.options.token) {
      this.hfClient = new HfInference(this.options.token);
    } else {
      logger.warn('No HuggingFace token provided. Embeddings will not be generated.');
    }
  }

  /**
   * Initialize and validate the embedding model
   * Tests the primary model and falls back to alternatives if needed
   * @returns The initialized model ID and configuration
   */
  async initializeModel(): Promise<{ modelId: string; modelInfo: ModelInfo; isHealthy: boolean }> {
    if (!this.options.token) {
      logger.error('No HuggingFace token available for model initialization');
      throw new Error('HuggingFace token is required for model initialization');
    }

    const modelsToTry = [
      this.options.primary || DEFAULT_MODEL.id,
      FALLBACK_MODEL.id,
      LIGHTWEIGHT_MODEL.id,
      'BAAI/bge-small-en-v1.5'
    ].filter((id, index, array) => array.indexOf(id) === index); // Remove duplicates

    logger.info(`🔧 Initializing embedding model. Testing models: ${modelsToTry.join(', ')}`);

    for (const modelId of modelsToTry) {
      try {
        logger.debug(`Testing model: ${modelId}`);
        const isHealthy = await this.checkModelHealth(modelId);
        
        if (isHealthy) {
          const modelInfo = EMBEDDING_MODELS[modelId] || DEFAULT_MODEL;
          logger.info(`✅ Model initialized successfully: ${modelInfo.name} (${modelId})`);
          
          // Update options with working model
          this.options.primary = modelId;
          this.options.dimension = modelInfo.embeddingDimension;
          
          return { modelId, modelInfo, isHealthy: true };
        }
      } catch (error) {
        logger.warn(`❌ Model ${modelId} failed health check: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
    }

    // If all models fail, return the primary model anyway but mark as unhealthy
    const fallbackModelId = this.options.primary || DEFAULT_MODEL.id;
    const fallbackModelInfo = EMBEDDING_MODELS[fallbackModelId] || DEFAULT_MODEL;
    logger.error(`🚨 All models failed health checks. Using ${fallbackModelId} as fallback.`);
    
    return { 
      modelId: fallbackModelId, 
      modelInfo: fallbackModelInfo, 
      isHealthy: false 
    };
  }

  /**
   * Check if a model is healthy and available via Inference API
   * @param modelId The model ID to check
   * @returns True if the model is available and working
   */
  async checkModelHealth(modelId: string): Promise<boolean> {
    if (this.healthCheckedModels.has(modelId)) {
      return true; // Already verified this session
    }

    try {
      // Use a simple test input for health check
      const testInput = "function test() { return 'hello world'; }";
      const embedding = await this.getEmbeddingFromModel(testInput, modelId);
      
      if (embedding && embedding.length > 0) {
        this.healthCheckedModels.add(modelId);
        logger.debug(`✅ Model health check passed: ${modelId} (dimension: ${embedding.length})`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.debug(`❌ Model health check failed: ${modelId} - ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Get available models with their health status
   * @returns Array of available models with health information
   */
  async getAvailableModelsWithHealth(): Promise<Array<ModelInfo & { isHealthy: boolean }>> {
    const results = [];
    
    for (const [modelId, modelInfo] of Object.entries(EMBEDDING_MODELS)) {
      try {
        const isHealthy = await this.checkModelHealth(modelId);
        results.push({ ...modelInfo, isHealthy });
      } catch (error) {
        results.push({ ...modelInfo, isHealthy: false });
      }
    }
    
    return results;
  }

  /**
   * Embeds code chunks using the specified model
   * @param chunks Array of code chunks to embed
   * @returns The chunks with embeddings added
   */
  async embedChunks(chunks: CodeChunk[]): Promise<CodeChunk[]> {
    if (chunks.length === 0) {
      return [];
    }

    // Ensure we have a working model before processing
    if (!this.healthCheckedModels.has(this.options.primary)) {
      logger.info('🔧 Initializing embedding model for chunk processing...');
      await this.initializeModel();
    }

    logger.info(`📊 Embedding ${chunks.length} chunks with ${this.options.primary} (${this.getModelInfo().name})`);
    
    if (!this.options.token) {
      logger.warn('No HuggingFace token available. Returning random embeddings as fallback.');
      return this.generateRandomEmbeddings(chunks);
    }
    
    try {
      // Process chunks sequentially to avoid rate limits
      const result: CodeChunk[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        logger.debug(`Processing chunk ${i + 1}/${chunks.length}`);
        
        try {
          const embeddedChunk = await this.embedSingleChunk(chunk);
          result.push(embeddedChunk);
        } catch (error) {
          logger.error(`Error embedding chunk ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
          // Try fallback for this specific chunk
          const fallbackChunk = await this.embedSingleChunkWithFallback(chunk);
          result.push(fallbackChunk);
        }
        
        // Small delay between chunks to respect rate limits
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Error embedding chunks: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return random embeddings as last resort
      logger.warn('Falling back to random embeddings');
      return this.generateRandomEmbeddings(chunks);
    }
  }

  /**
   * Embeds a single code chunk
   */
  private async embedSingleChunk(chunk: CodeChunk): Promise<CodeChunk> {
    const embedding = await this.getEmbeddingFromModel(chunk.content, this.options.primary);
    return {
      ...chunk,
      embedding
    };
  }

  /**
   * Embeds a single chunk with fallback strategy
   */
  private async embedSingleChunkWithFallback(chunk: CodeChunk): Promise<CodeChunk> {
    try {
      // Try fallback model
      if (this.options.fallback && this.options.fallback !== this.options.primary) {
        logger.debug(`Trying fallback model for chunk: ${this.options.fallback}`);
        const embedding = await this.getEmbeddingFromModel(chunk.content, this.options.fallback);
        return { ...chunk, embedding };
      }
    } catch (fallbackError) {
      logger.warn(`Fallback model also failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
    }
    
    // Generate random embedding as final fallback
    const dimension = this.getDimensionForModel(this.options.primary);
    const embedding = new Array(dimension).fill(0).map(() => Math.random() * 2 - 1);
    logger.debug('Using random embedding for chunk');
    return { ...chunk, embedding };
  }

  /**
   * Gets an embedding from the HuggingFace model
   */
  private async getEmbeddingFromModel(text: string, modelId: string): Promise<number[]> {
    // Preprocess text for better embedding quality
    const processedText = this.preprocessText(text);
    
    // Get model info to determine API type
    const modelInfo = EMBEDDING_MODELS[modelId] || DEFAULT_MODEL;
    
    // Use direct API call for better control
    return await this.getEmbeddingViaDirectAPI(processedText, modelId, modelInfo);
  }

  /**
   * Get embedding via direct API call
   */
  private async getEmbeddingViaDirectAPI(text: string, modelId: string, modelInfo: ModelInfo, retries = 2): Promise<number[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Different API formats for different model types
        let requestBody: any;
        let apiUrl: string;
        
        if (modelId.includes('sentence-transformers')) {
          // For sentence transformers, use the correct format
          requestBody = { 
            inputs: [text], // Array format for sentence transformers
            options: { wait_for_model: true }
          };
          apiUrl = `${this.apiBaseUrl}/${modelId}`;
        } else if (modelId.includes('graphcodebert') || modelId.includes('codebert')) {
          // For code models, use feature extraction
          requestBody = { 
            inputs: text,
            options: { wait_for_model: true }
          };
          apiUrl = `https://api-inference.huggingface.co/pipeline/feature-extraction/${modelId}`;
        } else {
          // Default format
          requestBody = { 
            inputs: text,
            options: { wait_for_model: true }
          };
          apiUrl = `${this.apiBaseUrl}/${modelId}`;
        }
        
        const response = await axios.post(
          apiUrl,
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${this.options.token}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );
        
        return this.processEmbeddingResult(response.data, modelInfo);
      } catch (error) {
        if (attempt === retries) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (axios.isAxiosError(error) && error.response) {
            logger.error(`API Error ${error.response.status} for ${modelId}: ${JSON.stringify(error.response.data)}`);
          } else {
            logger.error(`Final attempt failed for ${modelId}: ${errorMessage}`);
          }
          throw new Error(`Failed to get embeddings after ${retries} attempts: ${errorMessage}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        logger.debug(`Retrying ${modelId} (attempt ${attempt + 1}/${retries})`);
      }
    }
    
    throw new Error('All embedding attempts failed');
  }

  /**
   * Process embedding result from API based on model type
   */
  private processEmbeddingResult(result: any, modelInfo: ModelInfo): number[] {
    // BGE models return direct array of numbers - perfect!
    if (Array.isArray(result) && typeof result[0] === 'number') {
      return result as number[];
    }
    
    // Handle array of token embeddings (average them)
    if (Array.isArray(result) && Array.isArray(result[0]) && typeof result[0][0] === 'number') {
      return this.averageEmbeddings(result as number[][]);
    }
    
    // Handle object responses
    if (typeof result === 'object' && result.embedding) {
      return result.embedding;
    }
    
    // Default: try to extract first array
    if (Array.isArray(result) && result.length > 0) {
      return Array.isArray(result[0]) ? result[0] : result;
    }
    
    throw new Error(`Unexpected embedding result format for ${modelInfo.name}: ${JSON.stringify(result).substring(0, 200)}...`);
  }

  /**
   * Preprocess text for better embedding quality
   */
  private preprocessText(text: string): string {
    // Remove excessive whitespace but preserve code structure
    let processed = text.replace(/\s+/g, ' ').trim();
    
    // Limit length to avoid API limits (CodeBERT works well with 512 tokens)
    if (processed.length > 400) {
      processed = processed.substring(0, 400);
    }
    
    return processed;
  }

  /**
   * Get dimension for a specific model
   */
  private getDimensionForModel(modelId: string): number {
    return EMBEDDING_MODELS[modelId]?.embeddingDimension || this.options.dimension || DEFAULT_MODEL.embeddingDimension;
  }

  /**
   * Averages token embeddings to get a single vector
   */
  private averageEmbeddings(embeddings: number[][]): number[] {
    if (embeddings.length === 0) {
      throw new Error('Cannot average empty embeddings array');
    }
    
    const dim = embeddings[0].length;
    const avg = new Array(dim).fill(0);
    
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = 0; j < dim; j++) {
        avg[j] += embeddings[i][j];
      }
    }
    
    for (let j = 0; j < dim; j++) {
      avg[j] /= embeddings.length;
    }
    
    return avg;
  }

  /**
   * Generates random embeddings as a fallback
   */
  private generateRandomEmbeddings(chunks: CodeChunk[]): CodeChunk[] {
    const dimension = this.getDimensionForModel(this.options.primary);
    
    return chunks.map(chunk => ({
      ...chunk,
      embedding: new Array(dimension).fill(0).map(() => Math.random() * 2 - 1)
    }));
  }

  /**
   * Get model information
   */
  getModelInfo(modelId?: string): ModelInfo {
    return EMBEDDING_MODELS[modelId || this.options.primary] || DEFAULT_MODEL;
  }

  /**
   * List available models
   */
  getAvailableModels(): ModelInfo[] {
    return Object.values(EMBEDDING_MODELS);
  }
}
