#!/usr/bin/env node

/**
 * JSDoc Addition Tool
 * 
 * Automatically adds JSDoc comments to functions that are missing them
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  sourceDir: 'src',
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
 * Generate JSDoc comment for a function
 */
function generateJSDoc(functionSignature, functionName) {
  // Extract parameters from function signature
  const paramMatch = functionSignature.match(/\(([^)]*)\)/);
  const params = paramMatch ? paramMatch[1].split(',').map(p => p.trim()).filter(p => p) : [];
  
  // Extract return type if present
  const returnMatch = functionSignature.match(/:\s*([^{]*?)\s*[{=]/);
  const returnType = returnMatch ? returnMatch[1].trim() : 'void';
  
  let jsdoc = `/**\n * ${functionName} function\n *\n`;
  
  // Add description placeholder
  jsdoc += ` * @description TODO: Add description\n`;
  
  // Add parameters
  params.forEach(param => {
    const cleanParam = param.split(':')[0].trim();
    if (cleanParam && cleanParam !== '') {
      jsdoc += ` * @param {any} ${cleanParam} TODO: Add parameter description\n`;
    }
  });
  
  // Add return type
  if (returnType !== 'void' && returnType !== '') {
    jsdoc += ` * @returns {${returnType}} TODO: Add return description\n`;
  }
  
  jsdoc += ` */`;
  
  return jsdoc;
}

/**
 * Add JSDoc to a file
 */
function addJSDocToFile(filePath, dryRun = true) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Check if file already has JSDoc
  if (content.includes('/**')) {
    log.info(`${filePath} already has JSDoc comments`);
    return false;
  }
  
  // Find function declarations
  const functionPatterns = [
    /^export\s+(async\s+)?function\s+(\w+)/,
    /^export\s+default\s+(async\s+)?function\s*(\w*)/,
    /^export\s+const\s+(\w+)\s*=\s*(async\s+)?\(/,
    /^(async\s+)?function\s+(\w+)/
  ];
  
  let modified = false;
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let functionFound = false;
    let functionName = '';
    
    // Check each pattern
    for (const pattern of functionPatterns) {
      const match = line.match(pattern);
      if (match) {
        functionName = match[2] || match[1] || match[4] || 'anonymous';
        functionFound = true;
        break;
      }
    }
    
    if (functionFound && functionName) {
      // Check if previous line is already JSDoc
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      if (!prevLine.endsWith('*/')) {
        // Add JSDoc before the function
        const jsdoc = generateJSDoc(line, functionName);
        newLines.push(jsdoc);
        modified = true;
        log.info(`Added JSDoc for function: ${functionName}`);
      }
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    if (!dryRun) {
      fs.writeFileSync(filePath, newLines.join('\n'));
      log.success(`Updated ${filePath}`);
    } else {
      log.warning(`Would update ${filePath} (dry run)`);
    }
    return true;
  }
  
  return false;
}

/**
 * Main function to add JSDoc to all files
 */
function addJSDocToProject(dryRun = true) {
  log.header('📚 Adding JSDoc comments to functions...');
  
  if (dryRun) {
    log.warning('DRY RUN MODE - No files will be modified');
  }
  
  const files = glob.sync(`${CONFIG.sourceDir}/**/*.ts`, {
    ignore: ['**/*.test.ts', '**/types.ts']
  });
  
  let filesModified = 0;
  
  files.forEach(file => {
    // Check if file has functions
    const content = fs.readFileSync(file, 'utf8');
    const hasFunctions = /export\s+(async\s+)?function|^(async\s+)?function|export\s+const\s+\w+\s*=\s*\(/m.test(content);
    
    if (hasFunctions) {
      const wasModified = addJSDocToFile(file, dryRun);
      if (wasModified) filesModified++;
    }
  });
  
  log.header('📊 JSDoc Addition Summary');
  log.info(`Files processed: ${files.length}`);
  log.info(`Files that needed JSDoc: ${filesModified}`);
  
  if (dryRun) {
    log.warning('No files were actually modified (dry run)');
    log.info('Use --apply flag to apply changes');
  } else {
    log.success('JSDoc comments added successfully!');
  }
}

// Run the tool
if (require.main === module) {
  const applyChanges = process.argv.includes('--apply');
  addJSDocToProject(!applyChanges);
}

module.exports = {
  generateJSDoc,
  addJSDocToFile,
  addJSDocToProject
};
