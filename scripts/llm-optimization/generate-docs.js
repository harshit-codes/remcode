#!/usr/bin/env node
/**
 * @fileoverview Automated documentation generation for LLM context optimization
 * @module scripts/generateDocs
 * @version 1.0.0
 * @author Remcode Team
 * @since 2024-05-28
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

/**
 * Main documentation generation function
 * 
 * @async
 * @function generateDocumentation
 * @description Generates comprehensive documentation from JSDoc annotations
 * and creates LLM-optimized context files for AI-assisted development.
 * 
 * @param {string} sourceDir - Root directory to scan for TypeScript files
 * @param {Object} [options={}] - Documentation generation options
 * @returns {Promise<Object>} Complete codebase metadata and documentation
 * 
 * @example
 * // Generate documentation for entire project
 * const metadata = await generateDocumentation('./src', {
 *   outputDir: './docs/generated',
 *   generateContext: true,
 *   verbose: true
 * });
 * console.log(`Generated docs for ${metadata.functions.length} functions`);
 */
async function generateDocumentation(sourceDir, options = {}) {
  const startTime = Date.now();
  
  if (options.verbose) {
    console.log('🚀 Starting documentation generation...');
    console.log(`📁 Source directory: ${sourceDir}`);
    console.log(`📄 Output directory: ${options.outputDir || 'docs/generated'}`);
  }

  // Phase 1: Scan TypeScript files
  const typeScriptFiles = await scanTypeScriptFiles(sourceDir);
  if (options.verbose) {
    console.log(`📋 Found ${typeScriptFiles.length} TypeScript files`);
  }

  // Phase 2: Extract basic metadata
  const functions = [];
  const modules = [];
  const types = [];

  for (const filePath of typeScriptFiles) {
    try {
      const fileMetadata = await extractBasicFileMetadata(filePath, sourceDir);
      
      functions.push(...fileMetadata.functions);
      modules.push(fileMetadata.module);
      types.push(...fileMetadata.types);
      
      if (options.verbose) {
        console.log(`✅ Processed ${filePath} (${fileMetadata.functions.length} functions)`);
      }
    } catch (error) {
      console.error(`❌ Failed to process ${filePath}:`, error.message);
    }
  }

  // Phase 3: Calculate metrics
  const metrics = {
    totalFiles: typeScriptFiles.length,
    totalFunctions: functions.length,
    totalTypes: types.length,
    documentationCoverage: calculateDocumentationCoverage(functions),
    singleFunctionCompliance: calculateSingleFunctionCompliance(typeScriptFiles),
    lastGenerated: new Date().toISOString()
  };

  const metadata = {
    functions,
    modules,
    types,
    metrics,
    lastGenerated: new Date().toISOString()
  };

  // Phase 4: Generate documentation files
  if (options.outputDir) {
    await generateDocumentationFiles(metadata, options.outputDir, options);
  }

  const duration = Date.now() - startTime;
  if (options.verbose) {
    console.log(`🎉 Documentation generation complete in ${duration}ms`);
    console.log(`📊 Generated documentation for:`);
    console.log(`  - ${functions.length} functions`);
    console.log(`  - ${modules.length} modules`);
    console.log(`  - ${types.length} types`);
  }

  return metadata;
}

/**
 * Scans directory for TypeScript files
 */
async function scanTypeScriptFiles(sourceDir) {
  const pattern = path.join(sourceDir, '**/*.ts');
  const files = await glob(pattern, {
    ignore: [
      '**/node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/dist/**',
      '**/build/**'
    ]
  });
  
  return files.sort();
}

/**
 * Extracts basic metadata from a TypeScript file
 */
