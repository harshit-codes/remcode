/**
 * Real MCP Inspector CLI Client - Core Implementation
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export interface MCPToolResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  rawOutput?: string;
}

export interface MCPConnectionInfo {
  connected: boolean;
  toolCount: number;
  availableTools: string[];
  connectionTime: number;
}

export interface PerformanceMetrics {
  toolName: string;
  executionTime: number;
  memoryUsage?: number;
  success: boolean;
}

export class RealMCPClient {
  private mcpInspectorPath: string;
  private remcodeStdioPath: string;
  private connectionTimeout: number = 30000;
  private executionTimeout: number = 10000;

  constructor() {
    this.mcpInspectorPath = 'npx @modelcontextprotocol/inspector';
    this.remcodeStdioPath = path.join(process.cwd(), 'bin', 'remcode-stdio.js');
    
    if (!fs.existsSync(this.remcodeStdioPath)) {
      throw new Error(`Remcode STDIO bridge not found at: ${this.remcodeStdioPath}`);
    }
  }
  /**
   * Test connection to MCP server and get basic info
   */
  async testConnection(): Promise<MCPConnectionInfo> {
    const startTime = Date.now();
    
    try {
      const command = `${this.mcpInspectorPath} --cli node ${this.remcodeStdioPath} --method tools/list`;
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: this.connectionTimeout,
        env: { ...process.env, NODE_ENV: 'test' }
      });

      if (stderr && !stderr.includes('debug')) {
        console.warn('Connection stderr:', stderr);
      }

      const tools = this.parseToolsList(stdout);
      
      return {
        connected: true,
        toolCount: tools.length,
        availableTools: tools,
        connectionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        connected: false,
        toolCount: 0,
        availableTools: [],
        connectionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Execute a specific MCP tool with parameters
   */
  async executeTool(toolName: string, params: Record<string, any> = {}): Promise<MCPToolResult> {
    const startTime = Date.now();
    
    try {
      let command = `${this.mcpInspectorPath} --cli node ${this.remcodeStdioPath} --method tools/call --tool-name ${toolName}`;
      
      for (const [key, value] of Object.entries(params)) {
        command += ` --tool-arg ${key}=${value}`;
      }

      const { stdout, stderr } = await execAsync(command, {
        timeout: this.executionTimeout,
        env: { ...process.env, NODE_ENV: 'test', LOG_LEVEL: 'error' }
      });

      const result = this.parseToolResult(stdout);
      
      return {
        success: true,
        result,
        executionTime: Date.now() - startTime,
        rawOutput: stdout
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime
      };
    }
  }
  /**
   * Parse tools list from MCP Inspector output
   */
  private parseToolsList(output: string): string[] {
    try {
      const jsonMatch = output.match(/\{.*\}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.tools && Array.isArray(parsed.tools)) {
          return parsed.tools.map((tool: any) => tool.name || tool);
        }
      }
      
      const lines = output.split('\n');
      const tools: string[] = [];
      
      for (const line of lines) {
        if (line.includes('tool:') || line.includes('name:')) {
          const toolMatch = line.match(/["']([^"']+)["']/);
          if (toolMatch) {
            tools.push(toolMatch[1]);
          }
        }
      }
      
      return [...new Set(tools)];
    } catch (error) {
      console.warn('Failed to parse tools list:', error);
      return [];
    }
  }

  /**
   * Parse tool execution result from MCP Inspector output
   */
  private parseToolResult(output: string): any {
    try {
      const jsonMatch = output.match(/\{.*\}/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { output: output.trim() };
    } catch (error) {
      console.warn('Failed to parse tool result:', error);
      return { output: output.trim() };
    }
  }

  /**
   * Test tool performance and collect metrics
   */
  async measureToolPerformance(toolName: string, params: Record<string, any> = {}): Promise<PerformanceMetrics> {
    const result = await this.executeTool(toolName, params);
    
    return {
      toolName,
      executionTime: result.executionTime,
      success: result.success
    };
  }
}

export default RealMCPClient;
