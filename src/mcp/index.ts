import express from 'express';
import cors from 'cors';
import { getLogger } from '../utils/logger';

// MCP Handlers
import { PineconeMCPHandler } from './handlers/pinecone';
import { GitHubMCPHandler } from './handlers/github';
import { HuggingFaceMCPHandler } from './handlers/huggingface';
import { SetupMCPHandler } from './handlers/setup';
import { SearchMCPHandler } from './handlers/search';
import { ProcessingMCPHandler } from './handlers/processing';
import { RepositoryMCPHandler } from './handlers/repository';
import { RemcodeMCPHandler } from './handlers/remcode';
// SWE guidance middleware not implemented yet
import { SimpleValidator } from './validation/simple-validator';
import { MCPSSEHandler } from './sse/mcp-sse-handler';

const logger = getLogger('MCPServer');

export interface MCPServerOptions {
  port?: number;
  host?: string;
  corsOptions?: cors.CorsOptions;
}

/**
 * MCP Server Module
 * 
 * This module provides Model Context Protocol (MCP) server functionality
 * to allow AI assistants to interact with the remcode tools.
 */
export class MCPServer {
  private app: express.Application;
  private server?: any;
  private mcpSSEHandler: MCPSSEHandler;

  // Tool Handlers
  private pineconeHandler: PineconeMCPHandler;
  private githubHandler: GitHubMCPHandler;
  private huggingfaceHandler: HuggingFaceMCPHandler;
  private setupHandler: SetupMCPHandler;
  private searchHandler: SearchMCPHandler;
  private processingHandler: ProcessingMCPHandler;
  private repositoryHandler: RepositoryMCPHandler;
  private remcodeHandler: RemcodeMCPHandler;

  constructor(options: MCPServerOptions = {}) {
    this.app = express();
    
    // Initialize SSE Handler with complete tool definitions
    this.mcpSSEHandler = new MCPSSEHandler(this.getMCPToolSpecs());
    
    // Initialize handlers with proper tokens
    const githubToken = process.env.GITHUB_TOKEN;
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const huggingfaceToken = process.env.HUGGINGFACE_TOKEN;
    
    this.pineconeHandler = new PineconeMCPHandler({ apiKey: pineconeApiKey || '' });
    this.githubHandler = new GitHubMCPHandler({ token: githubToken || '' });
    this.huggingfaceHandler = new HuggingFaceMCPHandler({ token: huggingfaceToken || '' });
    this.setupHandler = new SetupMCPHandler(githubToken);
    this.searchHandler = new SearchMCPHandler();
    this.processingHandler = new ProcessingMCPHandler(githubToken);
    this.repositoryHandler = new RepositoryMCPHandler(githubToken || '');
    this.remcodeHandler = new RemcodeMCPHandler();

    this.setupMiddleware(options);
    this.setupRoutes();
    
    logger.info('MCP Server initialized with universal validation');
  }

  private setupMiddleware(options: MCPServerOptions) {
    // CORS configuration
    const corsOptions: cors.CorsOptions = {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      ...options.corsOptions
    };
    
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.text());
    
    // SWE Guidance Middleware (placeholder)
    // this.app.use(sweGuidanceMiddleware);
    
