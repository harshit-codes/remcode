/**
 * HuggingFace MCP Handler
 * 
 * Handles HuggingFace-related MCP requests, allowing AI assistants
 * to generate embeddings for code vectorization.
 * 
 * Fixed: Uses correct HuggingFace Inference API with working models
 */

import { Request, Response } from 'express';
import axios from 'axios';
import { getLogger } from '../../utils/logger';

const logger = getLogger('HuggingFace-MCP');

export interface HuggingFaceMCPOptions {
  token: string;
}

interface ModelInfo {
  id: string;
  name: string;
  embeddingDimension: number;
  strategy: 'code' | 'text';
  apiType: 'feature_extraction';
}

// Working embedding models confirmed from HuggingFace Inference API documentation
const EMBEDDING_MODELS: Record<string, ModelInfo> = {
  'intfloat/multilingual-e5-large-instruct': {
    id: 'intfloat/multilingual-e5-large-instruct',
    name: 'E5-Large-Instruct',
    embeddingDimension: 1024,
    strategy: 'text',
    apiType: 'feature_extraction'
  },
  'sentence-transformers/all-MiniLM-L6-v2': {
    id: 'sentence-transformers/all-MiniLM-L6-v2',
    name: 'MiniLM-L6-v2',
    embeddingDimension: 384,
    strategy: 'text',
    apiType: 'feature_extraction'
  },
  'sentence-transformers/all-mpnet-base-v2': {
    id: 'sentence-transformers/all-mpnet-base-v2',
    name: 'MPNet-Base',
    embeddingDimension: 768,
    strategy: 'text',
    apiType: 'feature_extraction'
  },
  'thenlper/gte-large': {
    id: 'thenlper/gte-large',
    name: 'GTE-Large',
    embeddingDimension: 1024,
    strategy: 'text',
    apiType: 'feature_extraction'
  }
};

// Model hierarchy: E5-Large -> MiniLM -> MPNet -> GTE
const DEFAULT_MODEL = EMBEDDING_MODELS['intfloat/multilingual-e5-large-instruct'];
const FALLBACK_MODELS = [
  'sentence-transformers/all-MiniLM-L6-v2',
  'sentence-transformers/all-mpnet-base-v2',
  'thenlper/gte-large'
];

export class HuggingFaceMCPHandler {
  private options: HuggingFaceMCPOptions;
  private baseUrl = 'https://api-inference.huggingface.co/models';
  private initialized: boolean = false;
  private workingModel: string = DEFAULT_MODEL.id;
  private healthCheckedModels: Set<string> = new Set();

  constructor(options: HuggingFaceMCPOptions) {
    this.options = options;
  }

