/**
 * Pinecone MCP Handler
 * 
 * Handles Pinecone-related MCP requests, allowing AI assistants
 * to interact with vector embeddings stored in Pinecone.
 */

import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { PineconeStorage } from '../../vectorizers/storage/pinecone';

const logger = getLogger('Pinecone-MCP');

export interface PineconeMCPOptions {
  apiKey: string;
  environment: string;
}

export class PineconeMCPHandler {
  private pineconeStorage: PineconeStorage | null = null;
  private options: PineconeMCPOptions;

  constructor(options: PineconeMCPOptions) {
    this.options = options;
  }

  async initialize(): Promise<void> {
    try {
      if (!this.options.apiKey || !this.options.environment) {
        logger.warn('Pinecone API key or environment not provided. Pinecone MCP handler will not be fully functional.');
        return;
      }

      // Initialize Pinecone storage with the default index
      this.pineconeStorage = new PineconeStorage({
        apiKey: this.options.apiKey,
        environment: this.options.environment,
        indexName: 'remcode-default'
      });

      await this.pineconeStorage.initialize();
      logger.info('Pinecone MCP handler initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize Pinecone MCP handler: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async handleRequest(req: Request, res: Response): Promise<void> {
    const action = req.params.action;
    
    try {
      if (!this.pineconeStorage) {
        res.status(500).json({ error: 'Pinecone storage not initialized' });
        return;
      }

      switch (action) {
        case 'query':
          await this.handleQuery(req, res);
          break;
        case 'upsert':
          await this.handleUpsert(req, res);
          break;
        case 'delete':
          await this.handleDelete(req, res);
          break;
        case 'list-indexes':
          await this.handleListIndexes(req, res);
          break;
        default:
          res.status(400).json({ error: `Unknown action: ${action}` });
      }
    } catch (error) {
      logger.error(`Error handling Pinecone MCP request: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async handleToolRequest(req: Request, res: Response): Promise<void> {
    const { tool, parameters } = req.body;
    
    try {
      if (!this.pineconeStorage) {
        res.status(500).json({ error: 'Pinecone storage not initialized' });
        return;
      }

      switch (tool) {
        case 'pinecone_query':
          await this.handleQuery(req, res, parameters);
          break;
        case 'pinecone_upsert':
          await this.handleUpsert(req, res, parameters);
          break;
        case 'pinecone_delete':
          await this.handleDelete(req, res, parameters);
          break;
        case 'pinecone_list_indexes':
          await this.handleListIndexes(req, res);
          break;
        default:
          res.status(400).json({ error: `Unknown tool: ${tool}` });
      }
    } catch (error) {
      logger.error(`Error handling Pinecone tool request: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleQuery(req: Request, res: Response, params?: any): Promise<void> {
    const queryParams = params || req.body;
    const { text, topK = 10, filter, namespace = '' } = queryParams;

    if (!text) {
      res.status(400).json({ error: 'Query text is required' });
      return;
    }

    try {
      // This is a simplified version - in a real implementation, we would:
      // 1. Convert the text to embeddings using the same model as used for vectorization
      // 2. Query Pinecone with these embeddings
      // For now, we'll return a stub response
      res.status(200).json({
        matches: [
          {
            id: 'sample-id-1',
            score: 0.95,
            metadata: {
              file_path: 'src/example.ts',
              code_chunk: 'function example() { return "This is a sample result"; }',
              language: 'typescript'
            }
          },
          {
            id: 'sample-id-2',
            score: 0.85,
            metadata: {
              file_path: 'src/another.ts',
              code_chunk: 'class AnotherExample { constructor() { this.value = "Another sample"; } }',
              language: 'typescript'
            }
          }
        ]
      });
    } catch (error) {
      logger.error(`Error querying Pinecone: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleUpsert(req: Request, res: Response, params?: any): Promise<void> {
    const upsertParams = params || req.body;
    const { vectors, namespace = '' } = upsertParams;

    if (!vectors || !Array.isArray(vectors)) {
      res.status(400).json({ error: 'Vectors array is required' });
      return;
    }

    try {
      // In a real implementation, we would upsert the vectors to Pinecone
      // For now, we'll return a stub response
      res.status(200).json({ upsertedCount: vectors.length });
    } catch (error) {
      logger.error(`Error upserting to Pinecone: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleDelete(req: Request, res: Response, params?: any): Promise<void> {
    const deleteParams = params || req.body;
    const { ids, deleteAll = false, filter, namespace = '' } = deleteParams;

    if (!deleteAll && (!ids || !Array.isArray(ids))) {
      res.status(400).json({ error: 'Either ids array or deleteAll flag is required' });
      return;
    }

    try {
      // In a real implementation, we would delete the vectors from Pinecone
      // For now, we'll return a stub response
      res.status(200).json({ deletedCount: ids ? ids.length : 'all' });
    } catch (error) {
      logger.error(`Error deleting from Pinecone: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleListIndexes(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, we would list all available Pinecone indexes
      // For now, we'll return a stub response
      res.status(200).json({ 
        indexes: [
          { name: 'remcode-default', dimension: 768, metric: 'cosine', status: 'Ready' },
          { name: 'remcode-test', dimension: 768, metric: 'cosine', status: 'Ready' }
        ] 
      });
    } catch (error) {
      logger.error(`Error listing Pinecone indexes: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}