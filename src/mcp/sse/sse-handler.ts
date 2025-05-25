/**
 * SSE (Server-Sent Events) Handler for MCP Tools
 * 
 * Provides real-time streaming communication for MCP Inspector integration
 * without STDIO bridge compatibility issues.
 */

import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SimpleValidator } from '../validation/simple-validator';

const logger = getLogger('SSE-Handler');

/**
 * SSE connection management for MCP tools
 */
export class SSEHandler {
  private activeConnections: Map<string, Response> = new Map();
  private connectionCounter = 0;

  /**
   * Initialize SSE connection for MCP Inspector
   */
  public initializeConnection(req: Request, res: Response): string {
    const connectionId = `sse_${++this.connectionCounter}_${Date.now()}`;
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });

    // Store connection
    this.activeConnections.set(connectionId, res);
    
    // Send initial connection event
    this.sendEvent(res, {
      type: 'connection',
      data: {
        connectionId,
        status: 'connected',
        timestamp: new Date().toISOString(),
        message: 'SSE connection established for MCP tools'
      }
    });

    // Handle client disconnect
    req.on('close', () => {
      this.activeConnections.delete(connectionId);
      logger.info(`SSE connection closed: ${connectionId}`);
    });

    logger.info(`SSE connection established: ${connectionId}`);
    return connectionId;
  }

  /**
   * Send Server-Sent Event to client
   */
  private sendEvent(res: Response, event: { type: string; data: any; id?: string }): void {
    try {
      if (event.id) {
        res.write(`id: ${event.id}\n`);
      }
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    } catch (error) {
      logger.error(`Failed to send SSE event: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Broadcast event to all active connections
   */
  private broadcast(event: { type: string; data: any; id?: string }): void {
    this.activeConnections.forEach((res, connectionId) => {
      try {
        this.sendEvent(res, event);
      } catch (error) {
        logger.error(`Failed to send to connection ${connectionId}: ${error instanceof Error ? error.message : String(error)}`);
        this.activeConnections.delete(connectionId);
      }
    });
  }

  /**
   * Handle MCP tool execution via SSE
   */
  public async handleMCPToolRequest(
    req: Request, 
    res: Response, 
    toolHandlers: any
  ): Promise<void> {
    const { tool, parameters = {} } = req.body;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Send request started event
      this.sendEvent(res, {
        type: 'tool_request_started',
        id: requestId,
        data: {
          tool,
          parameters,
          timestamp: new Date().toISOString()
        }
      });

      // 🛡️ ONE-SHOT PERMISSION VALIDATION
      logger.info(`🔍 Validating permissions for SSE MCP tool: ${tool}`);
      const validation = await SimpleValidator.validateQuick();
      
      if (!validation.allValid) {
        logger.warn(`❌ Permission validation failed for SSE tool: ${tool}`);
        this.sendEvent(res, {
          type: 'tool_error',
          id: requestId,
          data: {
            tool,
            error: 'setup_required',
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
          }
        });
        return;
      }
      
      logger.info(`✅ All API tokens validated for SSE tool: ${tool}`);

      // Route to appropriate handler and execute
      let result: any;
      
      if (tool && tool.startsWith('pinecone_')) {
        result = await this.executePineconeHandler(tool, parameters, toolHandlers.pinecone);
      } else if (tool && tool.startsWith('github_')) {
        result = await this.executeGitHubHandler(tool, parameters, toolHandlers.github);
      } else if (tool && tool.startsWith('huggingface_')) {
        result = await this.executeHuggingFaceHandler(tool, parameters, toolHandlers.huggingface);
      } else {
        result = await this.executeOtherHandler(tool, parameters, toolHandlers);
      }

      // Send successful result
      this.sendEvent(res, {
        type: 'tool_result',
        id: requestId,
        data: {
          tool,
          result,
          status: 'success',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`SSE MCP tool execution error for ${tool}: ${errorMessage}`);
      
      this.sendEvent(res, {
        type: 'tool_error',
        id: requestId,
        data: {
          tool,
          error: errorMessage,
          status: 'failed',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Execute Pinecone handler
   */
  private async executePineconeHandler(tool: string, parameters: any, handler: any): Promise<any> {
    const action = tool.replace('pinecone_', '');
    
    switch (action) {
      case 'query':
        return await handler.handleQuery(parameters);
      case 'list_indexes':
        return await handler.handleListIndexes(parameters);
      default:
        throw new Error(`Unknown Pinecone action: ${action}`);
    }
  }

  /**
   * Execute GitHub handler
   */
  private async executeGitHubHandler(tool: string, parameters: any, handler: any): Promise<any> {
    const action = tool.replace('github_', '');
    
    switch (action) {
      case 'get_repo':
        return await handler.handleGetRepo(parameters);
      case 'list_files':
        return await handler.handleListFiles(parameters);
      case 'get_file':
        return await handler.handleGetFile(parameters);
      case 'search_code':
        return await handler.handleSearchCode(parameters);
      default:
        throw new Error(`Unknown GitHub action: ${action}`);
    }
  }

  /**
   * Execute HuggingFace handler
   */
  private async executeHuggingFaceHandler(tool: string, parameters: any, handler: any): Promise<any> {
    const action = tool.replace('huggingface_', '');
    
    switch (action) {
      case 'embed_code':
        return await handler.handleEmbedCode(parameters);
      case 'embed_query':
        return await handler.handleEmbedQuery(parameters);
      case 'list_models':
        return await handler.handleListModels(parameters);
      default:
        throw new Error(`Unknown HuggingFace action: ${action}`);
    }
  }

  /**
   * Execute other handlers (Setup, Search, Processing, etc.)
   */
  private async executeOtherHandler(tool: string, parameters: any, handlers: any): Promise<any> {
    switch (tool) {
      case 'setup-repository':
        return await handlers.setup.handleSetupRepository(null, null, parameters);
      case 'check-prerequisites':
        return await handlers.setup.handleCheckPrerequisites(null, null, parameters);
      case 'configure-repository':
        return await handlers.setup.handleConfigureRepository(null, null, parameters);
      case 'setup-secrets':
        return await handlers.setup.handleSetupSecrets(null, null, parameters);
      case 'generate-workflows':
        return await handlers.setup.handleGenerateWorkflows(null, null, parameters);
      case 'search':
        return await handlers.search.handleSearch(null, null, parameters);
      case 'search_code':
        return await handlers.search.handleSearchCode(null, null, parameters);
      case 'get_code_context':
        return await handlers.search.handleGetCodeContext(null, null, parameters);
      case 'trigger-reprocessing':
        return await handlers.processing.handleTriggerReprocessing(null, null, parameters);
      case 'get-processing-status':
        return await handlers.processing.handleGetProcessingStatus(null, null, parameters);
      case 'get-processing-history':
        return await handlers.processing.handleGetProcessingHistory(null, null, parameters);
      case 'cancel-processing':
        return await handlers.processing.handleCancelProcessing(null, null, parameters);
      case 'retry-processing':
        return await handlers.processing.handleRetryProcessing(null, null, parameters);
      case 'get-processing-logs':
        return await handlers.processing.handleGetProcessingLogs(null, null, parameters);
      case 'get-processing-metrics':
        return await handlers.processing.handleGetProcessingMetrics(null, null, parameters);
      case 'get-workflow-analytics':
        return await handlers.processing.handleGetWorkflowAnalytics(null, null, parameters);
      case 'monitor-workflow-health':
        return await handlers.processing.handleMonitorWorkflowHealth(null, null, parameters);
      case 'get-workflow-recommendations':
        return await handlers.processing.handleGetWorkflowRecommendations(null, null, parameters);
      case 'get_repository_status':
        return await handlers.repository.handleGetRepositoryStatus(null, null, parameters);
      case 'list_repositories':
        return await handlers.repository.handleListRepositories(null, null, parameters);
      case 'default_prompt':
        return await handlers.remcode.handleDefaultPrompt(null, null, parameters);
      case 'get_scenarios':
        return await handlers.remcode.handleGetScenarios(null, null, parameters);
      case 'get_guidelines':
        return await handlers.remcode.handleGetGuidelines(null, null, parameters);
      case 'get_contextual_guidance':
        return await handlers.remcode.handleGetContextualGuidance(null, null, parameters);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  /**
   * Handle SSE health check
   */
  public handleHealthCheck(req: Request, res: Response): void {
    this.sendEvent(res, {
      type: 'health',
      data: {
        status: 'healthy',
        activeConnections: this.activeConnections.size,
        timestamp: new Date().toISOString(),
        version: '0.1.3'
      }
    });
  }

  /**
   * Handle SSE tool listing
   */
  public handleToolList(req: Request, res: Response): void {
    const tools = [
      'setup-repository', 'check-prerequisites', 'configure-repository', 'setup-secrets', 'generate-workflows',
      'get_repository_status', 'list_repositories',
      'search', 'search_code', 'get_code_context',
      'trigger-reprocessing', 'get-processing-status', 'get-processing-history', 'cancel-processing', 
      'retry-processing', 'get-processing-logs', 'get-processing-metrics', 'get-workflow-analytics', 
      'monitor-workflow-health', 'get-workflow-recommendations',
      'default_prompt', 'get_scenarios', 'get_guidelines', 'get_contextual_guidance',
      'github_get_repo', 'github_list_files', 'github_get_file', 'github_search_code',
      'pinecone_query', 'pinecone_list_indexes',
      'huggingface_embed_code', 'huggingface_embed_query', 'huggingface_list_models'
    ];

    this.sendEvent(res, {
      type: 'tool_list',
      data: {
        tools,
        count: tools.length,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Close all active connections
   */
  public closeAllConnections(): void {
    this.activeConnections.forEach((res, connectionId) => {
      try {
        this.sendEvent(res, {
          type: 'server_shutdown',
          data: {
            message: 'Server is shutting down',
            timestamp: new Date().toISOString()
          }
        });
        res.end();
      } catch (error) {
        logger.error(`Error closing connection ${connectionId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
    this.activeConnections.clear();
    logger.info('All SSE connections closed');
  }
}
