#!/usr/bin/env node

/**
 * Generate Mirrored Documentation (rem-docs)
 * 
 * Creates markdown documentation files that mirror the src/ directory structure
 * in rem-docs/ folder. Each code file gets a corresponding .md file with 
 * documentation extracted from the source code.
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Generating mirrored documentation (rem-docs)...');

// Configuration
const sourceDir = path.join(__dirname, '../src');
const docsDir = path.join(__dirname, '../rem-docs');
const skippedExtensions = ['.test.ts', '.spec.ts', '.d.ts'];
const processableExtensions = ['.ts', '.js', '.tsx', '.jsx'];

/**
 * Clean the existing rem-docs directory
 */
function cleanDocsDirectory() {
  if (fs.existsSync(docsDir)) {
    console.log('🧹 Cleaning existing rem-docs directory...');
    fs.rmSync(docsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(docsDir, { recursive: true });
}

/**
 * Extract documentation from a source file
 * @param {string} filePath - Path to the source file
 * @returns {string} - Extracted documentation in markdown format
 */
function extractDocumentation(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(sourceDir, filePath);
  const fileName = path.basename(filePath);
  
  // Extract JSDoc comments and code structure
  const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;
  const classRegex = /export\s+(?:abstract\s+)?class\s+(\w+)/g;
  const interfaceRegex = /export\s+interface\s+(\w+)/g;
  const functionRegex = /export\s+(?:async\s+)?function\s+(\w+)/g;
  const constRegex = /export\s+const\s+(\w+)/g;
  
  let documentation = `# ${fileName}\n\n`;
  documentation += `**File Path**: \`${relativePath}\`\n\n`;
  
  // Extract file-level description from top JSDoc comment
  const firstJSDoc = content.match(/\/\*\*([\s\S]*?)\*\//);
  if (firstJSDoc) {
    const description = firstJSDoc[1]
      .replace(/^\s*\*/gm, '')
      .trim();
    if (description) {
      documentation += `## Description\n\n${description}\n\n`;
    }
  }
  
  // Extract exports
  const classes = [...content.matchAll(classRegex)];
  const interfaces = [...content.matchAll(interfaceRegex)];
  const functions = [...content.matchAll(functionRegex)];
  const constants = [...content.matchAll(constRegex)];
  
  if (classes.length > 0) {
    documentation += `## Classes\n\n`;
    classes.forEach(match => {
      documentation += `- \`${match[1]}\`\n`;
    });
    documentation += `\n`;
  }
  
  if (interfaces.length > 0) {
    documentation += `## Interfaces\n\n`;
    interfaces.forEach(match => {
      documentation += `- \`${match[1]}\`\n`;
    });
    documentation += `\n`;
  }
  
  if (functions.length > 0) {
    documentation += `## Functions\n\n`;
    functions.forEach(match => {
      documentation += `- \`${match[1]}\`\n`;
    });
    documentation += `\n`;
  }
  
  if (constants.length > 0) {
    documentation += `## Constants\n\n`;
    constants.forEach(match => {
      documentation += `- \`${match[1]}\`\n`;
    });
    documentation += `\n`;
  }
  
  // Extract all JSDoc comments
  const jsdocs = [...content.matchAll(jsdocRegex)];
  if (jsdocs.length > 1) {
    documentation += `## Documentation Comments\n\n`;
    jsdocs.slice(1).forEach((match, index) => {
      const comment = match[1]
        .replace(/^\s*\*/gm, '')
        .trim();
      if (comment) {
        documentation += `### Comment ${index + 1}\n\n${comment}\n\n`;
      }
    });
  }
  
  // Add code structure overview
  documentation += `## Code Overview\n\n`;
  documentation += `\`\`\`typescript\n`;
  
  // Extract imports
  const imports = content.match(/^import.*$/gm);
  if (imports) {
    documentation += imports.slice(0, 5).join('\n');
    if (imports.length > 5) {
      documentation += `\n// ... ${imports.length - 5} more imports`;
    }
    documentation += '\n\n';
  }
  
  // Show key exports structure
  if (classes.length > 0 || interfaces.length > 0 || functions.length > 0) {
    documentation += '// Key exports:\n';
    classes.forEach(match => documentation += `export class ${match[1]} { ... }\n`);
    interfaces.forEach(match => documentation += `export interface ${match[1]} { ... }\n`);
    functions.forEach(match => documentation += `export function ${match[1]}(...) { ... }\n`);
  }
  
  documentation += `\`\`\`\n\n`;
  
  // File stats
  const lines = content.split('\n').length;
  const size = fs.statSync(filePath).size;
  documentation += `## File Statistics\n\n`;
  documentation += `- **Lines of Code**: ${lines}\n`;
  documentation += `- **File Size**: ${size} bytes\n`;
  documentation += `- **Last Modified**: ${fs.statSync(filePath).mtime.toISOString()}\n\n`;
  
  return documentation;
}

/**
 * Process a directory recursively
 * @param {string} sourceDir - Source directory path
 * @param {string} targetDir - Target documentation directory path
 */
function processDirectory(sourceDir, targetDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip test directories and node_modules
      if (entry.name === '__tests__' || 
          entry.name === 'node_modules' || 
          entry.name.startsWith('.')) {
        continue;
      }
      processDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      
      // Skip non-processable files
      if (!processableExtensions.includes(ext) || 
          skippedExtensions.some(skipExt => entry.name.includes(skipExt))) {
        continue;
      }
      
      // Generate markdown documentation
      const markdownPath = targetPath.replace(/\.(ts|js|tsx|jsx)$/, '.md');
      const documentation = extractDocumentation(sourcePath);
      
      fs.writeFileSync(markdownPath, documentation);
      console.log(`📄 Generated: ${path.relative(docsDir, markdownPath)}`);
    }
  }
}

/**
 * Generate index files for better navigation
 */
function generateIndexFiles() {
  function createIndexForDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const relativePath = path.relative(docsDir, dirPath);
    
    let indexContent = `# ${relativePath || 'rem-docs'}\n\n`;
    indexContent += `Documentation for the \`${relativePath || 'src'}\` directory.\n\n`;
    
    // List subdirectories
    const directories = entries.filter(e => e.isDirectory()).sort();
    if (directories.length > 0) {
      indexContent += `## Subdirectories\n\n`;
      directories.forEach(dir => {
        indexContent += `- [${dir.name}](./${dir.name}/README.md)\n`;
      });
      indexContent += `\n`;
    }
    
    // List documentation files
    const markdownFiles = entries
      .filter(e => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md')
      .sort();
    
    if (markdownFiles.length > 0) {
      indexContent += `## Files\n\n`;
      markdownFiles.forEach(file => {
        const baseName = file.name.replace('.md', '');
        indexContent += `- [${baseName}](./${file.name})\n`;
      });
      indexContent += `\n`;
    }
    
    // Write README.md for this directory
    const readmePath = path.join(dirPath, 'README.md');
    fs.writeFileSync(readmePath, indexContent);
    console.log(`📋 Generated: ${path.relative(docsDir, readmePath)}`);
    
    // Recursively create index files for subdirectories
    directories.forEach(dir => {
      createIndexForDirectory(path.join(dirPath, dir.name));
    });
  }
  
  createIndexForDirectory(docsDir);
}

/**
 * Main execution
 */
function main() {
  try {
    cleanDocsDirectory();
    processDirectory(sourceDir, docsDir);
    generateIndexFiles();
    
    console.log('✅ Mirrored documentation generation complete!');
    console.log(`📁 Documentation available in: ${docsDir}`);
    
    // Count generated files
    const countFiles = (dir) => {
      let count = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          count += countFiles(path.join(dir, entry.name));
        } else if (entry.name.endsWith('.md')) {
          count++;
        }
      }
      return count;
    };
    
    const totalFiles = countFiles(docsDir);
    console.log(`📊 Generated ${totalFiles} documentation files`);
    
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