    logger.debug('Middleware configured');
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '0.1.8',
        services: ['pinecone', 'github', 'huggingface', 'setup', 'search', 'processing']
      });
    });

    // MCP specification endpoint
    this.app.get('/mcp/spec', (req, res) => {
      res.json({
        tools: this.getMCPToolSpecs(),
        version: '0.1.8',
        protocol: 'MCP',
        transport: 'SSE'
      });
    });

    // SSE endpoint for MCP Inspector
    this.app.get('/sse', (req, res) => {
      this.mcpSSEHandler.handleSSEConnection(req, res);
    });

    // JSON-RPC 2.0 messages endpoint for MCP Inspector
    this.app.post('/messages', async (req, res) => {
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
      await this.mcpSSEHandler.handleMCPMessage(req, res, toolHandlers);
    });

    // Universal MCP tool router with validation guard
    this.app.post('/mcp/:tool', async (req, res, next) => {
      const tool = req.params.tool;
      
      try {
        // Universal validation for ALL MCP tools
        const validation = await SimpleValidator.validateQuick();
        if (!validation.allValid) {
          const errorMessage = `Missing required services. Configure: ${!validation.github.valid ? 'GitHub token, ' : ''}${!validation.huggingface.valid ? 'HuggingFace token, ' : ''}${!validation.pinecone.valid ? 'Pinecone API key' : ''}`.replace(/, $/, '');
          
          res.status(400).json({
            error: 'Service Configuration Required',
            message: errorMessage,
            services: validation,
            instructions: [
              'Set GITHUB_TOKEN environment variable with your GitHub token',
              'Set HUGGINGFACE_TOKEN environment variable with your HuggingFace token', 
              'Set PINECONE_API_KEY environment variable with your Pinecone API key',
              'Restart the MCP server after setting environment variables'
            ]
          });
          return;
        }

        // Route to appropriate handler
        if (tool === 'pinecone_query' || tool === 'pinecone_upsert' || tool === 'pinecone_list_indexes') {
          return this.pineconeHandler.handleRequest(req, res);
        } else if (tool === 'github_get_repo' || tool === 'github_list_files' || tool === 'github_get_file') {
          return this.githubHandler.handleRequest(req, res);
        } else if (tool === 'huggingface_embed_code' || tool === 'huggingface_embed_query' || tool === 'huggingface_list_models') {
          return this.huggingfaceHandler.handleRequest(req, res);
        } else if (tool === 'setup-repository' || tool === 'check-prerequisites' || tool === 'configure-repository' || tool === 'setup-secrets' || tool === 'generate-workflows') {
          return this.setupHandler.handleSetupRepository(req, res);
        } else if (tool === 'search' || tool === 'search_code' || tool === 'get_code_context') {
          return this.searchHandler.handleSearch(req, res);
        } else if (tool === 'trigger-reprocessing' || tool === 'get-processing-status') {
          return this.processingHandler.handleTriggerReprocessing(req, res);
        } else if (tool === 'list_repositories' || tool === 'get_repository_status') {
          // Use a basic method for repository handler
          res.status(200).json({ message: 'Repository handler not fully implemented' });
        } else if (tool === 'default_prompt' || tool === 'get_scenarios' || tool === 'get_guidelines') {
          // Use a basic method for remcode handler
          res.status(200).json({ message: 'SWE guidance handler not fully implemented' });
        } else {
          res.status(404).json({ error: `Unknown tool: ${tool}` });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`MCP tool error for ${tool}: ${errorMessage}`);
        res.status(500).json({ error: errorMessage });
      }
    });

    logger.info('Routes configured with universal validation guard');
  }

  /**
   * Get MCP tool specifications for all available tools
   */
  getMCPToolSpecs() {
    return [
      // Setup Tools
      {
        name: 'setup-repository',
        description: 'Initialize and configure repository for remcode usage',
        parameters: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          token: { type: 'string', description: 'GitHub token (optional)', optional: true },
          branch: { type: 'string', description: 'Default branch (optional, default: main)', optional: true },
          workflowType: { type: 'string', description: 'Workflow type: basic, advanced, scheduled (optional)', optional: true },
          skipWorkflows: { type: 'boolean', description: 'Skip GitHub Actions workflow creation (optional)', optional: true },
          skipSecrets: { type: 'boolean', description: 'Skip repository secrets configuration (optional)', optional: true },
          confirm: { type: 'boolean', description: 'Confirm setup (optional, default: false)', optional: true }
        }
      },
      // Search Tools  
      {
        name: 'search',
        description: 'Search for code patterns and functions in the codebase',
        parameters: {
          text: { type: 'string', description: 'Search query text' },
          topK: { type: 'number', description: 'Number of results to return (optional, default: 5)', optional: true },
          includeContent: { type: 'boolean', description: 'Include full content in results (optional)', optional: true }
        }
      },
      // GitHub Tools
      {
        name: 'github_get_repo',
        description: 'Get repository information from GitHub',
        parameters: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' }
        }
      },
      // Pinecone Tools
      {
        name: 'pinecone_query',
        description: 'Query vectors in Pinecone database',
        parameters: {
          text: { type: 'string', description: 'Query text to search for' },
          topK: { type: 'number', description: 'Number of results to return (optional, default: 5)', optional: true },
          namespace: { type: 'string', description: 'Pinecone namespace (optional)', optional: true }
        }
      },
      // HuggingFace Tools
      {
        name: 'huggingface_embed_code',
        description: 'Generate embeddings for code using HuggingFace models',
        parameters: {
          code: { type: 'string', description: 'Code to embed' },
          model: { type: 'string', description: 'Model to use (optional)', optional: true }
        }
      },
      // Processing Tools
      {
        name: 'trigger-reprocessing',
        description: 'Trigger reprocessing of repository codebase',
        parameters: {
          force: { type: 'boolean', description: 'Force full reprocessing (optional)', optional: true }
        }
      },
      // Repository Tools
      {
        name: 'get_repository_status',
        description: 'Get current repository processing status',
        parameters: {}
      },
      // SWE Tools
      {
        name: 'default_prompt',
        description: 'Get default software engineering prompt with Remcode MCP integration',
        parameters: {
          scenario: { type: 'string', description: 'Specific scenario (optional)', optional: true }
        }
      }
    ];
  }

  async start(port: number = 3000, host: string = 'localhost'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, host, () => {
          logger.info(`🚀 MCP Server running on http://${host}:${port}`);
          logger.info(`📡 SSE endpoint: http://${host}:${port}/sse`);
          logger.info(`🔧 Health check: http://${host}:${port}/health`);
          logger.info(`📋 MCP spec: http://${host}:${port}/mcp/spec`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          logger.error(`Server error: ${error.message}`);
          reject(error);
        });
      } catch (error) {
        logger.error(`Failed to start server: ${error}`);
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          logger.info('MCP Server stopped');
          resolve();
        });
      });
    }
  }
}

export default MCPServer;