  async initialize(): Promise<void> {
    try {
      if (!this.options.token) {
        logger.warn('HuggingFace token not provided. HuggingFace MCP handler will not be fully functional.');
        return;
      }

      // Test and find a working model
      await this.findWorkingModel();
      this.initialized = true;
      logger.info(`HuggingFace MCP handler initialized successfully with model: ${this.workingModel}`);
    } catch (error) {
      logger.error(`Failed to initialize HuggingFace MCP handler: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Find a working embedding model from our hierarchy
   */
  private async findWorkingModel(): Promise<void> {
    const modelsToTry = [DEFAULT_MODEL.id, ...FALLBACK_MODELS];
    
    for (const modelId of modelsToTry) {
      try {
        logger.debug(`Testing model: ${modelId}`);
        const isHealthy = await this.checkModelHealth(modelId);
        
        if (isHealthy) {
          this.workingModel = modelId;
          logger.info(`✅ Found working model: ${EMBEDDING_MODELS[modelId]?.name || modelId}`);
          return;
        }
      } catch (error) {
        logger.debug(`❌ Model ${modelId} failed: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
    }
    
    // Use default even if health check failed
    this.workingModel = DEFAULT_MODEL.id;
    logger.warn(`🚨 All models failed health checks. Using ${DEFAULT_MODEL.id} as fallback.`);
  }

  /**
   * Check if a model is healthy and available
   */
  private async checkModelHealth(modelId: string): Promise<boolean> {
    if (this.healthCheckedModels.has(modelId)) {
      return true;
    }

    try {
      const testInput = "function test() { return 'hello'; }";
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

  async handleRequest(req: Request, res: Response): Promise<void> {
    const action = req.params.action;
    
    try {
      if (!this.initialized) {
        res.status(500).json({ error: 'HuggingFace handler not initialized' });
        return;
      }

      switch (action) {
        case 'embed-code':
          await this.handleEmbedCode(req, res);
          break;
        case 'embed-query':
          await this.handleEmbedQuery(req, res);
          break;
        case 'list-models':
          await this.handleListModels(req, res);
          break;
        default:
          res.status(400).json({ error: `Unknown action: ${action}` });
      }
    } catch (error) {
      logger.error(`Error handling HuggingFace MCP request: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async handleToolRequest(req: Request, res: Response): Promise<void> {
    const { tool, parameters } = req.body;
    
    try {
      if (!this.initialized) {
        res.status(500).json({ error: 'HuggingFace handler not initialized' });
        return;
      }

      switch (tool) {
        case 'huggingface_embed_code':
          await this.handleEmbedCode(req, res, parameters);
          break;
        case 'huggingface_embed_query':
          await this.handleEmbedQuery(req, res, parameters);
          break;
        case 'huggingface_list_models':
          await this.handleListModels(req, res);
          break;
        default:
          res.status(400).json({ error: `Unknown tool: ${tool}` });
      }
    } catch (error) {
      logger.error(`Error handling HuggingFace tool request: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async getEmbeddings(text: string, model?: string): Promise<number[]> {
    const modelId = model || this.workingModel;
    return await this.getEmbeddingFromModel(text, modelId);
  }

  /**
   * Get embedding from model using correct HuggingFace Inference API format
   */
  private async getEmbeddingFromModel(text: string, modelId: string): Promise<number[]> {
    try {
      // Preprocess text
      const processedText = this.preprocessText(text);
      const modelInfo = EMBEDDING_MODELS[modelId] || DEFAULT_MODEL;
      
      // Use correct format for HuggingFace Inference API
      const requestBody = { 
        inputs: processedText,
        options: { 
          wait_for_model: true,
          use_cache: false
        }
      };
      
      // Use standard model API endpoint
      const apiUrl = `${this.baseUrl}/${modelId}`;
      
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
      logger.error(`Error generating embeddings with ${modelId}: ${error instanceof Error ? error.message : String(error)}`);
      if (axios.isAxiosError(error) && error.response) {
        logger.error(`API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Process embedding result from API
   */
  private processEmbeddingResult(result: any, modelInfo: ModelInfo): number[] {
    // Most models return direct array of numbers for single input
    if (Array.isArray(result) && typeof result[0] === 'number') {
      return result as number[];
    }
    
    // Handle nested arrays (some models return array of arrays)
    if (Array.isArray(result) && Array.isArray(result[0])) {
      // For single input, return the first embedding
      if (result.length === 1) {
        return result[0] as number[];
      }
      // For multiple tokens, average them
      return this.averageEmbeddings(result as number[][]);
    }
    
    // Handle object responses
    if (typeof result === 'object' && result.embedding) {
      return result.embedding;
    }
    
    throw new Error(`Unexpected embedding result format for ${modelInfo.name}: ${JSON.stringify(result).substring(0, 200)}...`);
  }

  /**
   * Preprocess text for better embedding quality
   */
  private preprocessText(text: string): string {
    let processed = text.replace(/\s+/g, ' ').trim();
    
    // Limit length to avoid API limits
    if (processed.length > 500) {
      processed = processed.substring(0, 500);
    }
    
    return processed;
  }

  /**
   * Average token embeddings to get a single vector
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

  private async handleEmbedCode(req: Request, res: Response, params?: any): Promise<void> {
    const requestParams = params || req.body;
    const { code, model, batch = false } = requestParams;

    if (!code) {
      res.status(400).json({ error: 'Code content is required' });
      return;
    }

    try {
      // Use working model or specified model
      const modelToUse = model || this.workingModel;
      
      if (batch && Array.isArray(code)) {
        // Handle batch embedding
        const embeddings = [];
        for (const codeItem of code) {
          const embedding = await this.getEmbeddings(codeItem, modelToUse);
          embeddings.push(embedding);
        }
        res.status(200).json({ embeddings });
      } else {
        // Handle single embedding
        const embedding = await this.getEmbeddings(code, modelToUse);
        res.status(200).json({ embedding });
      }
    } catch (error) {
      logger.error(`Error embedding code: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleEmbedQuery(req: Request, res: Response, params?: any): Promise<void> {
    const requestParams = params || req.body;
    const { query, model } = requestParams;

    if (!query) {
      res.status(400).json({ error: 'Query text is required' });
      return;
    }

    try {
      // Use working model or specified model
      const modelToUse = model || this.workingModel;
      const embedding = await this.getEmbeddings(query, modelToUse);
      res.status(200).json({ embedding });
    } catch (error) {
      logger.error(`Error embedding query: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleListModels(req: Request, res: Response): Promise<void> {
    try {
      // Return our curated list of working embedding models
      const models = Object.values(EMBEDDING_MODELS).map(model => ({
        id: model.id,
        name: model.name,
        description: `${model.strategy === 'code' ? 'Code-specific' : 'General-purpose'} embedding model`,
        embedding_dimension: model.embeddingDimension,
        is_recommended: model.id === DEFAULT_MODEL.id,
        is_working: this.healthCheckedModels.has(model.id),
        strategy: model.strategy
      }));

      res.status(200).json({ 
        models,
        current_working_model: this.workingModel,
        current_model_info: EMBEDDING_MODELS[this.workingModel] || DEFAULT_MODEL
      });
    } catch (error) {
      logger.error(`Error listing models: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