async function extractBasicFileMetadata(filePath, sourceDir) {
  const content = await fs.readFile(filePath, 'utf8');
  
  // Simple regex-based extraction for basic functionality
  const functions = extractFunctionsFromContent(content, filePath);
  const types = extractTypesFromContent(content, filePath);
  
  const relativePath = path.relative(sourceDir, filePath);
  const moduleName = relativePath.replace(/\.ts$/, '').replace(/\//g, '/');
  
  const module = {
    name: moduleName,
    path: filePath,
    description: extractFileDescription(content) || `Module: ${moduleName}`,
    functions,
    types,
    exports: extractExports(content)
  };

  return { functions, module, types };
}

/**
 * Extracts functions from file content using regex
 */
function extractFunctionsFromContent(content, filePath) {
  const functions = [];
  
  // Match function declarations with JSDoc
  const functionRegex = /\/\*\*[\s\S]*?\*\/\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)[^{]*\{/g;
  let match;
  
  while ((match = functionRegex.exec(content)) !== null) {
    const functionName = match[1];
    const jsdocMatch = match[0].match(/\/\*\*[\s\S]*?\*\//);
    const jsdoc = jsdocMatch ? jsdocMatch[0] : '';
    
    functions.push({
      name: functionName,
      description: extractDescriptionFromJSDoc(jsdoc) || `Function ${functionName}`,
      module: path.relative('src', filePath).replace(/\.ts$/, ''),
      filePath,
      hasJSDoc: !!jsdoc,
      isAsync: match[0].includes('async'),
      signature: `function ${functionName}(...)`
    });
  }
  
  return functions;
}

/**
 * Extracts types from file content
 */
function extractTypesFromContent(content, filePath) {
  const types = [];
  
  // Match interface and type declarations
  const typeRegex = /(?:interface|type)\s+(\w+)/g;
  let match;
  
  while ((match = typeRegex.exec(content)) !== null) {
    types.push({
      name: match[1],
      description: `Type ${match[1]}`,
      module: path.relative('src', filePath).replace(/\.ts$/, ''),
      definition: match[0]
    });
  }
  
  return types;
}

/**
 * Extracts description from JSDoc comment
 */
function extractDescriptionFromJSDoc(jsdoc) {
  const match = jsdoc.match(/\*\s*([^@\n]+)/);
  return match ? match[1].trim() : '';
}

/**
 * Extracts file description from file-level JSDoc
 */
function extractFileDescription(content) {
  const match = content.match(/\/\*\*[\s\S]*?@fileoverview\s+([^\n]+)/);
  return match ? match[1].trim() : '';
}

/**
 * Extracts exports from file content
 */
function extractExports(content) {
  const exports = [];
  const exportRegex = /export\s+(?:default\s+)?(?:function\s+)?(\w+)/g;
  let match;
  
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  return exports;
}

/**
 * Calculates documentation coverage percentage
 */
function calculateDocumentationCoverage(functions) {
  if (functions.length === 0) return 100;
  const documented = functions.filter(f => f.hasJSDoc).length;
  return Math.round((documented / functions.length) * 100);
}

/**
 * Calculates single function per file compliance
 */
async function calculateSingleFunctionCompliance(files) {
  let compliantFiles = 0;
  
  for (const file of files) {
    if (file.endsWith('index.ts') || file.endsWith('types.ts')) {
      compliantFiles++;
      continue;
    }
    
    try {
      const content = await fs.readFile(file, 'utf8');
      const functionCount = (content.match(/(?:export\s+)?(?:async\s+)?function\s+\w+/g) || []).length;
      
      if (functionCount <= 1) {
        compliantFiles++;
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return Math.round((compliantFiles / files.length) * 100);
}

/**
 * Generates documentation files
 */
async function generateDocumentationFiles(metadata, outputDir, options) {
  await fs.mkdir(outputDir, { recursive: true });

  // Generate quick reference
  const quickRef = generateQuickReference(metadata);
  await fs.writeFile(path.join(outputDir, 'QUICK_REFERENCE.md'), quickRef);

  // Generate function catalog
  const functionCatalog = generateFunctionCatalog(metadata);
  await fs.writeFile(path.join(outputDir, 'FUNCTION_CATALOG.md'), functionCatalog);

  // Generate metrics
  const metricsJson = JSON.stringify(metadata.metrics, null, 2);
  await fs.writeFile(path.join(outputDir, 'metrics.json'), metricsJson);

  // Generate context directory
  if (options.generateContext) {
    const contextDir = path.join(outputDir, 'context');
    await fs.mkdir(contextDir, { recursive: true });
    
    await fs.writeFile(
      path.join(contextDir, 'METADATA.json'),
      JSON.stringify(metadata, null, 2)
    );
  }

  if (options.verbose) {
    console.log(`📄 Generated documentation files in ${outputDir}`);
  }
}

/**
 * Generates quick reference guide
 */
function generateQuickReference(metadata) {
  const { functions, metrics } = metadata;

  return `# Remcode Quick Reference Guide

*Generated: ${metadata.lastGenerated}*

## Overview

- **Functions**: ${functions.length}
- **Documentation Coverage**: ${metrics.documentationCoverage}%
- **Single Function Compliance**: ${metrics.singleFunctionCompliance}%

## Functions

${functions.map(func => `
### \`${func.name}\`

**Description**: ${func.description}  
**Module**: \`${func.module}\`  
**File**: \`${func.filePath}\`  
**Documented**: ${func.hasJSDoc ? '✅' : '❌'}  
**Async**: ${func.isAsync ? '✅' : '❌'}

\`\`\`typescript
${func.signature}
\`\`\`
`).join('\n')}

## Common Patterns

### Async Function Pattern
\`\`\`typescript
export default async function functionName(
  param: string,
  options: Options = {}
): Promise<Result> {
  // Implementation
}
\`\`\`

### Error Handling Pattern
\`\`\`typescript
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}
\`\`\`
`;
}

/**
 * Generates function catalog
 */
function generateFunctionCatalog(metadata) {
  const { functions, modules } = metadata;

  const functionsByModule = functions.reduce((acc, func) => {
    if (!acc[func.module]) acc[func.module] = [];
    acc[func.module].push(func);
    return acc;
  }, {});

  return `# Remcode Function Catalog

*Generated: ${metadata.lastGenerated}*

## Statistics

- **Total Functions**: ${functions.length}
- **Total Modules**: ${modules.length}
- **Documentation Coverage**: ${metadata.metrics.documentationCoverage}%

${Object.entries(functionsByModule).map(([moduleName, moduleFunctions]) => `
## Module: \`${moduleName}\`

${moduleFunctions.map(func => `
### \`${func.name}\`

**Description**: ${func.description}  
**File**: \`${func.filePath}\`  
**Documented**: ${func.hasJSDoc ? '✅ Yes' : '❌ No'}  
**Async**: ${func.isAsync ? '✅ Yes' : '❌ No'}

---
`).join('\n')}
`).join('\n')}

## Recommendations

${metadata.metrics.documentationCoverage < 100 ? '- Add JSDoc documentation to undocumented functions' : ''}
${metadata.metrics.singleFunctionCompliance < 95 ? '- Refactor multi-function files to single-function architecture' : ''}
${metadata.metrics.documentationCoverage === 100 && metadata.metrics.singleFunctionCompliance >= 95 ? '- Excellent LLM optimization compliance! 🎉' : ''}
`;
}

// Main execution when run as script
if (require.main === module) {
  const args = process.argv.slice(2);
  const sourceDir = args[0] || 'src';
  const outputDir = args[1] || 'docs/generated';
  
  generateDocumentation(sourceDir, {
    outputDir,
    generateContext: true,
    verbose: true
  }).then(() => {
    console.log('✅ Documentation generation completed successfully!');
  }).catch(error => {
    console.error('❌ Documentation generation failed:', error);
    process.exit(1);
  });
}