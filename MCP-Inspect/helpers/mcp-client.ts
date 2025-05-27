/**
 * MCP Inspector Client
 * 
 * Helper class for testing Remcode MCP server using MCP Inspector CLI
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { MCP_TEST_CONFIG, MCPTool, MCPResource, MCPPrompt } from './test-config';

const execAsync = promisify(exec);

export interface MCPInspectorResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
}

export interface MCPConnectionResult {
  connected: boolean;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  connectionTime: number;
}

/**
 * MCP Inspector Client for testing Remcode MCP server
 */
export class MCPInspectorClient {
  private config = MCP_TEST_CONFIG;

  constructor(customConfig?: Partial<typeof MCP_TEST_CONFIG>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
  }

  /**
   * Execute MCP Inspector CLI command
   */
  private async executeCommand(method: string, additionalArgs: string[] = []): Promise<MCPInspectorResult> {
    const startTime = Date.now();        tools: toolsResult.data || [],
        resources: resourcesResult.data || [],
        prompts: promptsResult.data || [],
        connectionTime
      };
    } catch (error: any) {
      const connectionTime = Date.now() - startTime;
      return {
        connected: false,
        tools: [],
        resources: [],
        prompts: [],
        connectionTime
      };
    }
  }

  /**
   * List all available MCP tools
   */
  async listTools(): Promise<MCPInspectorResult> {
    return this.executeCommand('tools/list');
  }

  /**
   * Call a specific MCP tool
   */
  async callTool(name: string, args: Record<string, any> = {}): Promise<MCPInspectorResult> {
    const toolArgs = [];
    toolArgs.push('--tool-name', name);
    
    for (const [key, value] of Object.entries(args)) {
      toolArgs.push('--tool-arg', `${key}=${value}`);
    }
    
    return this.executeCommand('tools/call', toolArgs);
  }

  /**
   * List all available MCP resources
   */
  async listResources(): Promise<MCPInspectorResult> {
    return this.executeCommand('resources/list');
  }

  /**
   * Get a specific MCP resource
   */
  async getResource(uri: string): Promise<MCPInspectorResult> {
    return this.executeCommand('resources/read', ['--uri', uri]);
  }

  /**
   * List all available MCP prompts
   */
  async listPrompts(): Promise<MCPInspectorResult> {
    return this.executeCommand('prompts/list');
  }

  /**
   * Get a specific MCP prompt
   */
  async getPrompt(name: string, args: Record<string, any> = {}): Promise<MCPInspectorResult> {
    const promptArgs = ['--name', name];
    
    for (const [key, value] of Object.entries(args)) {
      promptArgs.push('--argument', `${key}=${value}`);
    }
    
    return this.executeCommand('prompts/get', promptArgs);
  }
}