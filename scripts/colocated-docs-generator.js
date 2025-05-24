const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(PROJECT_ROOT, 'rem-docs');

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
    variables: []
  };
  
  // Only parse code files
  const codeFileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py']; // Added Python too
  if (!codeFileExtensions.includes(fileExt)) {
    return info;
  }
  
  try {
    // Extract overview from all multiline comments in the document
    const commentRegex = /\/\*\*([\s\S]*?)\*\//g;
    let commentMatch;
    let allComments = [];
    
    while ((commentMatch = commentRegex.exec(content)) !== null) {
      // Clean up the comment: remove * at the beginning of each line and trim whitespace
      const cleanedComment = commentMatch[1].replace(/^\s*\*\s?/gm, '').trim();
      if (cleanedComment) {
        allComments.push(cleanedComment);
      }
    }
    
    if (allComments.length > 0) {
      info.overview = allComments.join('\n\n');
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

function generateMarkdown(fileInfo) {
  let markdown = `# ${fileInfo.fileName}\n\n`;
  markdown += `**File Path:** \`${fileInfo.relativePath}\`\n\n`;
  markdown += `## Overview\n\n${fileInfo.overview}\n\n`;
  
  if (fileInfo.imports.length > 0) {
    markdown += `## Dependencies\n\n`;
    fileInfo.imports.forEach(imp => {
      markdown += `- \`${imp}\`\n`;
    });
    markdown += '\n';
  }
  
  if (fileInfo.classes.length > 0) {
    markdown += `## Classes\n\n`;
    fileInfo.classes.forEach(cls => {
      markdown += `### \`${cls}\`\n\n`;
      markdown += `\`\`\`typescript\nclass ${cls} {\n// ... implementation\n}\n\`\`\`\n\n`;
    });
  }
  
  if (fileInfo.interfaces.length > 0) {
    markdown += `## Interfaces\n\n`;
    fileInfo.interfaces.forEach(intf => {
      markdown += `### \`${intf}\`\n\n`;
      markdown += `\`\`\`typescript\ninterface ${intf} {\n// ... properties\n}\n\`\`\`\n\n`;
    });
  }
  
  if (fileInfo.functions.length > 0) {
    markdown += `## Functions\n\n`;
    fileInfo.functions.forEach(func => {
      markdown += `### \`${func}()\`\n\n`;
      markdown += `\`\`\`typescript\nexport function ${func}()\n\`\`\`\n\n`;
    });
  }
  
  if (fileInfo.variables.length > 0) {
    markdown += `## Variables\n\n`;
    fileInfo.variables.forEach(variable => {
      markdown += `- \`${variable}\`\n`;
    });
    markdown += '\n';
  }
  
  return markdown;
}

function processFile(filePath) {
  try {
    // Get file extension and filename
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath);
    
    // Define code file extensions that should be processed
    const codeFileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py'];
    
    // Skip non-code files entirely
    if (!codeFileExtensions.includes(fileExt)) {
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
    
    console.log(`Generated: ${path.relative(PROJECT_ROOT, mdFilePath)}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let count = 0;
  
  // Directories to skip
  const skippedDirs = ['node_modules', '.git', 'dist', 'coverage', '~deps'];
  
  // File extensions to skip
  const skippedExtensions = [
    '.md',      // Markdown files
    '.json',    // JSON files
    '.env',     // Environment files
    '.min.js',  // Minified JS
    '.bundle.js', // Bundled JS
    '.map',     // Source maps
    '.yaml', '.yml', // YAML files
    '.toml',    // TOML files
    '.lock',    // Lock files (package-lock.json, yarn.lock)
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', // Images
    '.ttf', '.woff', '.woff2', '.eot', // Fonts
    '.log',     // Log files
    '.bak',     // Backup files
    '.d.ts'     // TypeScript declaration files
  ];
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const fileExt = path.extname(entry.name);
    
    // Skip certain directories
    if (skippedDirs.some(d => fullPath.includes(d))) {
      continue;
    }
    
    // Skip specific files and extensions
    if (entry.isFile() && (
      skippedExtensions.includes(fileExt) || 
      entry.name.includes('.generated.') || 
      entry.name.endsWith('.config.js') ||
      entry.name === 'pnpm-lock.yaml'
    )) {
      continue;
    }
    
    if (entry.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (entry.isFile()) {
      if (processFile(fullPath)) {
        count++;
      }
    }
  }
  
  return count;
}

function main() {
  console.log('Starting enhanced documentation generation...');
  
  // Ensure rem-docs directory exists (create if not)
  if (!fs.existsSync(DOCS_ROOT)) {
    fs.mkdirSync(DOCS_ROOT, { recursive: true });
  } else {
    // Clean up existing docs directory
    console.log('Cleaning up existing documentation...');
    cleanupDocsDirectory(DOCS_ROOT);
  }
  
  const startTime = Date.now();
  const count = processDirectory(PROJECT_ROOT);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Processed ${count} files in ${duration}s`);
}

// Function to clean up the docs directory before regenerating
function cleanupDocsDirectory(docsDir) {
  // Only remove .md files, keep any other custom files that might be there
  const entries = fs.readdirSync(docsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(docsDir, entry.name);
    
    if (entry.isDirectory()) {
      cleanupDocsDirectory(fullPath);
      
      // Remove empty directories
      if (fs.readdirSync(fullPath).length === 0) {
        fs.rmdirSync(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      fs.unlinkSync(fullPath);
    }
  }
}

main();
