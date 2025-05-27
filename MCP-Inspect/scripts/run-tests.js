#!/usr/bin/env node

/**
 * MCP Inspector Test Runner
 * 
 * Run all MCP Inspector tests for Remcode
 */

const { spawn } = require('child_process');
const path = require('path');

const testSuites = [
  'connection.test.ts',
  'tool-discovery.test.ts', 
  'basic-execution.test.ts'
];

async function runTest(testFile) {
  console.log(`\n🧪 Running ${testFile}...`);
  
  return new Promise((resolve, reject) => {
    const testPath = path.join(__dirname, '../tests', testFile);
    const jest = spawn('npx', ['jest', testPath, '--verbose'], {
      cwd: path.join(__dirname, '../../..'),
      stdio: 'inherit',
      env: { 
        ...process.env,
        TEST_MODE: 'true',
        LOG_LEVEL: 'info'
      }
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} passed`);
        resolve();
      } else {
        console.log(`❌ ${testFile} failed with code ${code}`);
        reject(new Error(`Test failed: ${testFile}`));
      }
    });
  });
}
async function runAllTests() {
  console.log('🚀 Starting MCP Inspector Tests for Remcode');
  console.log('=' * 50);
  
  const startTime = Date.now();
  let passedTests = 0;
  let failedTests = 0;

  for (const testFile of testSuites) {
    try {
      await runTest(testFile);
      passedTests++;
    } catch (error) {
      console.error(`Failed to run ${testFile}:`, error.message);
      failedTests++;
    }
  }

  const totalTime = Date.now() - startTime;
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⏱️  Total time: ${totalTime}ms`);
  
  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 All MCP Inspector tests passed!');
    process.exit(0);
  }
}

if (require.main === module) {
  runAllTests().catch(console.error);
}