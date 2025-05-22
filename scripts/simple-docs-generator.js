const fs = require('fs');
const path = require('path');
const util = require('util');

/**
 * Simple documentation generator for remcode codebase
 * Creates markdown documentation for each file
 * and generates entity relationship diagrams at the folder level
 */

const SRC_DIR = path.resolve(__dirname, '../src');
const DOCS_DIR = path.resolve(__dirname, '../docs');
const DIAGRAMS_DIR = path.resolve(DOCS_DIR, 'diagrams');

// Create docs directory if it doesn't exist
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Create diagrams directory if it doesn't exist
if (!fs.existsSync(DIAGRAMS_DIR)) {
  fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
}

/**
 * Get folder structure recursively
 */
function getFolderStructure(dirPath, relativePath = '') {
  const folderName = path.basename(dirPath);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  const structure = {
    name: folderName,
    files: [],
    subfolders: [],
    path: relativePath
  };
  
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);
    
    if (entry.isDirectory()) {
      structure.subfolders.push(getFolderStructure(entryPath, entryRelativePath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      // Only include TypeScript files
      structure.files.push(entry.name);
    }
  }
  
  return structure;
}

/**
 * Parse a TypeScript file to extract information
 */
function parseFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  
  // Simplified file documentation
  const fileDoc = {
    filePath,
    fileName,
    content: fileContent,
    imports: [],
    classes: [],
    interfaces: [],
    functions: [],
    variables: []
  };
  
  // Extract imports using regex
  const importPattern = /import\s+(?:{([^}]*)}\s+from\s+)?['"](.*)['"]/g;
  let importMatch;
  while ((importMatch = importPattern.exec(fileContent)) !== null) {
    const importPath = importMatch[2];
    fileDoc.imports.push(importPath);
  }
  
  // Extract classes using regex
  const classPattern = /export\s+(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/g;
  let classMatch;
  while ((classMatch = classPattern.exec(fileContent)) !== null) {
    const className = classMatch[1];
    const extendsClass = classMatch[2] || null;
    const implementsInterfaces = classMatch[3] ? classMatch[3].split(',').map(i => i.trim()) : [];
    
    fileDoc.classes.push({
      name: className,
      extends: extendsClass,
      implements: implementsInterfaces
    });
  }
  
  // Extract interfaces using regex
  const interfacePattern = /export\s+interface\s+(\w+)(?:\s+extends\s+([^{]+))?/g;
  let interfaceMatch;
  while ((interfaceMatch = interfacePattern.exec(fileContent)) !== null) {
    const interfaceName = interfaceMatch[1];
    const extendsInterfaces = interfaceMatch[2] ? interfaceMatch[2].split(',').map(i => i.trim()) : [];
    
    fileDoc.interfaces.push({
      name: interfaceName,
      extends: extendsInterfaces
    });
  }
  
  // Extract functions using regex
  const functionPattern = /export\s+(?:async\s+)?function\s+(\w+)/g;
  let functionMatch;
  while ((functionMatch = functionPattern.exec(fileContent)) !== null) {
    const functionName = functionMatch[1];
    fileDoc.functions.push({ name: functionName });
  }
  
  // Extract exported variables using regex
  const variablePattern = /export\s+(?:const|let|var)\s+(\w+)/g;
  let variableMatch;
  while ((variableMatch = variablePattern.exec(fileContent)) !== null) {
    const variableName = variableMatch[1];
    fileDoc.variables.push({ name: variableName });
  }
  
  return fileDoc;
}

/**
 * Get JSDoc comment before a declaration
 */
function extractJSDoc(content, position) {
  const lines = content.substring(0, position).split('\n').reverse();
  let jsDocLines = [];
  let foundJSDoc = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '*/') {
      foundJSDoc = true;
      continue;
    }
    
    if (foundJSDoc) {
      if (trimmedLine.startsWith('/**')) {
        break;
      }
      
      jsDocLines.unshift(trimmedLine.replace(/^\s*\*\s?/, ''));
    }
  }
  
  return jsDocLines.join('\n').trim();
}

