#!/usr/bin/env node

/**
 * MCP Inspector Test Runner
 */

import { MCPTestServer } from './inspector';

async function main() {
  const testServer = new MCPTestServer();
  
  console.log('🚀 Starting MCP Test Server for Inspector Testing...\n');
  
  try {
    await testServer.start();
    
    console.log('📋 Available MCP Tools to test:');
    console.log('🔧 Setup: setup_repository, get_repository_status, list_repositories');
    console.log('🔍 Search: search_code, get_code_context, find_similar_code');
    console.log('⚙️ Processing: trigger_reprocessing, get_processing_status');
    console.log('👷 SWE: default_prompt, get_scenarios');
    console.log('\nPress Ctrl+C to stop the server');
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping MCP Test Server...');
      await testServer.stop();
      process.exit(0);
    });
    
    // Keep running
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Failed to start MCP Test Server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
