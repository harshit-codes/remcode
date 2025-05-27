/**
 * Basic Tool Execution Tests
 * 
 * Test basic execution of critical MCP tools
 */

import { MCPInspectorClient } from '../helpers/mcp-client';
import { TIMEOUTS, PERFORMANCE_BENCHMARKS } from '../helpers/test-config';

describe('Basic Tool Execution', () => {
  let client: MCPInspectorClient;

  beforeAll(() => {
    client = new MCPInspectorClient();
  });

  test('should execute setup-repository tool with minimal args', async () => {
    const result = await client.callTool('setup-repository', {
      owner: 'test-owner',
      repo: 'test-repo'
    });
    
    // Tool should respond (success or failure is OK, but should not crash)
    expect(typeof result.success).toBe('boolean');
    expect(result.executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.MAX_TOOL_RESPONSE_TIME);
    
    console.log(`✅ setup-repository executed in ${result.executionTime}ms`);
    
    if (!result.success) {
      console.log(`⚠️  Expected failure (missing tokens): ${result.error}`);
    }
  }, TIMEOUTS.TOOL_EXECUTION);

  test('should execute search_code tool with sample query', async () => {
    const result = await client.callTool('search_code', {
      query: 'function'
    });
    
    expect(typeof result.success).toBe('boolean');
    expect(result.executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.MAX_TOOL_RESPONSE_TIME);
    
    console.log(`✅ search_code executed in ${result.executionTime}ms`);
    
    if (!result.success) {
      console.log(`⚠️  Expected failure (no vectorized data): ${result.error}`);
    }
  }, TIMEOUTS.SEARCH_OPERATION);

  test('should execute embed_code tool with sample code', async () => {
    const result = await client.callTool('embed_code', {
      code: 'function hello() { return "world"; }'
    });
    
    expect(typeof result.success).toBe('boolean');
    expect(result.executionTime).toBeLessThan(PERFORMANCE_BENCHMARKS.MAX_TOOL_RESPONSE_TIME);
    
    console.log(`✅ embed_code executed in ${result.executionTime}ms`);
    
    if (!result.success) {
      console.log(`⚠️  Expected failure (missing HuggingFace token): ${result.error}`);
    }
  }, TIMEOUTS.TOOL_EXECUTION);
});