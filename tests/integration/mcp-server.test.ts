import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { MCPServer } from '../../src/mcp';

describe('MCP Server Integration', () => {
  let server: MCPServer;

  beforeAll(async () => {
    server = new MCPServer({
      port: 3002,
      pineconeApiKey: 'test-key',
      githubToken: 'test-token',
      huggingfaceToken: 'test-token'
    });

    await server.start();
  }, 15000);

  afterAll(async () => {
    server.stop();
  });

  it('should start MCP server successfully', () => {
    expect(server).toBeDefined();
  });

  it('should have correct server configuration', () => {
    expect(server.options.pineconeApiKey).toBe('test-key');
    expect(server.options.githubToken).toBe('test-token');
    expect(server.options.huggingfaceToken).toBe('test-token');
  });
});
