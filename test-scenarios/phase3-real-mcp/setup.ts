/**
 * Phase 3 Test Setup
 * Global setup for real MCP HTTP server testing
 */

import { execSync } from 'child_process';
import * as path from 'path';
import RealMCPClient from './helpers/real-mcp-client';

// Global client for cleanup
let globalMCPClient: RealMCPClient | null = null;

// Extend Jest timeout for real server execution
jest.setTimeout(60000);

beforeAll(async () => {
  console.log('🚀 Phase 3: Real MCP HTTP Server Testing Setup');
  
  // Check if remcode build exists
  const distPath = path.join(process.cwd(), 'dist');
  
  try {
    require.resolve(distPath);
    console.log('✅ Remcode build found');
  } catch (error) {
    console.log('⚠️  Building remcode...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Remcode built successfully');
    } catch (buildError) {
      console.error('❌ Failed to build remcode');
      console.error('Please run: npm run build');
      process.exit(1);
    }
  }
  
  // Initialize global client for later cleanup
  globalMCPClient = new RealMCPClient();
  
  console.log('🎯 Starting Phase 3 real MCP HTTP server testing...\n');
});

afterAll(async () => {
  console.log('\n🧹 Cleaning up Phase 3 testing...');
  
  if (globalMCPClient) {
    await globalMCPClient.cleanup();
    console.log('✅ MCP server stopped');
  }
  
  console.log('✅ Phase 3: Real MCP HTTP Server Testing Complete');
});
