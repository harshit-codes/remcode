/**
 * MCP-Compatible SSE Handler
 * 
 * Implements proper JSON-RPC 2.0 over Server-Sent Events for MCP Inspector compatibility.
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
          result: {
            tools: [
              {
                name: 'setup-repository',
                description: 'Set up repository with Remcode',
                inputSchema: {
                  type: 'object',
                  properties: {
                    owner: { type: 'string' },
                    repo: { type: 'string' },
                    confirm: { type: 'boolean', default: false }
                  },
                  required: ['owner', 'repo']
                }
              },
              {
                name: 'huggingface_embed_code',
                description: 'Generate code embeddings',
                inputSchema: {
                  type: 'object',
                  properties: {
                    code: { type: 'string' },
                    model: { type: 'string', default: 'microsoft/codebert-base' }
                  },
                  required: ['code']
                }
              }
            ]
          },
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

  private async handleToolCall(params: any, id: string | number | null, toolHandlers: any): Promise<JsonRpcResponse> {
    const { name, arguments: args } = params;
    
    try {
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

      let result: any;

      if (name.startsWith('huggingface_')) {
        const action = name.replace('huggingface_', '');
        if (action === 'embed_code') {
          result = await toolHandlers.huggingface.handleEmbedCode(args);
        } else {
          throw new Error(`Unknown HuggingFace action: ${action}`);
        }
      } else if (name === 'setup-repository') {
        result = await toolHandlers.setup.handleSetupRepository(null, null, args);
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }

      return {
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        },
        id
      };

    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: { code: -32603, message: `Tool execution failed: ${error}` },
        id
      };
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
