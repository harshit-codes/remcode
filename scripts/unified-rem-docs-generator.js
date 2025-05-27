#!/usr/bin/env node

/**
 * Unified Rem-Docs Generator
 * 
 * Creates markdown documentation files that mirror the codebase structure
 * in the rem-docs/ folder. Each code file gets a corresponding .md file with 
 * documentation extracted from the source code.
 * 
 * Features:
 * - Processes the entire project or just src/ (configurable)
 * - Extracts all JSDoc comments for comprehensive documentation
 * - Creates index files for better navigation
 * - Supports multiple file types (TS, JS, JSX, TSX, PY)
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Generating mirrored documentation (rem-docs)...');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(PROJECT_ROOT, 'rem-docs');
const SOURCE_DIR = path.join(PROJECT_ROOT, 'src');

// Set to true to process the entire project, false to focus on src/ only
const PROCESS_ENTIRE_PROJECT = false;

// Define directories to skip to prevent circular changes
const SKIP_DIRS = [
  path.join(PROJECT_ROOT, 'docs', 'rem-docs'),
  path.join(PROJECT_ROOT, 'docs'),
  path.join(PROJECT_ROOT, 'node_modules'),
  path.join(PROJECT_ROOT, '.git')
];

// File extensions configuration
const PROCESSABLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.py'];
const SKIPPED_EXTENSIONS = ['.test.ts', '.spec.ts', '.d.ts'];

/**
 * Clean the existing rem-docs directory
 */
function cleanDocsDirectory() {
  if (fs.existsSync(DOCS_ROOT)) {
    console.log('🧹 Cleaning existing rem-docs directory...');
    fs.rmSync(DOCS_ROOT, { recursive: true, force: true });
  }
  fs.mkdirSync(DOCS_ROOT, { recursive: true });
}

/**
 * Extract file information and documentation from a source file
 * @param {string} filePath - Path to the source file
 * @param {string} content - File content
 * @returns {Object} - Extracted file information
 */
function extractFileInfo(filePath, content) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  
  const info = {
    fileName,
    fileExt,
    relativePath,
    overview: 'No overview provided.',
    imports: [],
    functions: [],
    classes: [],
    interfaces: [],
    variables: [],
    allComments: [],
    lines: content.split('\n').length,
    size: fs.statSync(filePath).size,
    lastModified: fs.statSync(filePath).mtime.toISOString()
  };
  
  try {
    // Extract all JSDoc comments from the document
    const commentRegex = /\/\*\*([\s\S]*?)\*\//g;
    let commentMatch;
    
    while ((commentMatch = commentRegex.exec(content)) !== null) {
      // Clean up the comment: remove * at the beginning of each line and trim whitespace
      const cleanedComment = commentMatch[1].replace(/^\s*\*\s?/gm, '').trim();
      if (cleanedComment) {
        info.allComments.push(cleanedComment);
      }
    }
    
    // Set overview from the first comment if available
    if (info.allComments.length > 0) {
      info.overview = info.allComments[0];
    }
    
    // Extract imports
    const importRegex = /import\s+(?:{[^}]*}\s+from\s+)?['"](.*?)['"]/g;
    let importMatch;
    while ((importMatch = importRegex.exec(content)) !== null) {
      info.imports.push(importMatch[1]);
    }
    
    // Extract functions
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
    let functionMatch;
    while ((functionMatch = functionRegex.exec(content)) !== null) {
      info.functions.push(functionMatch[1]);
    }
    
    // Extract classes
    const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g;
    let classMatch;
    while ((classMatch = classRegex.exec(content)) !== null) {
      info.classes.push(classMatch[1]);
    }
    
    // Extract interfaces
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
    let interfaceMatch;
    while ((interfaceMatch = interfaceRegex.exec(content)) !== null) {
      info.interfaces.push(interfaceMatch[1]);
    }
    
    // Extract variables/constants
    const variableRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)/g;
    let variableMatch;
    while ((variableMatch = variableRegex.exec(content)) !== null) {
      if (!info.functions.includes(variableMatch[1])) {
        info.variables.push(variableMatch[1]);
      }
    }
    
  } catch (error) {
    console.warn(`Error parsing ${fileName}:`, error.message);
  }
  
  return info;
}

/**
 * Generate markdown documentation for a file
 * @param {Object} fileInfo - Extracted file information
 * @returns {string} - Markdown documentation
 */
