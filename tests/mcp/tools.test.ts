import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';
import { MCPTestServer } from './inspector';

describe('MCP Tools Tests', () => {
  let testServer: MCPTestServer;
  let baseUrl: string;

  beforeAll(async () => {
    testServer = new MCPTestServer();
    await testServer.start();
    baseUrl = testServer.getServerUrl();
  }, 10000);

  afterAll(async () => {
    await testServer.stop();
  });

  it('should respond to setup_repository tool', async () => {
    const response = await axios.post(`${baseUrl}/v1/mcp`, {
      tool: 'setup_repository',
      parameters: { owner: 'test-owner', repo: 'test-repo', confirm: false }
    });
    expect(response.status).toBe(200);
  });

  it('should respond to search_code tool', async () => {
    const response = await axios.post(`${baseUrl}/v1/mcp`, {
      tool: 'search_code',
      parameters: { query: 'function authentication', topK: 5 }
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('results');
  });

  it('should respond to default_prompt tool', async () => {
    const response = await axios.post(`${baseUrl}/v1/mcp`, {
      tool: 'default_prompt',
      parameters: { scenario: 'refactoring' }
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('prompt');
  });
});
