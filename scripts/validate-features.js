#!/usr/bin/env node

/**
 * Enhanced NPX Package Status Validation
 * 
 * Quick validation of key enhanced features
 */

const { execSync } = require('child_process');

function validateFeatures() {
  console.log('🚀 Enhanced NPX Package - Feature Validation\n');
  
  const tests = [
    {
      name: 'Help Command Enhancement',
      test: () => {
        const help = execSync('npx remcode serve --help', { encoding: 'utf8' });
        return help.includes('--skip-token-collection') && help.includes('GitHub Personal');
      }
    },
    {
      name: 'Token Manager Import',
      test: () => {
        try {
          require('../dist/utils/token-manager.js');
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Port Manager Import', 
      test: () => {
        try {
          require('../dist/utils/port-manager.js');
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Enhanced Tests Passing',
      test: () => {
        try {
          execSync('npm run test:unit -- enhanced-serve', { stdio: 'pipe' });
          return true;
        } catch (error) {
          return false;
        }
      }
    }
  ];
  
  let passed = 0;
  
  tests.forEach(({ name, test }) => {
    try {
      const result = test();
      console.log(result ? '✅' : '❌', name);
      if (result) passed++;
    } catch (error) {
      console.log('❌', name, '- Error:', error.message);
    }
  });
  
  console.log(`\n📊 Results: ${passed}/${tests.length} features validated`);
  
  if (passed === tests.length) {
    console.log('🎉 All enhanced features working correctly!');
  }
}

if (require.main === module) {
  validateFeatures();
}