function generateMarkdown(fileInfo) {
  let markdown = `# ${fileInfo.fileName}\n\n`;
  markdown += `**File Path:** \`${fileInfo.relativePath}\`\n\n`;
  
  // Add overview from first comment
  markdown += `## Overview\n\n${fileInfo.overview}\n\n`;
  
  // Add imports/dependencies
  if (fileInfo.imports.length > 0) {
    markdown += `## Dependencies\n\n`;
    fileInfo.imports.forEach(imp => {
      markdown += `- \`${imp}\`\n`;
    });
    markdown += '\n';
  }
  
  // Add classes
  if (fileInfo.classes.length > 0) {
    markdown += `## Classes\n\n`;
    fileInfo.classes.forEach(cls => {
      markdown += `### \`${cls}\`\n\n`;
      markdown += `\`\`\`typescript\nclass ${cls} {\n  // ... implementation\n}\n\`\`\`\n\n`;
    });
  }
  
  // Add interfaces
  if (fileInfo.interfaces.length > 0) {
    markdown += `## Interfaces\n\n`;
    fileInfo.interfaces.forEach(intf => {
      markdown += `### \`${intf}\`\n\n`;
      markdown += `\`\`\`typescript\ninterface ${intf} {\n  // ... properties\n}\n\`\`\`\n\n`;
    });
  }
  
  // Add functions
  if (fileInfo.functions.length > 0) {
    markdown += `## Functions\n\n`;
    fileInfo.functions.forEach(func => {
      markdown += `### \`${func}()\`\n\n`;
      markdown += `\`\`\`typescript\nfunction ${func}() {\n  // ... implementation\n}\n\`\`\`\n\n`;
    });
  }
  
  // Add variables
  if (fileInfo.variables.length > 0) {
    markdown += `## Variables\n\n`;
    fileInfo.variables.forEach(variable => {
      markdown += `- \`${variable}\`\n`;
    });
    markdown += '\n';
  }
  
  // Add all JSDoc comments (except the first one which is used as overview)
  if (fileInfo.allComments.length > 1) {
    markdown += `## Additional Documentation\n\n`;
    fileInfo.allComments.slice(1).forEach((comment, index) => {
      markdown += `### Comment ${index + 1}\n\n${comment}\n\n`;
    });
  }
  
  // Add file statistics
  markdown += `## File Statistics\n\n`;
  markdown += `- **Lines of Code**: ${fileInfo.lines}\n`;
  markdown += `- **File Size**: ${fileInfo.size} bytes\n`;
  markdown += `- **Last Modified**: ${fileInfo.lastModified}\n\n`;
  
  return markdown;
}

/**
 * Process a single file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file was processed successfully
 */
function processFile(filePath) {
  try {
    // Get file extension and filename
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath);
    
    // Skip non-processable files
    if (!PROCESSABLE_EXTENSIONS.includes(fileExt)) {
      return false;
    }
    
    // Skip test files and specific extensions
    if (SKIPPED_EXTENSIONS.some(ext => fileName.includes(ext))) {
      return false;
    }
    
    // Skip specific files
    const skippedFiles = ['LICENSE', '.env', '.gitignore', '.npmignore'];
    if (skippedFiles.includes(fileName)) {
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileInfo = extractFileInfo(filePath, content);
    const markdown = generateMarkdown(fileInfo);
    
    // Generate mirrored directory path in rem-docs folder
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const mirroredDirPath = path.dirname(path.join(DOCS_ROOT, relativePath));
    const mdFileName = path.basename(filePath, fileExt) + '.md';
    const mdFilePath = path.join(mirroredDirPath, mdFileName);
    
    // Create directory structure if it doesn't exist
    fs.mkdirSync(mirroredDirPath, { recursive: true });
    
    // Write the markdown file
    fs.writeFileSync(mdFilePath, markdown);
    
    console.log(`📄 Generated: ${path.relative(PROJECT_ROOT, mdFilePath)}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Process a directory recursively
 * @param {string} dirPath - Directory path to process
 */
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory not found: ${dirPath}`);
    return;
  }
  
  // Skip directories that are in the exclusion list
  if (SKIP_DIRS.some(skipDir => dirPath.startsWith(skipDir))) {
    console.log(`Skipping directory: ${dirPath}`);
    return;
  }
  
  // Skip test directories and hidden directories
  const dirName = path.basename(dirPath);
  if (dirName === '__tests__' || dirName === 'node_modules' || dirName.startsWith('.')) {
    return;
  }
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    // Process files
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        processDirectory(entryPath);
      } else if (entry.isFile()) {
        processFile(entryPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

/**
 * Generate index files for better navigation
 */
function generateIndexFiles() {
  function createIndexForDirectory(dirPath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const relativePath = path.relative(DOCS_ROOT, dirPath);
      
      let indexContent = `# ${relativePath || 'rem-docs'}\n\n`;
      indexContent += `Documentation for the \`${relativePath || 'codebase'}\` directory.\n\n`;
      
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
      console.log(`📋 Generated index: ${path.relative(DOCS_ROOT, readmePath)}`);
      
      // Recursively create index files for subdirectories
      directories.forEach(dir => {
        createIndexForDirectory(path.join(dirPath, dir.name));
      });
    } catch (error) {
      console.error(`Error creating index for ${dirPath}:`, error.message);
    }
  }
  
  createIndexForDirectory(DOCS_ROOT);
}

/**
 * Count generated documentation files
 * @param {string} dir - Directory to count files in
 * @returns {number} - Number of files
 */
function countFiles(dir) {
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
}

/**
 * Main execution function
 */
function main() {
  try {
    // Clean up existing docs
    cleanDocsDirectory();
    
    // Process directories
    if (PROCESS_ENTIRE_PROJECT) {
      console.log('Processing entire project...');
      processDirectory(PROJECT_ROOT);
    } else {
      console.log('Processing src/ directory only...');
      processDirectory(SOURCE_DIR);
    }
    
    // Generate index files
    generateIndexFiles();
    
    // Output statistics
    const totalFiles = countFiles(DOCS_ROOT);
    console.log('✅ Mirrored documentation generation complete!');
    console.log(`📁 Documentation available in: ${DOCS_ROOT}`);
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
