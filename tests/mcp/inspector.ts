/**
 * MCP Inspector Integration for Remcode
 */

import { MCPServer } from '../../src/mcp';
import { PortManager } from '../../src/utils/port-manager';

export class MCPTestServer {
  private server: MCPServer | undefined;
  private port: number = 3000;

  constructor() {
    // Server will be initialized in start()
  }

  async start(): Promise<void> {
    // Find an available port starting from 3000
    this.port = await PortManager.getAvailablePort(3000);

    this.server = new MCPServer({
      port: this.port,
      host: 'localhost',
      pineconeApiKey: process.env.PINECONE_API_KEY || 'test-key',
      githubToken: process.env.GITHUB_TOKEN || 'test-token',
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN || 'test-token',
      corsOrigins: '*'
    });

    await this.server.start();
    console.log(`Test MCP Server started on http://localhost:${this.port}`);
    console.log(`\nMCP Inspector: https://inspector.modelcontextprotocol.io`);
    console.log(`Connect to: http://localhost:${this.port}`);
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.stop();
      console.log('Test MCP Server stopped');
    }
  }

  getServerUrl(): string {
    return `http://localhost:${this.port}`;
  }

  getInspectorUrl(): string {
    return 'https://inspector.modelcontextprotocol.io';
  }
}