/**
 * Generate markdown documentation for a file
 */
function generateMarkdownDoc(fileDoc) {
  const relativePath = path.relative(SRC_DIR, fileDoc.filePath);
  let markdown = `# ${fileDoc.fileName}\n\n`;
  
  // File path
  markdown += `**File Path:** \`${relativePath}\`\n\n`;
  
  // Overview - extract from comment at the top of the file
  const firstComment = fileDoc.content.match(/\/\*\*([\s\S]*?)\*\//);
  const overview = firstComment ? firstComment[1].replace(/^\s*\*\s?/gm, '').trim() : 'No overview provided.';
  markdown += `## Overview\n\n${overview}\n\n`;
  
  // Imports
  if (fileDoc.imports.length > 0) {
    markdown += `## Dependencies\n\n`;
    markdown += fileDoc.imports.map(imp => `- \`${imp}\``).join('\n');
    markdown += '\n\n';
  }
  
  // Classes
  if (fileDoc.classes.length > 0) {
    markdown += `## Classes\n\n`;
    
    fileDoc.classes.forEach(cls => {
      markdown += `### \`${cls.name}\`\n\n`;
      
      if (cls.extends) {
        markdown += `**Extends:** ${cls.extends}\n\n`;
      }
      
      if (cls.implements && cls.implements.length > 0) {
        markdown += `**Implements:** ${cls.implements.join(', ')}\n\n`;
      }
      
      // Find methods of this class
      const classDefinitionRegex = new RegExp(`class\\s+${cls.name}[\\s\\S]*?{([\\s\\S]*?)(?:^}|(?:^\\s*export\\s|^\\s*class\\s))`, 'm');
      const classBodyMatch = classDefinitionRegex.exec(fileDoc.content);
      
      if (classBodyMatch && classBodyMatch[1]) {
        const classBody = classBodyMatch[1];
        
        // Extract methods
        const methodPattern = /(?:public|private|protected)?\s+(?:async\s+)?(\w+)\s*\([^)]*\)/g;
        let methodMatch;
        const methods = [];
        
        while ((methodMatch = methodPattern.exec(classBody)) !== null) {
          const methodName = methodMatch[1];
          if (methodName !== 'constructor') {
            methods.push(methodName);
          }
        }
        
        if (methods.length > 0) {
          markdown += `**Methods:**\n\n`;
          methods.forEach(method => {
            markdown += `- \`${method}()\`\n`;
          });
          markdown += '\n';
        }
      }
    });
  }
  
  // Interfaces
  if (fileDoc.interfaces.length > 0) {
    markdown += `## Interfaces\n\n`;
    
    fileDoc.interfaces.forEach(intf => {
      markdown += `### \`${intf.name}\`\n\n`;
      
      if (intf.extends && intf.extends.length > 0) {
        markdown += `**Extends:** ${intf.extends.join(', ')}\n\n`;
      }
      
      // Try to extract properties
      const interfaceRegex = new RegExp(`interface\\s+${intf.name}[\\s\\S]*?{([\\s\\S]*?)(?:^}|(?:^\\s*export\\s|^\\s*interface\\s))`, 'm');
      const interfaceBodyMatch = interfaceRegex.exec(fileDoc.content);
      
      if (interfaceBodyMatch && interfaceBodyMatch[1]) {
        const interfaceBody = interfaceBodyMatch[1];
        const propertyLines = interfaceBody.split('\n').filter(line => 
          line.trim() !== '' && 
          !line.trim().startsWith('//') && 
          !line.trim().startsWith('/*')
        );
        
        if (propertyLines.length > 0) {
          markdown += `**Properties:**\n\n`;
          propertyLines.forEach(line => {
            markdown += `- \`${line.trim()}\`\n`;
          });
          markdown += '\n';
        }
      }
    });
  }
  
  // Functions
  if (fileDoc.functions.length > 0) {
    markdown += `## Functions\n\n`;
    
    fileDoc.functions.forEach(func => {
      markdown += `### \`${func.name}()\`\n\n`;
      
      // Try to extract function parameters and return type
      const functionRegex = new RegExp(`function\\s+${func.name}\\s*\\(([^)]*)\\)(?:\\s*:\\s*([^{]+))?`);
      const functionMatch = functionRegex.exec(fileDoc.content);
      
      if (functionMatch) {
        const params = functionMatch[1].split(',').map(p => p.trim()).filter(p => p !== '');
        
        if (params.length > 0) {
          markdown += `**Parameters:**\n\n`;
          params.forEach(param => {
            markdown += `- \`${param}\`\n`;
          });
          markdown += '\n';
        }
        
        if (functionMatch[2]) {
          markdown += `**Returns:** \`${functionMatch[2].trim()}\`\n\n`;
        }
      }
    });
  }
  
  // Variables
  if (fileDoc.variables.length > 0) {
    markdown += `## Variables\n\n`;
    
    fileDoc.variables.forEach(variable => {
      markdown += `- \`${variable.name}\`\n`;
    });
    markdown += '\n';
  }
  
  return markdown;
}

