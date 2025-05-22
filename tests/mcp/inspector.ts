/**
 * MCP Inspector Integration for Remcode
 */

import { MCPServer } from '../../src/mcp';

export class MCPTestServer {
  private server: MCPServer;
  private port: number = 3001;

  constructor() {
    this.server = new MCPServer({
      port: this.port,
      host: 'localhost',
      pineconeApiKey: process.env.PINECONE_API_KEY || 'test-key',
      githubToken: process.env.GITHUB_TOKEN || 'test-token',
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN || 'test-token',
      corsOrigins: '*'
    });
  }

  async start(): Promise<void> {
    await this.server.start();
    console.log(`Test MCP Server started on http://localhost:${this.port}`);
    console.log(`\nMCP Inspector: https://inspector.modelcontextprotocol.io`);
    console.log(`Connect to: http://localhost:${this.port}`);
  }

  async stop(): Promise<void> {
    this.server.stop();
    console.log('Test MCP Server stopped');
  }

  getServerUrl(): string {
    return `http://localhost:${this.port}`;
  }

  getInspectorUrl(): string {
    return 'https://inspector.modelcontextprotocol.io';
  }
}
