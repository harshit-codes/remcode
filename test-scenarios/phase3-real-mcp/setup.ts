/**
 * Phase 3 Test Setup
 * Global setup for real MCP Inspector testing
 */

import { execSync } from 'child_process';
import * as path from 'path';

// Extend Jest timeout for real CLI execution
jest.setTimeout(30000);

beforeAll(async () => {
  console.log('🚀 Phase 3: Real MCP Inspector Testing Setup');
  
  // Ensure remcode STDIO bridge exists
  const stdioPath = path.join(process.cwd(), 'bin', 'remcode-stdio.js');
  
  try {
    require.resolve(stdioPath);
    console.log('✅ Remcode STDIO bridge found');
  } catch (error) {
    console.error('❌ Remcode STDIO bridge not found at:', stdioPath);
    console.error('Please run: npm run build');
    process.exit(1);
  }
  
  // Check if MCP Inspector is available
  try {
    execSync('npx @modelcontextprotocol/inspector --version', { stdio: 'ignore' });
    console.log('✅ MCP Inspector available');
  } catch (error) {
    console.warn('⚠️  MCP Inspector not available, installing...');
    try {
      execSync('npm install -g @modelcontextprotocol/inspector', { stdio: 'inherit' });
      console.log('✅ MCP Inspector installed');
    } catch (installError) {
      console.error('❌ Failed to install MCP Inspector');
      console.error('Please install manually: npm install -g @modelcontextprotocol/inspector');
    }
  }
  
  console.log('🎯 Starting Phase 3 real MCP testing...\n');
});

afterAll(() => {
  console.log('\n✅ Phase 3: Real MCP Inspector Testing Complete');
});
