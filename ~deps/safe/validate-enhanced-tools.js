#!/usr/bin/env node

/**
 * Final Validation Script for Enhanced MCP Tools
 */

const { getAllEnhancedTools, getEnhancedMCPSpec } = require('./tool-integration-final');

console.log('🔍 Enhanced MCP Tools Validation\n');

try {
  // Test 1: Tool Loading
  console.log('📋 Loading enhanced tools...');
  const tools = getAllEnhancedTools();
  console.log(`✅ Successfully loaded ${tools.length} enhanced tools\n`);

  // Test 2: Tool Validation
  console.log('🔧 Validating tool structure...');
  let valid = true;
  
  tools.forEach((tool, index) => {
    const issues = [];
    
    if (!tool.name) issues.push('Missing name');
    if (!tool.description) issues.push('Missing description');
    if (!tool.category) issues.push('Missing category');
    if (!tool.tags || tool.tags.length === 0) issues.push('Missing tags');
    if (!tool.priority) issues.push('Missing priority');
    if (!tool.aiGuidance?.whenToUse) issues.push('Missing AI guidance');
    
    if (issues.length > 0) {
      console.log(`❌ Tool ${index + 1} (${tool.name || 'unnamed'}): ${issues.join(', ')}`);
      valid = false;
    } else {
      console.log(`✅ Tool ${index + 1}: ${tool.name} - Valid`);
    }
  });

  if (!valid) {
    console.log('\n❌ Validation failed - some tools have issues');
    process.exit(1);
  }

  // Test 3: MCP Spec Generation
  console.log('\n📊 Generating MCP specification...');
  const spec = getEnhancedMCPSpec();
  console.log(`✅ Generated spec with ${spec.tools.length} tools`);
  console.log(`✅ Server: ${spec.name} v${spec.version}`);

  // Test 4: Tool Categories
  console.log('\n📂 Tool categorization:');
  const categories = {};
  tools.forEach(tool => {
    if (!categories[tool.category]) {
      categories[tool.category] = [];
    }
    categories[tool.category].push(tool.name);
  });

  Object.entries(categories).forEach(([category, toolNames]) => {
    console.log(`✅ ${category}: ${toolNames.join(', ')}`);
  });

  console.log('\n🎉 All validations passed! Enhanced MCP tools are ready.');
  console.log('\n📝 Next step: Integrate with main MCP server using MCP_INTEGRATION_GUIDE.md');

} catch (error) {
  console.error('\n❌ Validation failed:', error.message);
  process.exit(1);
}
