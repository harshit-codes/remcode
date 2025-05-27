/**
 * MCP Server Connection Tests
 * 
 * Test basic MCP server connection and protocol compliance
 */

import { MCPInspectorClient } from '../helpers/mcp-client';
import { TIMEOUTS, PERFORMANCE_BENCHMARKS } from '../helpers/test-config';

describe('MCP Server Connection', () => {
  let client: MCPInspectorClient;

  beforeAll(() => {
    client = new MCPInspectorClient();
  });

  test('should connect to MCP server successfully', async () => {
    const connectionResult = await client.testConnection();
    
    expect(connectionResult.connected).toBe(true);
    expect(connectionResult.connectionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.MAX_CONNECTION_TIME);
    
    console.log(`✅ Connected in ${connectionResult.connectionTime}ms`);
  }, TIMEOUTS.CONNECTION);

  test('should discover all expected MCP tools', async () => {
    const result = await client.listTools();
    
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    
    const discoveredTools = result.data.map((tool: any) => tool.name);
    console.log(`📋 Discovered ${discoveredTools.length} tools:`, discoveredTools);
    
    // Check that we have at least the minimum expected number of tools
    expect(discoveredTools.length).toBeGreaterThanOrEqual(PERFORMANCE_BENCHMARKS.MIN_TOOLS_COUNT);
    
    // Check that all critical tools are present
    const criticalTools = ['setup-repository', 'search_code', 'embed_code', 'get_repository_info'];
    
    for (const tool of criticalTools) {
      expect(discoveredTools).toContain(tool);
    }
    
    console.log(`✅ All ${criticalTools.length} critical tools discovered`);
  }, TIMEOUTS.TOOL_EXECUTION);
  test('should list MCP resources', async () => {
    const result = await client.listResources();
    
    expect(result.success).toBe(true);
    expect(result.executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.MAX_TOOL_RESPONSE_TIME);
    
    console.log(`📚 Found ${result.data?.length || 0} resources`);
  }, TIMEOUTS.TOOL_EXECUTION);

  test('should list MCP prompts', async () => {
    const result = await client.listPrompts();
    
    expect(result.success).toBe(true);
    expect(result.executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.MAX_TOOL_RESPONSE_TIME);
    
    console.log(`💬 Found ${result.data?.length || 0} prompts`);
  }, TIMEOUTS.TOOL_EXECUTION);
});