/**
 * Generate a mermaid entity relationship diagram for a folder
 */
function generateMermaidERD(folderPath, folderName) {
  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
    .map(file => path.join(folderPath, file));
  
  const fileDocs = files.map(file => parseFile(file));
  let mermaid = '```mermaid\nclassDiagram\n';
  
  // Track all classes and interfaces
  const allEntities = new Map();
  const importRelationships = new Set(); // To prevent duplicate relationships
  
  // Add classes and interfaces with their methods and properties
  for (const fileDoc of fileDocs) {
    // Extract class details
    for (const cls of fileDoc.classes) {
      allEntities.set(cls.name, { type: 'class', file: fileDoc.fileName, ...cls });
      
      // Extract methods and properties
      const classDefinitionRegex = new RegExp(`class\\s+${cls.name}[\\s\\S]*?{([\\s\\S]*?)(?:^}|(?:^\\s*export\\s|^\\s*class\\s))`, 'm');
      const classBodyMatch = classDefinitionRegex.exec(fileDoc.content);
      
      mermaid += `  class ${cls.name} {\n`;
      
      // Add properties if found
      if (classBodyMatch && classBodyMatch[1]) {
        const classBody = classBodyMatch[1];
        const propertyPattern = /(?:public|private|protected)\s+(\w+)\s*:\s*([^;\n]+)/g;
        let propertyMatch;
        
        while ((propertyMatch = propertyPattern.exec(classBody)) !== null) {
          const propName = propertyMatch[1];
          const propType = propertyMatch[2].trim();
          mermaid += `    ${propName}: ${propType}\n`;
        }
        
        // Extract methods
        const methodPattern = /(?:public|private|protected)?\s+(?:async\s+)?(\w+)\s*\([^)]*\)(?:\s*:\s*([^{\n]+))?/g;
        let methodMatch;
        
        while ((methodMatch = methodPattern.exec(classBody)) !== null) {
          const methodName = methodMatch[1];
          const returnType = methodMatch[2] ? `: ${methodMatch[2].trim()}` : '';
          if (methodName !== 'constructor') {
            mermaid += `    ${methodName}()${returnType}\n`;
          }
        }
      }
      
      mermaid += `  }\n`;
    }
    
    // Extract interface details
    for (const intf of fileDoc.interfaces) {
      allEntities.set(intf.name, { type: 'interface', file: fileDoc.fileName, ...intf });
      
      mermaid += `  class ${intf.name} {\n    <<interface>>\n`;
      
      // Try to extract properties
      const interfaceRegex = new RegExp(`interface\\s+${intf.name}[\\s\\S]*?{([\\s\\S]*?)(?:^}|(?:^\\s*export\\s|^\\s*interface\\s))`, 'm');
      const interfaceBodyMatch = interfaceRegex.exec(fileDoc.content);
      
      if (interfaceBodyMatch && interfaceBodyMatch[1]) {
        const interfaceBody = interfaceBodyMatch[1];
        const propertyLines = interfaceBody
          .split('\n')
          .filter(line => line.trim() !== '' && !line.trim().startsWith('//') && !line.trim().startsWith('/*'))
          .map(line => line.trim())
          .filter(line => line.includes(':'));
        
        for (const line of propertyLines) {
          // Simplified property extraction
          const propParts = line.split(':');
          if (propParts.length >= 2) {
            const propName = propParts[0].trim().replace('?', '');
            const propType = propParts.slice(1).join(':').trim().replace(/;$/, '');
            mermaid += `    ${propName}: ${propType}\n`;
          }
        }
      }
      
      mermaid += `  }\n`;
    }
  }
  
  // Add inheritance relationships
  mermaid += '\n  %% Inheritance relationships\n';
  for (const [name, entity] of allEntities) {
    if (entity.type === 'class') {
      if (entity.extends) {
        mermaid += `  ${name} --|> ${entity.extends}: extends\n`;
      }
      
      if (entity.implements && entity.implements.length > 0) {
        for (const impl of entity.implements) {
          mermaid += `  ${name} ..|> ${impl}: implements\n`;
        }
      }
    } else if (entity.type === 'interface') {
      if (entity.extends && entity.extends.length > 0) {
        for (const ext of entity.extends) {
          mermaid += `  ${name} --|> ${ext}: extends\n`;
        }
      }
    }
  }
  
  // Add dependency relationships
  mermaid += '\n  %% Usage relationships\n';
  for (const fileDoc of fileDocs) {
    const fileEntities = [
      ...fileDoc.classes.map(c => c.name), 
      ...fileDoc.interfaces.map(i => i.name)
    ];
    
    if (fileEntities.length === 0) continue;
    
    // Check all imports to see if they match any entities
    for (const importPath of fileDoc.imports) {
      if (importPath.startsWith('.')) {
        const baseName = path.basename(importPath, path.extname(importPath));
        
        // Find entities in other files that match the import
        for (const otherDoc of fileDocs) {
          if (otherDoc !== fileDoc) {
            const importEntities = [
              ...otherDoc.classes.map(c => c.name),
              ...otherDoc.interfaces.map(i => i.name)
            ];
            
            for (const importEntity of importEntities) {
              if (importEntity === baseName || otherDoc.fileName.replace('.ts', '') === baseName) {
                for (const sourceEntity of fileEntities) {
                  const relationKey = `${sourceEntity}->${importEntity}`;
                  if (!importRelationships.has(relationKey)) {
                    mermaid += `  ${sourceEntity} --> ${importEntity}: uses\n`;
                    importRelationships.add(relationKey);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Add styling and notes
  mermaid += '\n  %% Style and notes\n';
  mermaid += '  note "Generated from folder: ' + folderName + '" as Note1\n';
  
  // Group by file
  const fileGroups = new Map();
  for (const [name, entity] of allEntities) {
    if (!fileGroups.has(entity.file)) {
      fileGroups.set(entity.file, []);
    }
    fileGroups.get(entity.file).push(name);
  }
  
  // Add file grouping when there are multiple files
  if (fileGroups.size > 1) {
    mermaid += '\n  %% File groupings\n';
    for (const [fileName, entities] of fileGroups) {
      if (entities.length > 0) {
        mermaid += `  note "${fileName}" as Note_${fileName.replace('.ts', '')}\n`;
      }
    }
  }
  
  mermaid += '```\n';
  return mermaid;
}

/**
 * Process a folder recursively
 */
async function processFolder(folderStructure, currentPath = SRC_DIR) {
  console.log(`Processing folder: ${folderStructure.name}`);
  
  // Create folder in docs
  const docFolderPath = path.join(DOCS_DIR, folderStructure.path);
  if (!fs.existsSync(docFolderPath)) {
    fs.mkdirSync(docFolderPath, { recursive: true });
  }
  
  // Process each file
  for (const file of folderStructure.files) {
    try {
      const filePath = path.join(currentPath, file);
      const fileDoc = parseFile(filePath);
      const markdown = generateMarkdownDoc(fileDoc);
      
      // Write markdown file
      const mdFilePath = path.join(docFolderPath, `${path.basename(file, path.extname(file))}.md`);
      fs.writeFileSync(mdFilePath, markdown);
      
      console.log(`  Generated documentation for: ${file}`);
    } catch (error) {
      console.error(`  Error processing file ${file}:`, error);
    }
  }
  
  // Generate folder-level diagram if there are files
  if (folderStructure.files.length > 0) {
    try {
      const mermaidDiagram = generateMermaidERD(path.join(currentPath), folderStructure.name);
      
      // Create proper folder structure for the diagram path
      const diagramPath = path.join(DIAGRAMS_DIR, `${folderStructure.path || folderStructure.name}.md`);
      const diagramDir = path.dirname(diagramPath);
      
      // Ensure the diagram directory exists
      if (!fs.existsSync(diagramDir)) {
        fs.mkdirSync(diagramDir, { recursive: true });
      }
      
      fs.writeFileSync(diagramPath, `# ${folderStructure.name} Entity Relationship Diagram\n\n${mermaidDiagram}`);
      
      console.log(`  Generated ERD for folder: ${folderStructure.name}`);
    } catch (error) {
      console.error(`  Error generating ERD for ${folderStructure.name}:`, error);
    }
  }
  
  // Process subfolders
  for (const subfolder of folderStructure.subfolders) {
    await processFolder(subfolder, path.join(currentPath, subfolder.name));
  }
}

/**
 * Generate index file for documentation
 */
function generateDocIndex(folderStructure) {
  let markdown = '# Remcode Codebase Documentation\n\n';
  markdown += 'This documentation provides an overview of the Remcode codebase structure, entities, and relationships.\n\n';
  
  markdown += '## Folder Structure\n\n';
  
  function addFolderToIndex(folder, depth) {
    const indent = '  '.repeat(depth);
    markdown += `${indent}- **${folder.name}/**\n`;
    
    // Add files
    for (const file of folder.files) {
      const fileBaseName = path.basename(file, path.extname(file));
      const filePath = folder.path ? `${folder.path}/${fileBaseName}.md` : `${fileBaseName}.md`;
      markdown += `${indent}  - [${fileBaseName}](${filePath})\n`;
    }
    
    // Add subfolders
    for (const subfolder of folder.subfolders) {
      addFolderToIndex(subfolder, depth + 1);
    }
  }
  
  addFolderToIndex(folderStructure, 0);
  
  markdown += '\n## Entity Relationship Diagrams\n\n';
  
  // Add links to all ERD diagrams
  function addDiagramsToIndex(folder, depth) {
    const indent = '  '.repeat(depth);
    const diagramPath = folder.path ? `diagrams/${folder.path}.md` : `diagrams/${folder.name}.md`;
    
    if (folder.files.length > 0) {
      markdown += `${indent}- [${folder.name} Diagram](${diagramPath})\n`;
    }
    
    for (const subfolder of folder.subfolders) {
      addDiagramsToIndex(subfolder, depth + 1);
    }
  }
  
  addDiagramsToIndex(folderStructure, 0);
  
  return markdown;
}

/**
 * Main execution function
 */
async function main() {
  console.log('Starting documentation generation...');
  
  // Get folder structure
  const folderStructure = getFolderStructure(SRC_DIR);
  
  // Process each folder
  await processFolder(folderStructure);
  
  // Generate index file
  const indexMarkdown = generateDocIndex(folderStructure);
  fs.writeFileSync(path.join(DOCS_DIR, 'index.md'), indexMarkdown);
  
  console.log('Documentation generation complete!');
  console.log(`Documentation has been written to: ${DOCS_DIR}`);
}

// Run the script
main().catch(error => {
  console.error('Error generating documentation:', error);
  process.exit(1);
});
