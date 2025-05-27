/**
 * MCP-Compatible SSE Handler
 * 
 * Implements proper JSON-RPC 2.0 over Server-Sent Events for MCP Inspector compatibility.
 * FIXED: Parameter parsing for MCP Inspector integration.
 */

import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SimpleValidator } from '../validation/simple-validator';

const logger = getLogger('MCP-SSE-Handler');

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: string | number | null;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number | null;
}

interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

export class MCPSSEHandler {
  private activeConnections: Map<string, Response> = new Map();
  private connectionCounter = 0;
  private toolDefinitions: any[] = [];

  constructor(toolDefinitions?: any[]) {
    this.toolDefinitions = toolDefinitions || this.getDefaultToolDefinitions();
  }

  public handleSSEConnection(req: Request, res: Response): void {
    const connectionId = `mcp_sse_${++this.connectionCounter}_${Date.now()}`;
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });

    this.activeConnections.set(connectionId, res);
    
    this.sendSSEMessage(res, {
      jsonrpc: '2.0',
      method: 'connection/established',
      params: {
        connectionId,
        timestamp: new Date().toISOString()
      }
    });

    req.on('close', () => {
      this.activeConnections.delete(connectionId);
      logger.info(`MCP SSE connection closed: ${connectionId}`);
    });

    logger.info(`MCP SSE connection established: ${connectionId}`);
  }

  public async handleMCPMessage(req: Request, res: Response, toolHandlers: any): Promise<void> {
    try {
      const jsonRpcRequest: JsonRpcRequest = req.body;
      
      if (!jsonRpcRequest.jsonrpc || jsonRpcRequest.jsonrpc !== '2.0') {
        const errorResponse = {
          jsonrpc: '2.0',
          error: { code: -32600, message: 'Invalid Request' },
          id: jsonRpcRequest.id || null
        };
        res.status(400).json(errorResponse);
        return;
      }

      logger.info(`📥 MCP Request: ${jsonRpcRequest.method}`);
      const response = await this.routeMCPMethod(jsonRpcRequest, toolHandlers);
      res.status(200).json(response);
      this.broadcastToSSEClients(response);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal error', data: errorMessage },
        id: req.body?.id || null
      });
    }
  }

  private async routeMCPMethod(request: JsonRpcRequest, toolHandlers: any): Promise<JsonRpcResponse> {
    const { method, params, id } = request;

    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: { name: 'remcode-mcp', version: '0.1.4' },
            capabilities: { tools: {} }
          },
          id: id || null
        };
      
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          result: { tools: this.getAllToolDefinitions() },
          id: id || null
        };

      case 'tools/call':
        return await this.handleToolCall(params, id || null, toolHandlers);
      
      default:
        return {
          jsonrpc: '2.0',
          error: { code: -32601, message: `Method not found: ${method}` },
          id: id || null
        };
    }
  }

  private getAllToolDefinitions(): any[] {
    return this.toolDefinitions.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: {
        type: 'object',
        properties: this.convertParametersToSchema(tool.parameters || {}),
        required: this.getRequiredParameters(tool.parameters || {})
      }
    }));
  }

  private convertParametersToSchema(parameters: any): any {
    const properties: any = {};
    
    for (const [key, param] of Object.entries(parameters)) {
      const paramDef = param as any;
      properties[key] = {
        type: paramDef.type || 'string',
        description: paramDef.description || ''
      };
      
      if (paramDef.default !== undefined) {
        properties[key].default = paramDef.default;
      }
    }
    
    return properties;
  }

  private getRequiredParameters(parameters: any): string[] {
    return Object.entries(parameters)
      .filter(([_, param]) => !(param as any).optional)
      .map(([key, _]) => key);
  }

  private getDefaultToolDefinitions(): any[] {
    // Fallback tool definitions if none provided
    return [
      {
        name: 'setup-repository',
        description: 'Set up a repository with Remcode configuration and workflows',
        parameters: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' },
          confirm: { type: 'boolean', description: 'Confirm setup', default: false, optional: true }
        }
      },
      {
        name: 'search',
        description: 'Search for code patterns and functions in the codebase',
        parameters: {
          text: { type: 'string', description: 'Search query text' },
          topK: { type: 'number', description: 'Number of results to return', default: 10, optional: true }
        }
      },
      {
        name: 'huggingface_embed_code',
        description: 'Generate embeddings for code using HuggingFace models',
        parameters: {
          code: { type: 'string', description: 'Code content to embed' },
          model: { type: 'string', description: 'Model to use', default: 'microsoft/codebert-base', optional: true }
        }
      },
      {
        name: 'huggingface_list_models',
        description: 'List available HuggingFace embedding models',
        parameters: {}
      },
      {
        name: 'pinecone_query',
        description: 'Search vectors in Pinecone database',
        parameters: {
          text: { type: 'string', description: 'Search text' },
          topK: { type: 'number', description: 'Number of results', default: 10, optional: true }
        }
      },
      {
        name: 'github_get_repo',
        description: 'Get repository information from GitHub',
        parameters: {
          owner: { type: 'string', description: 'Repository owner' },
          repo: { type: 'string', description: 'Repository name' }
        }
      }
    ];
  }

  /**
   * FIXED: Handle tool call with proper MCP Inspector parameter parsing
   */
  private async handleToolCall(params: any, id: string | number | null, toolHandlers: any): Promise<JsonRpcResponse> {
    try {
      // 🔧 FIX: Handle MCP Inspector parameter format
      // MCP Inspector sends: { name: "tool-name", arguments: { param1: "value1", ... } }
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      if (!toolName) {
        return {
          jsonrpc: '2.0',
          error: { code: -32602, message: 'Tool name is required' },
          id
        };
      }

      logger.info(`🛠️ Executing tool: ${toolName}`);

      // 🛡️ Universal validation
      const validation = await SimpleValidator.validateQuick();
      
      if (!validation.allValid) {
        return {
          jsonrpc: '2.0',
          error: {
            code: -32002,
            message: 'Setup required - missing API tokens',
            data: { validation: validation }
          },
          id
        };
      }

      // 🎯 Route to tool handlers
      let result: any;

      if (toolName === 'huggingface_list_models') {
        result = await this.callHandlerMethod(toolHandlers.huggingface, 'handleToolRequest', { tool: 'huggingface_list_models', parameters: {} });
      }
      else if (toolName === 'huggingface_embed_code') {
        result = await this.callHandlerMethod(toolHandlers.huggingface, 'handleToolRequest', { tool: 'huggingface_embed_code', parameters: toolArgs });
      }
      else if (toolName === 'pinecone_query') {
        result = await this.callHandlerMethod(toolHandlers.pinecone, 'handleQuery', toolArgs);
      }
      else if (toolName === 'github_get_repo') {
        result = await this.callHandlerMethod(toolHandlers.github, 'handleGetRepo', toolArgs);
      }
      else if (toolName === 'search') {
        result = await this.callHandlerMethod(toolHandlers.search, 'handleSearch', toolArgs);
      }
      else if (toolName === 'setup-repository') {
        result = await this.callHandlerMethod(toolHandlers.setup, 'handleSetupRepository', toolArgs);
      }
      else {
        return {
          jsonrpc: '2.0',
          error: { code: -32601, message: `Tool not implemented: ${toolName}` },
          id
        };
      }

      return {
        jsonrpc: '2.0',
        result: {
          content: [{ 
            type: 'text', 
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }]
        },
        id
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Tool execution failed: ${errorMessage}`);
      
      return {
        jsonrpc: '2.0',
        error: { 
          code: -32603, 
          message: `Tool execution failed: ${errorMessage}`
        },
        id
      };
    }
  }

  /**
   * Helper to call handler methods with proper error handling
   */
  private async callHandlerMethod(handler: any, methodName: string, args: any): Promise<any> {
    if (!handler || typeof handler[methodName] !== 'function') {
      throw new Error(`Handler method ${methodName} not found`);
    }

    // Mock Express req/res for handlers
    const mockReq = { body: args, params: {}, query: {}, headers: {} };
    let result: any = null;
    const mockRes = {
      status: () => mockRes,
      json: (data: any) => { result = data; return mockRes; },
      send: (data: any) => { result = data; return mockRes; }
    };

    try {
      await handler[methodName](mockReq, mockRes, args);
      return result;
    } catch (error) {
      try {
        return await handler[methodName](args);
      } catch (directError) {
        throw new Error(`Failed to call ${methodName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private sendSSEMessage(res: Response, message: any): void {
    try {
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    } catch (error) {
      logger.error(`Failed to send SSE message: ${error}`);
    }
  }

  private broadcastToSSEClients(message: JsonRpcResponse): void {
    this.activeConnections.forEach((res, connectionId) => {
      try {
        this.sendSSEMessage(res, message);
      } catch (error) {
        this.activeConnections.delete(connectionId);
      }
    });
  }

  public closeAllConnections(): void {
    this.activeConnections.forEach((res) => {
      try {
        res.end();
      } catch (error) {
        // Ignore
      }
    });
    this.activeConnections.clear();
  }
}
