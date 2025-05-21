/**
 * MCP Server Module
 * 
 * This module provides Model Context Protocol (MCP) server functionality
 * to allow AI assistants to interact with the remcode tools.
 */

import express from 'express';
import cors from 'cors';
import { PineconeMCPHandler } from './handlers/pinecone';
import { GitHubMCPHandler } from './handlers/github';
import { HuggingFaceMCPHandler } from './handlers/huggingface';
import { getLogger } from '../utils/logger';

const logger = getLogger('MCP-Server');

export interface MCPServerOptions {
  port?: number;
  host?: string;
  pineconeApiKey?: string;
  githubToken?: string;
  huggingfaceToken?: string;
  corsOrigins?: string;
}

export class MCPServer {
  private app: express.Application;
  private port: number;
  private host: string;
  private options: MCPServerOptions;
  private pineconeHandler: PineconeMCPHandler;
  private githubHandler: GitHubMCPHandler;
  private huggingfaceHandler: HuggingFaceMCPHandler;

  constructor(options: MCPServerOptions = {}) {
    this.app = express();
    this.port = options.port || process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3000;
    this.host = options.host || process.env.MCP_HOST || 'localhost';
    this.options = {
      pineconeApiKey: options.pineconeApiKey || process.env.PINECONE_API_KEY || '',
      githubToken: options.githubToken || process.env.GITHUB_TOKEN || '',
      huggingfaceToken: options.huggingfaceToken || process.env.HUGGINGFACE_TOKEN || '',
      corsOrigins: options.corsOrigins || process.env.MCP_CORS_ORIGINS || '*'
    };
    
    // Initialize handlers
    this.pineconeHandler = new PineconeMCPHandler({
      apiKey: this.options.pineconeApiKey
    });
    
    this.githubHandler = new GitHubMCPHandler({
      token: this.options.githubToken
    });
    
    this.huggingfaceHandler = new HuggingFaceMCPHandler({
      token: this.options.huggingfaceToken
    });
    
    this.configureServer();
  }

  private configureServer(): void {
    // Configure middleware
    const corsOptions = {
      origin: this.options.corsOrigins?.split(',') || '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK' });
    });
    
    // MCP Specification endpoint
    this.app.get('/v1/mcp/spec', (req, res) => {
      res.status(200).json({
        name: 'remcode-mcp',
        version: '0.1.0',
        description: 'Remcode Model Context Protocol server for code analysis and vectorization',
        tools: [
          {
            name: 'github_get_repo',
            description: 'Get repository metadata from GitHub',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' }
            }
          },
          {
            name: 'github_list_files',
            description: 'List files in a GitHub repository',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              path: { type: 'string', description: 'Path within repository (optional)', optional: true }
            }
          },
          {
            name: 'github_get_file',
            description: 'Get a file from a GitHub repository',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              path: { type: 'string', description: 'File path within repository' }
            }
          },
          {
            name: 'github_search_code',
            description: 'Search code in a GitHub repository',
            parameters: {
              query: { type: 'string', description: 'Search query' },
              owner: { type: 'string', description: 'Repository owner (optional)', optional: true },
              repo: { type: 'string', description: 'Repository name (optional)', optional: true }
            }
          },
          {
            name: 'pinecone_query',
            description: 'Search for vectors in Pinecone',
            parameters: {
              text: { type: 'string', description: 'Search text to convert to embedding' },
              topK: { type: 'number', description: 'Number of results to return', optional: true }
            }
          },
          {
            name: 'pinecone_list_indexes',
            description: 'List available Pinecone indexes',
            parameters: {}
          },
          {
            name: 'huggingface_embed_code',
            description: 'Generate embeddings for code using HuggingFace models',
            parameters: {
              code: { type: 'string', description: 'Code content to embed' },
              model: { type: 'string', description: 'Model to use (default: microsoft/graphcodebert-base)', optional: true },
              batch: { type: 'boolean', description: 'Whether to process as batch (for array input)', optional: true }
            }
          },
          {
            name: 'huggingface_embed_query',
            description: 'Generate embeddings for a search query',
            parameters: {
              query: { type: 'string', description: 'Query text to embed' },
              model: { type: 'string', description: 'Model to use (default: microsoft/graphcodebert-base)', optional: true }
            }
          },
          {
            name: 'huggingface_list_models',
            description: 'List available code embedding models',
            parameters: {}
          }
        ]
      });
    });
    
    // Register MCP endpoints
    this.app.post('/v1/mcp/pinecone/:action', this.pineconeHandler.handleRequest.bind(this.pineconeHandler));
    this.app.post('/v1/mcp/github/:action', this.githubHandler.handleRequest.bind(this.githubHandler));
    this.app.post('/v1/mcp/huggingface/:action', this.huggingfaceHandler.handleRequest.bind(this.huggingfaceHandler));
    
    // Main MCP endpoint that routes to the appropriate handler
    this.app.post('/v1/mcp', (req, res) => {
      const { tool } = req.body;
      
      if (tool && tool.startsWith('pinecone_')) {
        return this.pineconeHandler.handleToolRequest(req, res);
      } else if (tool && tool.startsWith('github_')) {
        return this.githubHandler.handleToolRequest(req, res);
      } else if (tool && tool.startsWith('huggingface_')) {
        return this.huggingfaceHandler.handleToolRequest(req, res);
      }
      
      res.status(400).json({ error: 'Unknown tool type' });
    });
    
    // Error handler
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ error: err.message });
    });
  }

  public async start(): Promise<void> {
    try {
      // Validate required API keys
      this.validateApiKeys();
      
      // Initialize handlers
      await this.pineconeHandler.initialize();
      
      // Initialize HuggingFace handler
      await this.huggingfaceHandler.initialize();
      
      // Initialize GitHub handler (no async initialization needed)
      if (!this.options.githubToken) {
        logger.warn('GitHub token not provided. GitHub-related functionality will be limited.');
      }
      
      this.app.listen(this.port, this.host, () => {
        logger.info(`MCP Server listening at http://${this.host}:${this.port}`);
      });
    } catch (error) {
      logger.error(`Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  private validateApiKeys(): void {
    // Check Pinecone API Key
    if (!this.options.pineconeApiKey) {
      logger.warn('Pinecone API key not provided. Please set PINECONE_API_KEY environment variable or use --pinecone-key option.');
    }
    
    // Check GitHub Token
    if (!this.options.githubToken) {
      logger.warn('GitHub token not provided. Please set GITHUB_TOKEN environment variable or use --github-token option for GitHub functionality.');
    }
    
    // Check HuggingFace Token
    if (!this.options.huggingfaceToken) {
      logger.warn('HuggingFace token not provided. Please set HUGGINGFACE_TOKEN environment variable or use --huggingface-token option for embedding functionality.');
    }
    
    // Log MCP server configuration
    logger.info(`MCP Server configured with:
      - Pinecone API Key: ${this.options.pineconeApiKey ? '✓ Provided' : '✗ Missing'}
      - GitHub Token: ${this.options.githubToken ? '✓ Provided' : '✗ Missing'}
      - HuggingFace Token: ${this.options.huggingfaceToken ? '✓ Provided' : '✗ Missing'}
    `);
  }

  public stop(): void {
    // Cleanup logic if needed
    logger.info('MCP Server stopped');
  }
}