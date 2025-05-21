/**
 * HuggingFace MCP Handler
 * 
 * Handles HuggingFace-related MCP requests, allowing AI assistants
 * to generate embeddings for code vectorization.
 */

import { Request, Response } from 'express';
import axios from 'axios';
import { getLogger } from '../../utils/logger';

const logger = getLogger('HuggingFace-MCP');

export interface HuggingFaceMCPOptions {
  token: string;
}

export class HuggingFaceMCPHandler {
  private options: HuggingFaceMCPOptions;
  private baseUrl = 'https://api-inference.huggingface.co/models';
  private initialized: boolean = false;

  constructor(options: HuggingFaceMCPOptions) {
    this.options = options;
  }

  async initialize(): Promise<void> {
    try {
      if (!this.options.token) {
        logger.warn('HuggingFace token not provided. HuggingFace MCP handler will not be fully functional.');
        return;
      }

      this.initialized = true;
      logger.info('HuggingFace MCP handler initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize HuggingFace MCP handler: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
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

  private async getEmbeddings(text: string, model: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${model}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${this.options.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Different models return embeddings in different formats
      // GraphCodeBERT and CodeBERT typically return a list of embeddings
      if (Array.isArray(response.data) && response.data.length > 0) {
        // For models that return an array of arrays (sequence of token embeddings)
        // We'll average them to get a single vector
        if (Array.isArray(response.data[0])) {
          const dim = response.data[0].length;
          const avg = new Array(dim).fill(0);
          
          for (let i = 0; i < response.data.length; i++) {
            for (let j = 0; j < dim; j++) {
              avg[j] += response.data[i][j];
            }
          }
          
          for (let j = 0; j < dim; j++) {
            avg[j] /= response.data.length;
          }
          
          return avg;
        }
        
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

  private async handleEmbedCode(req: Request, res: Response, params?: any): Promise<void> {
    const requestParams = params || req.body;
    const { code, model = 'microsoft/graphcodebert-base', batch = false } = requestParams;

    if (!code) {
      res.status(400).json({ error: 'Code content is required' });
      return;
    }

    try {
      if (batch && Array.isArray(code)) {
        // Handle batch embedding
        const embeddings = [];
        for (const codeItem of code) {
          const embedding = await this.getEmbeddings(codeItem, model);
          embeddings.push(embedding);
        }
        res.status(200).json({ embeddings });
      } else {
        // Handle single embedding
        const embedding = await this.getEmbeddings(code, model);
        res.status(200).json({ embedding });
      }
    } catch (error) {
      logger.error(`Error embedding code: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleEmbedQuery(req: Request, res: Response, params?: any): Promise<void> {
    const requestParams = params || req.body;
    const { query, model = 'microsoft/graphcodebert-base' } = requestParams;

    if (!query) {
      res.status(400).json({ error: 'Query text is required' });
      return;
    }

    try {
      const embedding = await this.getEmbeddings(query, model);
      res.status(200).json({ embedding });
    } catch (error) {
      logger.error(`Error embedding query: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleListModels(req: Request, res: Response): Promise<void> {
    try {
      // In a full implementation, we might fetch the list from HuggingFace API
      // For now, we'll return a curated list of code embedding models
      res.status(200).json({
        models: [
          {
            id: 'microsoft/graphcodebert-base',
            name: 'GraphCodeBERT',
            description: 'A pre-trained model for programming language that considers the inherent structure of code',
            embedding_dimension: 768,
            is_recommended: true
          },
          {
            id: 'microsoft/codebert-base',
            name: 'CodeBERT',
            description: 'A bimodal pre-trained model for programming language and natural language',
            embedding_dimension: 768,
            is_recommended: false
          },
          {
            id: 'codistai/codist-7b-code-embedding',
            name: 'Codist Code Embedding',
            description: 'A code-specific embedding model for semantic code search',
            embedding_dimension: 1024,
            is_recommended: false
          }
        ]
      });
    } catch (error) {
      logger.error(`Error listing models: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}