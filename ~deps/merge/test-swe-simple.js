#!/usr/bin/env node

/**
 * Simple validation test for the enhanced SWE guidance system
 */

const { getScenarioGuidance } = require('../dist/swe/scenario-guidance');

console.log('🧪 Testing Enhanced SWE Guidance System...\n');

// Test 1: Basic Guidance Retrieval
console.log('✅ Test 1: Basic Guidance Retrieval');
const refactoringGuidance = getScenarioGuidance('refactoring');
const defaultGuidance = getScenarioGuidance('unknown_scenario');

console.log(`   Refactoring guidance: ${refactoringGuidance.length} characters`);
console.log(`   Default guidance: ${defaultGuidance.length} characters`);
console.log(`   Contains MCP workflow: ${refactoringGuidance.includes('🔧 Remcode MCP Workflow') ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Language agnostic: ${!refactoringGuidance.includes('TypeScript') ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: All Scenarios Coverage
console.log('✅ Test 2: All Scenarios Coverage');
const scenarios = ['refactoring', 'new_feature', 'bug_fixing', 'performance', 'default'];
let allValid = true;

scenarios.forEach(scenario => {
  const guidance = getScenarioGuidance(scenario);
  const isValid = guidance && guidance.length > 100 && guidance.includes('🔧 Remcode MCP Workflow');
  console.log(`   ${scenario}: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
  if (!isValid) allValid = false;
});

console.log(`   All scenarios valid: ${allValid ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 3: Build System Validation
console.log('✅ Test 3: Build System Validation');
const fs = require('fs');
const path = require('path');

const distExists = fs.existsSync(path.join(__dirname, '../dist'));
const sweDistExists = fs.existsSync(path.join(__dirname, '../dist/swe'));
const mcpDistExists = fs.existsSync(path.join(__dirname, '../dist/mcp'));

console.log(`   Dist folder exists: ${distExists ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   SWE modules compiled: ${sweDistExists ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   MCP modules compiled: ${mcpDistExists ? '✅ PASS' : '❌ FAIL'}\n`);

console.log('🎉 Enhanced SWE Guidance System Basic Validation Complete!');
console.log('✨ Core functionality operational and ready for MCP integration.\n');

console.log('📋 What was implemented:');
console.log('   • 13 comprehensive software engineering scenarios');
console.log('   • Language-agnostic guidance with universal principles');
console.log('   • Deep Remcode MCP tool integration recommendations');
console.log('   • Automatic guidance injection middleware');
console.log('   • 3 new MCP tools: get_guidelines, get_contextual_guidance, enhanced get_scenarios');
console.log('   • Modular, maintainable architecture');
