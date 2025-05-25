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
import { SetupMCPHandler } from './handlers/setup';
import { SearchMCPHandler } from './handlers/search';
import { ProcessingMCPHandler } from './handlers/processing';
import { RepositoryMCPHandler } from './handlers/repository';
import { RemcodeMCPHandler } from './handlers/remcode';
// import { SWEGuidanceMiddleware } from "./swe-guidance-middleware"; // Temporarily disabled
import { getLogger } from '../utils/logger';
import { SimpleValidator } from './validation/simple-validator';
import { SSEHandler } from './sse/sse-handler';

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
  public options: MCPServerOptions;
  private pineconeHandler: PineconeMCPHandler;
  private githubHandler: GitHubMCPHandler;
  private huggingfaceHandler: HuggingFaceMCPHandler;
  private setupHandler: SetupMCPHandler;
  private searchHandler: SearchMCPHandler;
  private processingHandler: ProcessingMCPHandler;
  private repositoryHandler: RepositoryMCPHandler;
  private remcodeHandler: RemcodeMCPHandler;
  private sseHandler: SSEHandler;
  // sweGuidanceMiddleware: SWEGuidanceMiddleware; // Temporarily disabled

  constructor(options: MCPServerOptions = {}) {
    this.app = express();
    this.port = options.port || (process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3000);
    this.host = options.host || process.env.MCP_HOST || 'localhost';
    this.options = {
      pineconeApiKey: options.pineconeApiKey || process.env.PINECONE_API_KEY || '',
      githubToken: options.githubToken || process.env.GITHUB_TOKEN || '',
      huggingfaceToken: options.huggingfaceToken || process.env.HUGGINGFACE_TOKEN || '',
      corsOrigins: options.corsOrigins || process.env.MCP_CORS_ORIGINS || '*'
    };
    
    // Initialize handlers
    this.pineconeHandler = new PineconeMCPHandler({
      apiKey: this.options.pineconeApiKey || ''
    });
    
    this.githubHandler = new GitHubMCPHandler({
      token: this.options.githubToken || ''
    });
    
    this.huggingfaceHandler = new HuggingFaceMCPHandler({
      token: this.options.huggingfaceToken || ''
    });

    // Initialize new handlers with GitHub token for authorization
    this.setupHandler = new SetupMCPHandler(this.options.githubToken);
    this.searchHandler = new SearchMCPHandler();
    this.processingHandler = new ProcessingMCPHandler(this.options.githubToken);
    this.repositoryHandler = new RepositoryMCPHandler(this.options.githubToken || '');
    this.remcodeHandler = new RemcodeMCPHandler();
    this.sseHandler = new SSEHandler();
    // this.sweGuidanceMiddleware = new SWEGuidanceMiddleware(...); // Temporarily disabled
    
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
    
    // ====================
    // 🚀 SSE ENDPOINTS - NEW!
    // ====================
    
    // SSE connection initialization
    this.app.get('/sse/connect', (req, res) => {
      const connectionId = this.sseHandler.initializeConnection(req, res);
      logger.info(`SSE connection established: ${connectionId}`);
    });
    
    // SSE health check
    this.app.get('/sse/health', (req, res) => {
      this.sseHandler.handleHealthCheck(req, res);
    });
    
    // SSE tool list
    this.app.get('/sse/tools', (req, res) => {
      this.sseHandler.handleToolList(req, res);
    });
    
    // SSE MCP tool execution
    this.app.post('/sse/mcp', async (req, res) => {
      const toolHandlers = {
        pinecone: this.pineconeHandler,
        github: this.githubHandler,
        huggingface: this.huggingfaceHandler,
        setup: this.setupHandler,
        search: this.searchHandler,
        processing: this.processingHandler,
        repository: this.repositoryHandler,
        remcode: this.remcodeHandler
      };
      
      await this.sseHandler.handleMCPToolRequest(req, res, toolHandlers);
    });
    
    // MCP Specification endpoint (simplified route)
    this.app.get('/mcp/spec', (req, res) => {
      res.status(200).json({
        name: 'remcode-mcp',
        version: '0.1.0',
        description: 'Remcode Model Context Protocol server for code analysis and vectorization with SSE support',
        tools: [
          {
            name: 'setup-repository',
            description: 'Set up a repository with Remcode',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              token: { type: 'string', description: 'GitHub token (optional)' },
              branch: { type: 'string', description: 'Repository branch (default: main)' },
              configOverrides: { type: 'object', description: 'Remcode config overrides' },
              workflowType: { type: 'string', description: 'Type of workflow to generate: basic, scheduled, advanced, all' },
              skipWorkflows: { type: 'boolean', description: 'Skip workflow generation' },
              skipSecrets: { type: 'boolean', description: 'Skip secrets setup' },
              confirm: { type: 'boolean', description: 'Confirm setup' }
            }
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
            name: 'pinecone_query',
            description: 'Search for vectors in Pinecone',
            parameters: {
              text: { type: 'string', description: 'Search text to convert to embedding' },
              topK: { type: 'number', description: 'Number of results to return', optional: true }
            }
          }
        ]
      });
    });
    
    // Main MCP endpoint with ONE-SHOT VALIDATION for ALL tools
    this.app.post('/mcp', async (req, res) => {
      const { tool } = req.body;
      
      try {
        // 🛡️ ONE-SHOT PERMISSION VALIDATION FOR ALL MCP TOOLS
        logger.info(`🔍 Validating permissions for MCP tool: ${tool}`);
        const validation = await SimpleValidator.validateQuick();
        
        if (!validation.allValid) {
          logger.warn(`❌ Permission validation failed for tool: ${tool}`);
          return res.status(400).json({
            status: 'setup_required',
            tool: tool,
            message: 'Missing required API tokens',
            validation: {
              github: validation.github,
              huggingface: validation.huggingface,
              pinecone: validation.pinecone
            },
            setupUrls: validation.setupUrls,
            instructions: [
              '1. Create required API tokens using the URLs above',
              '2. Add tokens to your .env file',
              '3. Restart the MCP server',
              '4. Try again'
            ]
          });
        }
        
        logger.info(`✅ All API tokens validated for tool: ${tool}`);
        
        // Route to appropriate handler AFTER validation passes
        if (tool && tool.startsWith('pinecone_')) {
          return this.pineconeHandler.handleToolRequest(req, res);
        } else if (tool && tool.startsWith('github_')) {
          return this.githubHandler.handleToolRequest(req, res);
        } else if (tool && tool.startsWith('huggingface_')) {
          return this.huggingfaceHandler.handleToolRequest(req, res);
        } else if (tool === 'setup-repository') {
          return this.setupHandler.handleSetupRepository(req, res, req.body.parameters);
        }
        
        res.status(400).json({ error: 'Unknown tool type' });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`MCP validation error: ${errorMessage}`);
        res.status(500).json({ 
          error: 'Validation failed', 
          message: errorMessage 
        });
      }
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
      await this.huggingfaceHandler.initialize();
      
      if (!this.options.githubToken) {
        logger.warn('GitHub token not provided. GitHub-related functionality will be limited.');
      }
      
      this.app.listen(this.port, this.host, () => {
        logger.info(`MCP Server listening at http://${this.host}:${this.port}`);
        logger.info(`🚀 SSE endpoints available at:`);
        logger.info(`   - SSE Connection: http://${this.host}:${this.port}/sse/connect`);
        logger.info(`   - SSE Health: http://${this.host}:${this.port}/sse/health`);
        logger.info(`   - SSE Tools: http://${this.host}:${this.port}/sse/tools`);
        logger.info(`   - SSE MCP: http://${this.host}:${this.port}/sse/mcp`);
      });
    } catch (error) {
      logger.error(`Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  private validateApiKeys(): void {
    logger.info(`MCP Server configured with:
      - Pinecone API Key: ${this.options.pineconeApiKey ? '✓ Provided' : '✗ Missing'}
      - GitHub Token: ${this.options.githubToken ? '✓ Provided' : '✗ Missing'}
      - HuggingFace Token: ${this.options.huggingfaceToken ? '✓ Provided' : '✗ Missing'}
    `);
  }

  public stop(): void {
    // Close all SSE connections before stopping
    this.sseHandler.closeAllConnections();
    logger.info('MCP Server stopped');
  }
}
