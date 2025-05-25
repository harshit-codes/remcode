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
    this.remcodeHandler = new RemcodeMCPHandler(); // Temporarily disabled
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
    
    // Add SWE guidance injection middleware for key tools
    const toolsWithGuidance = [
      'search', 'search_code', 'get_code_context', 'find_similar_patterns',
      'trigger-reprocessing', 'setup-repository', 'analyze_file_structure'
    ];
    // Middleware temporarily disabled
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK' });
    });
    
    // MCP Specification endpoint (simplified route)
    this.app.get('/mcp/spec', (req, res) => {
      res.status(200).json({
        name: 'remcode-mcp',
        version: '0.1.0',
        description: 'Remcode Model Context Protocol server for code analysis and vectorization',
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
            name: 'check-prerequisites',
            description: 'Check repository prerequisites',
            parameters: {}
          },
          {
            name: 'configure-repository',
            description: 'Configure repository settings',
            parameters: {
              config: { type: 'object', description: 'Configuration settings' }
            }
          },
          {
            name: 'setup-secrets',
            description: 'Set up repository secrets',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              secrets: { type: 'object', description: 'Secrets to configure' }
            }
          },
          {
            name: 'generate-workflows',
            description: 'Generate repository workflows',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              type: { type: 'string', description: 'Workflow type: basic, scheduled, advanced, all' }
            }
          },
          {
            name: 'get_repository_status',
            description: 'Check if repository is initialized and get processing status',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' }
            }
          },
          {
            name: 'list_repositories',
            description: 'Show accessible GitHub repositories',
            parameters: {}
          },
          {
            name: 'search',
            description: 'Unified intelligent search across vectorized codebase with automatic query processing',
            parameters: {
              query: { type: 'string', description: 'Natural language search query' },
              topK: { type: 'number', description: 'Number of results to return (default: 10)', optional: true },
              filters: { type: 'object', description: 'Search filters (language, fileType, complexity, path, etc.)', optional: true }
            }
          },
          {
            name: 'search_code',
            description: '[Deprecated] Use "search" instead - Semantic search across vectorized codebase',
            parameters: {
              query: { type: 'string', description: 'Natural language search query' },
              topK: { type: 'number', description: 'Number of results to return (default: 10)', optional: true },
              filters: { type: 'object', description: 'Search filters', optional: true }
            }
          },
          {
            name: 'get_code_context',
            description: 'Get surrounding context for specific code snippets',
            parameters: {
              filePath: { type: 'string', description: 'Path to the file' },
              startLine: { type: 'number', description: 'Start line number' },
              endLine: { type: 'number', description: 'End line number' }
            }
          },
          {
            name: 'trigger-reprocessing',
            description: 'Trigger repository reprocessing with enhanced options',
            parameters: {
              type: { type: 'string', description: 'Processing type: auto, full, incremental, vectorize, analyze (default: auto)' },
              force: { type: 'boolean', description: 'Force reprocessing (default: false)' },
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              branch: { type: 'string', description: 'Branch to process (default: main)' },
              timeout: { type: 'number', description: 'Processing timeout in seconds (default: 3600)' },
              dryRun: { type: 'boolean', description: 'Validate configuration without processing (default: false)' }
            }
          },
          {
            name: 'get-processing-status',
            description: 'Get detailed processing status with workflow information',
            parameters: {
              owner: { type: 'string', description: 'Repository owner (optional)' },
              repo: { type: 'string', description: 'Repository name (optional)' },
              runId: { type: 'string', description: 'Workflow run ID for specific run status (optional)' }
            }
          },
          {
            name: 'get-processing-history',
            description: 'Get processing workflow history with analytics',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              limit: { type: 'number', description: 'Number of history items to return (default: 10)' }
            }
          },
          {
            name: 'cancel-processing',
            description: 'Cancel a running processing workflow',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              runId: { type: 'number', description: 'Workflow run ID to cancel' }
            }
          },
          {
            name: 'retry-processing',
            description: 'Retry a failed processing workflow',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              runId: { type: 'number', description: 'Workflow run ID to retry' },
              onlyFailedJobs: { type: 'boolean', description: 'Retry only failed jobs (default: false)' }
            }
          },
          {
            name: 'get-processing-logs',
            description: 'Get logs from a processing workflow run',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              runId: { type: 'number', description: 'Workflow run ID' }
            }
          },
          {
            name: 'get-processing-metrics',
            description: 'Get processing analytics and metrics',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              days: { type: 'number', description: 'Number of days to analyze (default: 30)' }
            }
          },
          {
            name: 'get-workflow-analytics',
            description: 'Get comprehensive workflow analytics with trends and performance data',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              days: { type: 'number', description: 'Number of days to analyze (default: 30)' }
            }
          },
          {
            name: 'monitor-workflow-health',
            description: 'Monitor workflow health and get automated recommendations',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' },
              maxFailureRate: { type: 'number', description: 'Maximum failure rate threshold (default: 50)' },
              maxConsecutiveFailures: { type: 'number', description: 'Maximum consecutive failures (default: 3)' },
              alertOnSlowRuns: { type: 'boolean', description: 'Alert on slow workflow runs (default: true)' },
              maxDurationMinutes: { type: 'number', description: 'Maximum duration threshold in minutes (default: 60)' }
            }
          },
          {
            name: 'get-workflow-recommendations',
            description: 'Get automated workflow optimization recommendations',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' }
            }
          },
          {
            name: 'default_prompt',
            description: 'Auto-injected SWE best practices and guidelines',
            parameters: {
              scenario: { type: 'string', description: 'Development scenario (optional)', optional: true },
              context: { type: 'string', description: 'Additional context (optional)', optional: true }
            }
          },
          {
            name: 'get_scenarios',
            description: 'Context-aware system prompt selection',
            parameters: {
              userInput: { type: 'string', description: 'User input to detect scenario from (optional)', optional: true }
            }
          },
          {
            name: 'get_guidelines',
            description: 'Get specific software engineering guidelines and best practices',
            parameters: {
              scenario: { type: 'string', description: 'Scenario type (optional)', optional: true },
              category: { type: 'string', description: 'Guideline category (optional)', optional: true },
              priority: { type: 'string', description: 'Priority level (optional)', optional: true }
            }
          },
          {
            name: 'get_contextual_guidance',
            description: 'Get comprehensive SWE guidance for specific development context',
            parameters: {
              userQuery: { type: 'string', description: 'User query to analyze' },
              codeContext: { type: 'string', description: 'Code context (optional)', optional: true },
              teamPreferences: { type: 'object', description: 'Team preferences (optional)', optional: true }
            }
          },
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
            name: 'remcode_status',
            description: 'Check the status of remcode processing for a repository',
            parameters: {
              owner: { type: 'string', description: 'Repository owner' },
              repo: { type: 'string', description: 'Repository name' }
            }
          },
          {
            name: 'remcode_search',
            description: 'Search for code using natural language queries',
            parameters: {
              query: { type: 'string', description: 'Natural language search query' },
              topK: { type: 'number', description: 'Number of results to return (default: 5)', optional: true },
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
    
    // Register MCP endpoints (simplified routes)
    this.app.post('/mcp/pinecone/:action', this.pineconeHandler.handleRequest.bind(this.pineconeHandler));
    this.app.post('/mcp/github/:action', this.githubHandler.handleRequest.bind(this.githubHandler));
    this.app.post('/mcp/huggingface/:action', this.huggingfaceHandler.handleRequest.bind(this.huggingfaceHandler));
    
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
        } else if (tool === 'check-prerequisites') {
          return this.setupHandler.handleCheckPrerequisites(req, res, req.body.parameters);
        } else if (tool === 'configure-repository') {
          return this.setupHandler.handleConfigureRepository(req, res, req.body.parameters);
        } else if (tool === 'setup-secrets') {
          return this.setupHandler.handleSetupSecrets(req, res, req.body.parameters);
        } else if (tool === 'generate-workflows') {
          return this.setupHandler.handleGenerateWorkflows(req, res, req.body.parameters);
        } else if (tool === 'search') {
          return this.searchHandler.handleSearch(req, res, req.body.parameters);
        } else if (tool === 'search_code') {
          return this.searchHandler.handleSearchCode(req, res, req.body.parameters);
        } else if (tool === 'get_code_context') {
          return this.searchHandler.handleGetCodeContext(req, res, req.body.parameters);
        } else if (tool === 'trigger-reprocessing') {
          return this.processingHandler.handleTriggerReprocessing(req, res, req.body.parameters);
        } else if (tool === 'get-processing-status') {
          return this.processingHandler.handleGetProcessingStatus(req, res, req.body.parameters);
        } else if (tool === 'get-processing-history') {
          return this.processingHandler.handleGetProcessingHistory(req, res, req.body.parameters);
        } else if (tool === 'cancel-processing') {
          return this.processingHandler.handleCancelProcessing(req, res, req.body.parameters);
        } else if (tool === 'retry-processing') {
          return this.processingHandler.handleRetryProcessing(req, res, req.body.parameters);
        } else if (tool === 'get-processing-logs') {
          return this.processingHandler.handleGetProcessingLogs(req, res, req.body.parameters);
        } else if (tool === 'get-processing-metrics') {
          return this.processingHandler.handleGetProcessingMetrics(req, res, req.body.parameters);
        } else if (tool === 'get-workflow-analytics') {
          return this.processingHandler.handleGetWorkflowAnalytics(req, res, req.body.parameters);
        } else if (tool === 'monitor-workflow-health') {
          return this.processingHandler.handleMonitorWorkflowHealth(req, res, req.body.parameters);
        } else if (tool === 'get-workflow-recommendations') {
          return this.processingHandler.handleGetWorkflowRecommendations(req, res, req.body.parameters);
        } else if (tool === 'get_repository_status') {
          return this.repositoryHandler.handleGetRepositoryStatus(req, res, req.body.parameters);
        } else if (tool === 'list_repositories') {
          return this.repositoryHandler.handleListRepositories(req, res, req.body.parameters);
        } else if (tool === 'default_prompt') {
          return this.remcodeHandler.handleDefaultPrompt(req, res, req.body.parameters);
        } else if (tool === 'get_scenarios') {
          return this.remcodeHandler.handleGetScenarios(req, res, req.body.parameters);
        } else if (tool === 'get_guidelines') {
          return this.remcodeHandler.handleGetGuidelines(req, res, req.body.parameters);
        } else if (tool === 'get_contextual_guidance') {
          return this.remcodeHandler.handleGetContextualGuidance(req, res, req.body.parameters);
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