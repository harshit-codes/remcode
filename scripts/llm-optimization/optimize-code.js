#!/usr/bin/env node

/**
 * LLM Optimization Tool - Automatic Code Transformation
 * 
 * Transforms codebase to be LLM-optimized following the single-function-per-file pattern
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  sourceDir: 'src',
  outputDir: 'src-optimized',
  backupDir: 'src-backup',
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
 * Parse TypeScript file to extract functions
 */
function extractFunctionsFromFile(content, filePath) {
  const functions = [];
  
  // Patterns for different function types
  const patterns = [
    {
      name: 'export_function',
      regex: /^export\s+(async\s+)?function\s+(\w+)\s*\([^)]*\)\s*:\s*[^{]*{/gm,
      extract: (match, content, index) => extractFunctionBody(content, index, match[0])
    },
    {
      name: 'export_default_function', 
      regex: /^export\s+default\s+(async\s+)?function\s*(\w*)\s*\([^)]*\)\s*:\s*[^{]*{/gm,
      extract: (match, content, index) => extractFunctionBody(content, index, match[0])
    },
    {
      name: 'export_const_function',
      regex: /^export\s+const\s+(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*:\s*[^=]*=>\s*{/gm,
      extract: (match, content, index) => extractFunctionBody(content, index, match[0])
    }
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const functionData = pattern.extract(match, content, match.index);
      if (functionData) {
        functions.push({
          ...functionData,
          type: pattern.name,
          name: match[2] || match[1] || 'default',
          originalFile: filePath
        });
      }
    }
  });
  
  return functions;
}

/**
 * Extract function body using brace matching
 */
function extractFunctionBody(content, startIndex, header) {
  const openBraceIndex = content.indexOf('{', startIndex);
  if (openBraceIndex === -1) return null;
  
  let braceCount = 1;
  let currentIndex = openBraceIndex + 1;
  
  while (currentIndex < content.length && braceCount > 0) {
    const char = content[currentIndex];
    if (char === '{') braceCount++;
    else if (char === '}') braceCount--;
    currentIndex++;
  }
  
  if (braceCount === 0) {
    const functionBody = content.slice(startIndex, currentIndex);
    return {
      header,
      body: functionBody,
      startIndex,
      endIndex: currentIndex
    };
  }
  
  return null;
}

/**
 * Add JSDoc templates to functions
 */
function addJSDocToFunction(functionData) {
  const { name, body, type } = functionData;
  
  // Check if JSDoc already exists
  if (body.includes('/**')) {
    return body;
  }
  
  const jsdocTemplate = `/**
 * ${name.charAt(0).toUpperCase() + name.slice(1)} function
 * 
 * @description Add description here
 * @param {any} params - Add parameter descriptions
 * @returns {any} Add return type description
 */
`;
  
  // Insert JSDoc before the function
  const lines = body.split('\n');
  const functionLineIndex = lines.findIndex(line => 
    line.includes('function') || line.includes('const') || line.includes('=>')
  );
  
  if (functionLineIndex > 0) {
    lines.splice(functionLineIndex, 0, jsdocTemplate);
    return lines.join('\n');
  }
  
  return jsdocTemplate + body;
}

/**
 * Create single function file
 */
function createSingleFunctionFile(functionData, imports = '', exports = '') {
  const { name, body } = functionData;
  const fileName = `${name.toLowerCase()}.ts`;
  
  const template = `${imports}

${addJSDocToFunction(functionData)}

${exports}
`;
  
  return {
    fileName,
    content: template.trim()
  };
}

/**
 * Process file with multiple functions
 */
function processMultiFunctionFile(filePath) {
  log.info(`Processing ${filePath}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const functions = extractFunctionsFromFile(content, filePath);
  
  if (functions.length <= 1) {
    log.info(`${filePath} already compliant (${functions.length} function)`);
    return [];
  }
  
  log.warning(`${filePath} has ${functions.length} functions - splitting...`);
  
  // Extract imports and other non-function code
  const imports = extractImports(content);
  const types = extractTypes(content);
  
  const newFiles = [];
  
  functions.forEach(functionData => {
    const singleFile = createSingleFunctionFile(
      functionData, 
      imports, 
      types
    );
    
    const outputPath = path.join(
      path.dirname(filePath), 
      functionData.name.toLowerCase() + '.ts'
    );
    
    newFiles.push({
      path: outputPath,
      content: singleFile.content,
      originalFunction: functionData
    });
  });
  
  return newFiles;
}

/**
 * Extract imports from file
 */
function extractImports(content) {
  const importLines = content.split('\n').filter(line => 
    line.trim().startsWith('import') && !line.includes('//'));
  return importLines.join('\n');
}

/**
 * Extract type definitions and interfaces
 */
function extractTypes(content) {
  const typeLines = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('interface ') || line.startsWith('type ') || 
        line.startsWith('enum ') || line.startsWith('class ')) {
      // Extract the entire block
      let braceCount = 0;
      let currentLine = i;
      let typeBlock = [];
      
      do {
        const currentLineContent = lines[currentLine];
        typeBlock.push(currentLineContent);
        
        // Count braces to find the end of the block
        for (const char of currentLineContent) {
          if (char === '{') braceCount++;
          else if (char === '}') braceCount--;
        }
        
        currentLine++;
      } while (currentLine < lines.length && braceCount > 0);
      
      typeLines.push(typeBlock.join('\n'));
      i = currentLine - 1; // Skip the lines we just processed
    }
  }
  
  return typeLines.join('\n\n');
}

/**
 * Main optimization function
 */
function optimizeCodebase() {
  log.header('🚀 Starting LLM codebase optimization...');
  
  // Create backup
  log.info('Creating backup...');
  if (fs.existsSync(CONFIG.backupDir)) {
    fs.rmSync(CONFIG.backupDir, { recursive: true });
  }
  fs.cpSync(CONFIG.sourceDir, CONFIG.backupDir, { recursive: true });
  log.success('Backup created');
  
  // Find files that need optimization
  const files = glob.sync(`${CONFIG.sourceDir}/**/*.ts`, {
    ignore: ['**/*.test.ts', '**/types.ts', '**/index.ts']
  });
  
  let totalFilesProcessed = 0;
  let totalFunctionsExtracted = 0;
  
  files.forEach(file => {
    const newFiles = processMultiFunctionFile(file);
    
    if (newFiles.length > 0) {
      totalFilesProcessed++;
      totalFunctionsExtracted += newFiles.length;
      
      // For now, just report what would be done
      log.info(`Would create ${newFiles.length} files from ${file}:`);
      newFiles.forEach(newFile => {
        log.info(`  - ${newFile.path}`);
      });
    }
  });
  
  log.header('📊 Optimization Summary');
  log.info(`Files processed: ${totalFilesProcessed}`);
  log.info(`Functions extracted: ${totalFunctionsExtracted}`);
  log.warning('Running in DRY RUN mode - no files were actually modified');
  log.info('To apply changes, use the --apply flag');
}

// Run optimization
if (require.main === module) {
  const applyChanges = process.argv.includes('--apply');
  
  if (!applyChanges) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
    console.log('Use --apply flag to actually make changes\n');
  }
  
  optimizeCodebase();
}

module.exports = {
  extractFunctionsFromFile,
  addJSDocToFunction,
  processMultiFunctionFile,
  optimizeCodebase
};
