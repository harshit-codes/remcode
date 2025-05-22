import { getLogger } from '../../utils/logger';
import axios from 'axios';
import { HfInference } from '@huggingface/inference';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = getLogger('EmbeddingManager');

interface EmbeddingManagerOptions {
  primary: string; // Primary model to use for embeddings
  fallback: string; // Fallback model if primary fails
  batchSize: number; // Number of chunks to process in parallel
  token?: string; // HuggingFace API token
  dimension?: number; // Expected embedding dimension
}

interface CodeChunk {
  content: string; // The code content to embed
  metadata?: Record<string, any>; // Metadata about the chunk
  id?: string; // Optional ID for the chunk
  embedding?: number[]; // Will be populated with the embedding
}

interface ModelInfo {
  id: string;
  name: string;
  embeddingDimension: number;
}

// GraphCodeBERT model info
const DEFAULT_MODEL: ModelInfo = {
  id: 'microsoft/graphcodebert-base',
  name: 'GraphCodeBERT',
  embeddingDimension: 768
};

export class EmbeddingManager {
  private options: EmbeddingManagerOptions;
  private hfClient: HfInference | null = null;
  private apiBaseUrl = 'https://api-inference.huggingface.co/models';

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
   * Embeds code chunks using the specified model
   * @param chunks Array of code chunks to embed
   * @returns The chunks with embeddings added
   */
  async embedChunks(chunks: CodeChunk[]): Promise<CodeChunk[]> {
    if (chunks.length === 0) {
      return [];
    }

    logger.info(`Embedding ${chunks.length} chunks with ${this.options.primary}`);
    
    if (!this.options.token) {
      logger.warn('No HuggingFace token available. Returning random embeddings as fallback.');
      return this.generateRandomEmbeddings(chunks);
    }
    
    try {
      // Process chunks in batches to avoid overwhelming the API
      const batchSize = this.options.batchSize || 10;
      const result: CodeChunk[] = [];
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        logger.debug(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}`);
        
        // Process each chunk in the batch in parallel
        const embedPromises = batch.map(chunk => this.embedSingleChunk(chunk));
        const embeddedChunks = await Promise.all(embedPromises);
        
        result.push(...embeddedChunks);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error embedding chunks with ${this.options.primary}: ${error instanceof Error ? error.message : String(error)}`);
      
      // Try fallback model if primary fails
      if (this.options.fallback && this.options.fallback !== this.options.primary) {
        logger.info(`Trying fallback model: ${this.options.fallback}`);
        try {
          return await this.embedWithModel(chunks, this.options.fallback);
        } catch (fallbackError) {
          logger.error(`Fallback model failed too: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
        }
      }
      
      // Return random embeddings as last resort
      logger.warn('Falling back to random embeddings');
      return this.generateRandomEmbeddings(chunks);
    }
  }

  /**
   * Embeds a single code chunk
   */
  private async embedSingleChunk(chunk: CodeChunk): Promise<CodeChunk> {
    try {
      const embedding = await this.getEmbeddingFromModel(chunk.content, this.options.primary);
      return {
        ...chunk,
        embedding
      };
    } catch (error) {
      logger.error(`Error embedding chunk: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Embeds chunks using a specific model
   */
  private async embedWithModel(chunks: CodeChunk[], modelId: string): Promise<CodeChunk[]> {
    const batchSize = this.options.batchSize || 10;
    const result: CodeChunk[] = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const embedPromises = batch.map(async chunk => {
        const embedding = await this.getEmbeddingFromModel(chunk.content, modelId);
        return {
          ...chunk,
          embedding
        };
      });
      
      const embeddedChunks = await Promise.all(embedPromises);
      result.push(...embeddedChunks);
    }
    
    return result;
  }

  /**
   * Gets an embedding from the HuggingFace model
   */
  private async getEmbeddingFromModel(text: string, modelId: string): Promise<number[]> {
    if (this.hfClient) {
      try {
        // Try using the HuggingFace Inference client first
        const result = await this.hfClient.featureExtraction({
          model: modelId,
          inputs: text
        });
        
        // Handle different response formats based on HF API
        // The result could be a number, number[], or number[][]        
        if (typeof result === 'number') {
          // Single number (unlikely but handle it)
          return [result];
        } else if (Array.isArray(result)) {
          // Check if we got a flat array of numbers
          if (typeof result[0] === 'number') {
            return result as number[];
          }
          // If we got a nested array of arrays, average them
          else if (Array.isArray(result[0])) {
            return this.averageEmbeddings(result as number[][]);
          }
        }
        
        // If we couldn't handle the result format, throw an error
        logger.error(`Unexpected result format from HF API: ${JSON.stringify(result).substring(0, 100)}...`);
        throw new Error(`Unexpected response format from HuggingFace Inference client`);
      } catch (error) {
        // If client method fails, fall back to direct API call
        logger.warn(`HuggingFace client failed, falling back to direct API call: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Fall back to direct API call
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/${modelId}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${this.options.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        // For models that return an array of arrays (sequence of token embeddings)
        if (Array.isArray(response.data[0])) {
          return this.averageEmbeddings(response.data);
        }
        
        // For models that return a single array
        return response.data;
      }
      
      // Some models might return embeddings in a different format
      if (response.data && response.data.embeddings) {
        return response.data.embeddings;
      }
      
      throw new Error('Unexpected response format from HuggingFace API');
    } catch (error) {
      logger.error(`Error generating embeddings: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Averages token embeddings to get a single vector
   */
  private averageEmbeddings(embeddings: number[][]): number[] {
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
    const dimension = this.options.dimension || DEFAULT_MODEL.embeddingDimension;
    
    return chunks.map(chunk => ({
      ...chunk,
      embedding: new Array(dimension).fill(0).map(() => Math.random() * 2 - 1) // Random values between -1 and 1
    }));
  }
}
