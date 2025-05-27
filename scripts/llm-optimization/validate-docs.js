#!/usr/bin/env node

/**
 * LLM Optimization Validation Tool
 * 
 * Node.js-based validation for better reliability and cross-platform support
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  sourceDir: 'src',
  docsDir: 'docs/generated',
  excludePatterns: ['**/*.test.ts', '**/types.ts', '**/index.ts'],
  colors: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
  }
};

// Logging utilities
const log = {
  success: (msg) => console.log(`${CONFIG.colors.green}✅ ${msg}${CONFIG.colors.reset}`),
  error: (msg) => console.log(`${CONFIG.colors.red}❌ ${msg}${CONFIG.colors.reset}`),
  warning: (msg) => console.log(`${CONFIG.colors.yellow}⚠️  ${msg}${CONFIG.colors.reset}`),
  info: (msg) => console.log(`${CONFIG.colors.blue}ℹ️  ${msg}${CONFIG.colors.reset}`),
  header: (msg) => console.log(`\n${CONFIG.colors.blue}${msg}${CONFIG.colors.reset}`)
};

/**
 * Check single function per file compliance
 */
function checkSingleFunctionCompliance() {
  log.header('📁 Checking single function per file compliance...');
  
  const files = glob.sync(`${CONFIG.sourceDir}/**/*.ts`, {
    ignore: CONFIG.excludePatterns
  });
  
  const violations = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Count different types of function declarations
    const functionPatterns = [
      /^export\s+(async\s+)?function\s+\w+/gm,
      /^export\s+default\s+(async\s+)?function/gm,
      /^(async\s+)?function\s+\w+/gm,
      /^export\s+const\s+\w+\s*=\s*(async\s+)?\(/gm
    ];
    
    let totalFunctions = 0;
    functionPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      totalFunctions += matches.length;
    });
    
    if (totalFunctions > 1) {
      violations.push({ file, count: totalFunctions });
      log.error(`Multiple functions in ${file} (${totalFunctions} functions found)`);
    }
  });
  
  if (violations.length === 0) {
    log.success('Single function per file compliance: PASSED');
    return true;
  } else {
    log.error(`Found ${violations.length} files violating single function per file rule`);
    return false;
  }
}

/**
 * Check JSDoc documentation completeness
 */
function checkJSDocCompleteness() {
  log.header('📚 Checking JSDoc documentation completeness...');
  
  const files = glob.sync(`${CONFIG.sourceDir}/**/*.ts`, {
    ignore: [...CONFIG.excludePatterns, '**/types.ts']
  });
  
  const missingDocs = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if file has functions
    const hasFunctions = /export\s+(async\s+)?function|^(async\s+)?function|export\s+const\s+\w+\s*=\s*\(/m.test(content);
    
    if (hasFunctions) {
      // Check if file has JSDoc comments
      const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content);
      
      if (!hasJSDoc) {
        missingDocs.push(file);
        log.error(`Missing JSDoc in ${file}`);
      }
    }
  });
  
  if (missingDocs.length === 0) {
    log.success('JSDoc documentation completeness: PASSED');
    return true;
  } else {
    log.error(`Found ${missingDocs.length} files missing JSDoc documentation`);
    return false;
  }
}

/**
 * Check file organization standards
 */
function checkFileOrganization() {
  log.header('🗂️ Checking file organization standards...');
  
  const requiredDirs = [
    'commands', 'mcp', 'processing', 'search', 
    'setup', 'utils', 'vectorizers', 'workflows'
  ];
  
  const issues = [];
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(CONFIG.sourceDir, dir);
    if (!fs.existsSync(dirPath)) {
      issues.push(`Missing core directory: ${dir}`);
    }
  });
  
  if (issues.length === 0) {
    log.success('File organization standards: PASSED');
    return true;
  } else {
    log.error(`Found ${issues.length} file organization issues`);
    issues.forEach(issue => console.log(`  - ${issue}`));
    return false;
  }
}

/**
 * Check type safety
 */
function checkTypeSafety() {
  log.header('🎯 Checking type safety and documentation...');
  
  const files = glob.sync(`${CONFIG.sourceDir}/**/*.ts`);
  
  let anyTypeUsage = 0;
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const anyMatches = content.match(/:\s*any\b|<any>/g) || [];
    anyTypeUsage += anyMatches.length;
  });
  
  if (anyTypeUsage > 10) {
    log.warning(`High usage of 'any' type found (${anyTypeUsage} occurrences)`);
    return false;
  } else {
    log.success('Type safety and documentation: PASSED');
    return true;
  }
}

/**
 * Generate compliance metrics
 */
function generateMetrics(results) {
  const totalFiles = glob.sync(`${CONFIG.sourceDir}/**/*.ts`).length;
  const compliantFiles = results.filter(r => r).length;
  const compliancePercentage = Math.round((compliantFiles / results.length) * 100);
  
  const metrics = {
    timestamp: new Date().toISOString(),
    totalFiles,
    validationResults: {
      singleFunctionCompliance: results[0],
      jsdocCompleteness: results[1],
      fileOrganization: results[2],
      typeSafety: results[3]
    },
    overallCompliance: compliancePercentage
  };
  
  // Ensure docs directory exists
  if (!fs.existsSync(CONFIG.docsDir)) {
    fs.mkdirSync(CONFIG.docsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(CONFIG.docsDir, 'validation-metrics.json'),
    JSON.stringify(metrics, null, 2)
  );
  
  return metrics;
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating LLM-optimized documentation standards...');
  
  const results = [
    checkSingleFunctionCompliance(),
    checkJSDocCompleteness(),
    checkFileOrganization(),
    checkTypeSafety()
  ];
  
  const metrics = generateMetrics(results);
  
  // Summary
  log.header('📊 Validation Summary');
  console.log('======================================');
  
  const allPassed = results.every(r => r);
  
  if (allPassed) {
    log.success('All critical validations passed!');
    log.success('✅ Ready for commit!');
    process.exit(0);
  } else {
    log.error('Some validations failed:');
    const failedChecks = [
      'Single function compliance',
      'JSDoc completeness', 
      'File organization',
      'Type safety'
    ];
    
    results.forEach((result, index) => {
      if (!result) {
        console.log(`  - ${failedChecks[index]}: FAILED`);
      }
    });
    
    console.log('');
    log.info('Run the optimization tools to fix these issues');
    log.info(`Overall compliance: ${metrics.overallCompliance}%`);
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  main();
}

module.exports = {
  checkSingleFunctionCompliance,
  checkJSDocCompleteness,
  checkFileOrganization,
  checkTypeSafety,
  generateMetrics
};
