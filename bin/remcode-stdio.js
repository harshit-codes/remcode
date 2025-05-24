#!/usr/bin/env node

/**
 * STDIO Bridge for MCP Inspector
 * 
 * This script creates a STDIO interface that bridges to the HTTP MCP server,
 * allowing the MCP Inspector to work with Remcode's HTTP transport.
 */

const { spawn } = require('child_process');
const axios = require('axios');

const MCP_SERVER_URL = 'http://localhost:3008';

class MCPStdioBridge {
  constructor() {
    this.serverProcess = null;
    this.isServerReady = false;
  }

  async start() {
    // Start the HTTP MCP server
    console.error('- Initializing MCP server');
    
    this.serverProcess = spawn('node', ['bin/remcode.js', 'serve', '--port', '3008', '--skip-token-collection'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait for server to be ready
    await this.waitForServer();
    
    console.error('✔ ✅ MCP server started successfully!');
    
    // Start STDIO bridge
    this.startStdioBridge();
  }

  async waitForServer() {
    const maxRetries = 30;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        await axios.get(`${MCP_SERVER_URL}/health`);
        this.isServerReady = true;
        return;
      } catch (error) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('MCP server failed to start');
  }

  startStdioBridge() {
    // Handle STDIN (MCP Inspector requests)
    process.stdin.on('data', async (data) => {
      try {
        const request = JSON.parse(data.toString().trim());
        const response = await this.handleMCPRequest(request);
        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (error) {
        const errorResponse = {
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: error.message
          },
          id: null
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    });

    // Handle process termination
    process.on('SIGINT', () => {
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
      process.exit(0);
    });
  }

  async handleMCPRequest(request) {
    // Handle MCP protocol methods
    if (request.method === 'initialize') {
      return {
        jsonrpc: "2.0",
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "remcode-mcp",
            version: "0.1.0"
          },
          capabilities: {
            tools: {}
          }
        },
        id: request.id
      };
    }

    if (request.method === 'tools/list') {
      try {
        const specResponse = await axios.get(`${MCP_SERVER_URL}/v1/mcp/spec`);
        const tools = specResponse.data.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: {
            type: "object",
            properties: tool.parameters,
            required: Object.keys(tool.parameters).filter(key => !tool.parameters[key].optional)
          }
        }));

        return {
          jsonrpc: "2.0",
          result: {
            tools: tools
          },
          id: request.id
        };
      } catch (error) {
        throw new Error(`Failed to list tools: ${error.message}`);
      }
    }

    if (request.method === 'tools/call') {
      try {
        const { name, arguments: args } = request.params;
        
        const httpResponse = await axios.post(`${MCP_SERVER_URL}/v1/mcp`, {
          tool: name,
          parameters: args
        });

        return {
          jsonrpc: "2.0",
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(httpResponse.data, null, 2)
              }
            ]
          },
          id: request.id
        };
      } catch (error) {
        throw new Error(`Tool call failed: ${error.response?.data?.error || error.message}`);
      }
    }

    // Default response for unhandled methods
    return {
      jsonrpc: "2.0",
      result: {},
      id: request.id
    };
  }
}

// Start the bridge
const bridge = new MCPStdioBridge();
bridge.start().catch(error => {
  console.error('Failed to start MCP STDIO bridge:', error);
  process.exit(1);
});
