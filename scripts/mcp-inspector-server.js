#!/usr/bin/env node

/**
 * MCP Inspector Compatible Server
 * 
 * Creates a proper MCP server that the Inspector can connect to
 */

const express = require('express');
const { spawn } = require('child_process');
const axios = require('axios');

const MCP_INSPECTOR_PORT = 3333;
const REMCODE_SERVER_PORT = 3008;

class MCPInspectorServer {
  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.remcodeServer = null;
    this.setupRoutes();
  }

  async startRemcodeServer() {
    console.log('🚀 Starting Remcode MCP Server...');
    this.remcodeServer = spawn('node', ['bin/remcode.js', 'serve', '--port', REMCODE_SERVER_PORT, '--skip-token-collection'], {
      stdio: 'pipe'
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      const response = await axios.get(`http://localhost:${REMCODE_SERVER_PORT}/health`);
      if (response.data.status === 'OK') {
        console.log('✅ Remcode server is ready');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to start Remcode server:', error.message);
      return false;
    }
  }

  setupRoutes() {
    // MCP Inspector compatible endpoints
    this.app.get('/tools', async (req, res) => {
      try {
        const tools = [
          {
            name: 'setup-repository',
            description: 'Set up a repository with Remcode',
            inputSchema: {
              type: 'object',
              properties: {
                owner: { type: 'string', description: 'Repository owner' },
                repo: { type: 'string', description: 'Repository name' }
              },
              required: ['owner', 'repo']
            }
          },
          {
            name: 'huggingface_list_models',
            description: 'List available HuggingFace models',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'huggingface_embed_code',
            description: 'Generate embeddings for code using HuggingFace',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'Code to embed' }
              },
              required: ['code']
            }
          },
          {
            name: 'github_get_repo',
            description: 'Get repository information from GitHub',
            inputSchema: {
              type: 'object',
              properties: {
                owner: { type: 'string', description: 'Repository owner' },
                repo: { type: 'string', description: 'Repository name' }
              },
              required: ['owner', 'repo']
            }
          },
          {
            name: 'pinecone_list_indexes',
            description: 'List available Pinecone indexes',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ];

        res.json({ tools });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/tools/call', async (req, res) => {
      try {
        const { name, arguments: args } = req.body;
        
        console.log(`🔧 Calling tool: ${name}`);
        
        const response = await axios.post(`http://localhost:${REMCODE_SERVER_PORT}/mcp`, {
          tool: name,
          parameters: args || {}
        });

        res.json({
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        });
      } catch (error) {
        console.error('Tool execution error:', error.message);
        res.status(500).json({
          error: error.response?.data || error.message,
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        });
      }
    });

    // Health endpoint for the inspector server
    this.app.get('/health', (req, res) => {
      res.json({ status: 'MCP Inspector Server Ready' });
    });
  }

  async start() {
    // Start Remcode server first
    const remcodeReady = await this.startRemcodeServer();
    if (!remcodeReady) {
      console.error('❌ Cannot start MCP Inspector Server - Remcode server failed');
      return;
    }

    // Start Inspector server
    this.app.listen(MCP_INSPECTOR_PORT, () => {
      console.log('🎯 MCP Inspector Server ready!');
      console.log(`📍 Server URL: http://localhost:${MCP_INSPECTOR_PORT}`);
      console.log(`🔗 Tools Endpoint: http://localhost:${MCP_INSPECTOR_PORT}/tools`);
      console.log(`⚡ Tool Execution: http://localhost:${MCP_INSPECTOR_PORT}/tools/call`);
      console.log('');
      console.log('🧪 To test with MCP Inspector:');
      console.log(`1. Open: http://localhost:${MCP_INSPECTOR_PORT}/tools`);
      console.log(`2. Use MCP Inspector to connect to: http://localhost:${MCP_INSPECTOR_PORT}`);
      console.log('');
      console.log('Available tools for testing:');
      console.log('  - setup-repository');
      console.log('  - huggingface_list_models');
      console.log('  - huggingface_embed_code');
      console.log('  - github_get_repo');
      console.log('  - pinecone_list_indexes');
    });
  }

  stop() {
    if (this.remcodeServer) {
      this.remcodeServer.kill();
    }
  }
}

// Start the server
const server = new MCPInspectorServer();
server.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down MCP Inspector Server...');
  server.stop();
  process.exit(0);
});
