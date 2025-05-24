/**
 * Comprehensive Enhanced MCP Tools Test
 * 
 * Validates all enhanced tool definitions and their metadata
 */

const { enhancedToolsRegistry } = require('../enhanced-tools-registry-updated');

function runComprehensiveTest() {
  console.log('🧪 Running Comprehensive Enhanced MCP Tools Test\n');

  try {
    // Test 1: Registry Initialization
    console.log('📋 Test 1: Registry Initialization');
    const summary = enhancedToolsRegistry.getToolSummary();
    console.log(`✓ Registry initialized with ${summary.totalTools} tools`);
    console.log(`✓ Categories: ${summary.categories.join(', ')}`);
    console.log(`✓ Priority distribution:`, summary.priorityDistribution);
    console.log(`✓ Category stats:`, summary.categoryStats);
    console.log();

    // Test 2: Tool Validation
    console.log('✅ Test 2: Tool Validation');
    const allTools = enhancedToolsRegistry.getAllTools();
    const validationIssues = [];

    allTools.forEach(tool => {
      // Check required fields
      if (!tool.name) validationIssues.push(`Missing name in tool`);
      if (!tool.description) validationIssues.push(`${tool.name}: Missing description`);
      if (!tool.category) validationIssues.push(`${tool.name}: Missing category`);
      if (!tool.tags || tool.tags.length === 0) validationIssues.push(`${tool.name}: Missing tags`);
      if (!tool.priority) validationIssues.push(`${tool.name}: Missing priority`);
      if (!tool.aiGuidance?.whenToUse) validationIssues.push(`${tool.name}: Missing AI guidance`);
      if (!tool.estimatedDuration) validationIssues.push(`${tool.name}: Missing estimated duration`);
      if (!tool.rateLimit) validationIssues.push(`${tool.name}: Missing rate limit`);

      // Check parameter types
      Object.entries(tool.parameters).forEach(([paramName, param]) => {
        if (!param.type) validationIssues.push(`${tool.name}.${paramName}: Missing parameter type`);
        if (param.required === undefined) validationIssues.push(`${tool.name}.${paramName}: Missing required flag`);
        if (!param.description) validationIssues.push(`${tool.name}.${paramName}: Missing description`);
      });
    });

    if (validationIssues.length === 0) {
      console.log(`✓ All ${allTools.length} tools passed validation`);
    } else {
      console.log(`✗ Found ${validationIssues.length} validation issues:`);
      validationIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    console.log();

    // Test 3: Category Organization
    console.log('📂 Test 3: Category Organization');
    summary.categories.forEach(category => {
      const categoryTools = enhancedToolsRegistry.getToolsByCategory(category);
      console.log(`✓ ${category}: ${categoryTools.length} tools - ${categoryTools.map(t => t.name).join(', ')}`);
    });
    console.log();

    // Test 4: Priority Organization
    console.log('⭐ Test 4: Priority Organization');
    ['critical', 'high', 'medium', 'low'].forEach(priority => {
      const priorityTools = enhancedToolsRegistry.getToolsByPriority(priority);
      if (priorityTools.length > 0) {
        console.log(`✓ ${priority}: ${priorityTools.length} tools - ${priorityTools.map(t => t.name).join(', ')}`);
      }
    });
    console.log();

    // Test 5: AI Guidance Coverage
    console.log('🤖 Test 5: AI Guidance Coverage');
    const guidanceIssues = [];
    allTools.forEach(tool => {
      const guidance = tool.aiGuidance;
      if (!guidance.scenarios || guidance.scenarios.length === 0) {
        guidanceIssues.push(`${tool.name}: No scenarios defined`);
      }
      if (!guidance.dependencies || guidance.dependencies.length === 0) {
        guidanceIssues.push(`${tool.name}: No dependencies defined`);
      }
      if (!guidance.suggestedFollowUp || guidance.suggestedFollowUp.length === 0) {
        guidanceIssues.push(`${tool.name}: No follow-up suggestions`);
      }
    });

    if (guidanceIssues.length === 0) {
      console.log('✓ All tools have complete AI guidance');
    } else {
      console.log(`✗ Found ${guidanceIssues.length} AI guidance issues:`);
      guidanceIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    console.log();

    // Test 6: Tool Discovery Simulation
    console.log('🔍 Test 6: Tool Discovery Simulation');
    const testScenarios = [
      { query: 'setup', expectedTools: ['setup-repository', 'check-prerequisites'] },
      { query: 'search', expectedTools: ['search'] },
      { query: 'status', expectedTools: ['get-repository-status'] },
      { query: 'processing', expectedTools: ['trigger-reprocessing'] },
      { query: 'guidance', expectedTools: ['default-prompt', 'get-scenarios'] }
    ];

    testScenarios.forEach(scenario => {
      const foundTools = allTools.filter(tool => 
        tool.name.includes(scenario.query) || 
        tool.description.toLowerCase().includes(scenario.query) ||
        tool.tags.some(tag => tag.includes(scenario.query))
      );
      
      const foundNames = foundTools.map(t => t.name);
      const hasExpected = scenario.expectedTools.every(expected => 
        foundNames.some(found => found.includes(expected.split('-')[0]))
      );
      
      if (hasExpected) {
        console.log(`✓ "${scenario.query}" discovery: found ${foundNames.join(', ')}`);
      } else {
        console.log(`✗ "${scenario.query}" discovery: expected tools not found`);
      }
    });

    console.log('\n🎉 Comprehensive test completed!');
    
    if (validationIssues.length === 0 && guidanceIssues.length === 0) {
      console.log('✅ All tests passed - Enhanced MCP tools are ready for integration!');
      return true;
    } else {
      console.log('⚠️  Some issues found - please review and fix before integration');
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  runComprehensiveTest();
}

module.exports = { runComprehensiveTest };
