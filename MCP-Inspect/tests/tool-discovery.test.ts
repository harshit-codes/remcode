/**
 * MCP Tool Discovery Tests
 * 
 * Test discovery and validation of all MCP tools
 */

import { MCPInspectorClient } from '../helpers/mcp-client';
import { PERFORMANCE_BENCHMARKS } from '../helpers/test-config';

describe('MCP Tool Discovery', () => {
  let client: MCPInspectorClient;
  let discoveredTools: any[] = [];

  beforeAll(async () => {
    client = new MCPInspectorClient();
    
    // Get the list of tools once for all tests
    const result = await client.listTools();
    expect(result.success).toBe(true);
    discoveredTools = result.data || [];
  });

  test('should discover minimum number of tools', () => {
    expect(discoveredTools.length).toBeGreaterThanOrEqual(PERFORMANCE_BENCHMARKS.MIN_TOOLS_COUNT);
    console.log(`✅ Found ${discoveredTools.length} tools (minimum ${PERFORMANCE_BENCHMARKS.MIN_TOOLS_COUNT})`);
  });

  test('should have valid tool schemas', () => {
    for (const tool of discoveredTools) {
      // Each tool should have required properties
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
      
      // Validate tool name format (should be kebab-case or snake_case)
      expect(tool.name).toMatch(/^[a-z][a-z0-9_-]*[a-z0-9]$/);
      
      // Description should be non-empty
      expect(tool.description.length).toBeGreaterThan(0);
      
      // Input schema should be an object
      expect(typeof tool.inputSchema).toBe('object');
    }
    
    console.log(`✅ All ${discoveredTools.length} tools have valid schemas`);
  });

  test('should include all critical tools', () => {
    const criticalTools = ['setup-repository', 'search_code', 'embed_code'];
    const toolNames = discoveredTools.map(t => t.name);
    
    for (const tool of criticalTools) {
      expect(toolNames).toContain(tool);
    }
    
    console.log(`✅ All ${criticalTools.length} critical tools found`);
  });

  test('should print all discovered tools', () => {
    console.log('\n📋 All discovered MCP tools:');
    discoveredTools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name} - ${tool.description}`);
    });
  });
});