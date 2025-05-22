import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

/**
 * Documentation generator for remcode codebase
 * Creates markdown documentation for each TypeScript file
 * and generates entity relationship diagrams
 */

interface Entity {
  name: string;
  kind: string;
  description: string;
  params?: string[];
  returnType?: string;
  modifiers?: string[];
  properties?: Entity[];
  methods?: Entity[];
  extends?: string[];
  implements?: string[];
}

interface FileDocumentation {
  filePath: string;
  fileName: string;
  overview: string;
  imports: string[];
  entities: Entity[];
  dependencies: Set<string>;
}

interface FolderStructure {
  name: string;
  files: string[];
  subfolders: FolderStructure[];
  path: string;
}

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
function getFolderStructure(dirPath: string, relativePath: string = ''): FolderStructure {
  const folderName = path.basename(dirPath);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  const structure: FolderStructure = {
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
 * Parse a TypeScript file to extract entities
 */
function parseTypeScriptFile(filePath: string): FileDocumentation {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const sourceFile = ts.createSourceFile(
    fileName,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  const fileDoc: FileDocumentation = {
    filePath,
    fileName,
    overview: extractFileComment(sourceFile),
    imports: [],
    entities: [],
    dependencies: new Set<string>()
  };
  
  // Extract imports
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const importPath = node.moduleSpecifier.text;
        fileDoc.imports.push(importPath);
        
        // Add to dependencies if it's a local import
        if (importPath.startsWith('.')) {
          fileDoc.dependencies.add(importPath);
        }
      }
    }
  });
  
  // Extract classes, interfaces, functions, etc.
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      fileDoc.entities.push(extractClassInfo(node));
    } else if (ts.isInterfaceDeclaration(node) && node.name) {
      fileDoc.entities.push(extractInterfaceInfo(node));
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      fileDoc.entities.push(extractFunctionInfo(node));
    } else if (ts.isVariableStatement(node)) {
      const entities = extractVariableInfo(node);
      fileDoc.entities.push(...entities);
    } else if (ts.isEnumDeclaration(node) && node.name) {
      fileDoc.entities.push(extractEnumInfo(node));
    }
  });
  
  return fileDoc;
}

/**
 * Extract file comment/overview
 */
function extractFileComment(sourceFile: ts.SourceFile): string {
  const fullText = sourceFile.getFullText();
  const trivia = ts.getLeadingCommentRanges(fullText, 0) || [];
  
  if (trivia.length > 0) {
    const commentText = fullText.substring(trivia[0].pos, trivia[0].end);
    // Clean up comment markers
    return commentText
      .replace(/\/\*\*|\*\/|^\s*\*\s?/gm, '')
      .trim();
  }
  
  return 'No file overview provided.';
}

/**
 * Extract class information
 */
function extractClassInfo(node: ts.ClassDeclaration): Entity {
  const name = node.name ? node.name.getText() : 'Anonymous Class';
  const modifiers = node.modifiers ? node.modifiers.map(m => m.getText()) : [];
  const heritage = [];
  
  if (node.heritageClauses) {
    for (const clause of node.heritageClauses) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        heritage.push(...clause.types.map(t => t.getText()) as string[]);
      }
    }
  }
  
  const properties: Entity[] = [];
  const methods: Entity[] = [];
  
  node.members.forEach(member => {
    if (ts.isPropertyDeclaration(member)) {
      const propName = member.name.getText();
      const propModifiers = member.modifiers ? member.modifiers.map(m => m.getText()) : [];
      const type = member.type ? member.type.getText() : 'any';
      
      properties.push({
        name: propName,
        kind: 'property',
        description: extractJSDocComment(member),
        modifiers: propModifiers,
        returnType: type
      });
    } else if (ts.isMethodDeclaration(member) && member.name) {
      const methodName = member.name.getText();
      const methodModifiers = member.modifiers ? member.modifiers.map(m => m.getText()) : [];
      const returnType = member.type ? member.type.getText() : 'void';
      const params = member.parameters.map(p => p.getText());
      
      methods.push({
        name: methodName,
        kind: 'method',
        description: extractJSDocComment(member),
        modifiers: methodModifiers,
        params,
        returnType
      });
    }
  });
  
  return {
    name,
    kind: 'class',
    description: extractJSDocComment(node),
    modifiers,
    extends: heritage,
    properties,
    methods
  };
}

/**
 * Extract interface information
 */
function extractInterfaceInfo(node: ts.InterfaceDeclaration): Entity {
  const name = node.name.getText();
  const modifiers = node.modifiers ? node.modifiers.map(m => m.getText()) : [];
  const heritage = [];
  
  if (node.heritageClauses) {
    for (const clause of node.heritageClauses) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        heritage.push(...clause.types.map(t => t.getText()) as string[]);
      }
    }
  }
  
  const properties: Entity[] = [];
  
  node.members.forEach(member => {
    if (ts.isPropertySignature(member)) {
      const propName = member.name.getText();
      const type = member.type ? member.type.getText() : 'any';
      
      properties.push({
        name: propName,
        kind: 'property',
        description: extractJSDocComment(member),
        returnType: type
      });
    } else if (ts.isMethodSignature(member) && member.name) {
      const methodName = member.name.getText();
      const returnType = member.type ? member.type.getText() : 'void';
      const params = member.parameters.map(p => p.getText());
      
      properties.push({
        name: methodName,
        kind: 'method',
        description: extractJSDocComment(member),
        params,
        returnType
      });
    }
  });
  
  return {
    name,
    kind: 'interface',
    description: extractJSDocComment(node),
    modifiers,
    extends: heritage,
    properties
  };
}

/**
 * Extract function information
 */
function extractFunctionInfo(node: ts.FunctionDeclaration): Entity {
  const name = node.name ? node.name.getText() : 'Anonymous Function';
  const modifiers = node.modifiers ? node.modifiers.map(m => m.getText()) : [];
  const returnType = node.type ? node.type.getText() : 'void';
  const params = node.parameters.map(p => p.getText());
  
  return {
    name,
    kind: 'function',
    description: extractJSDocComment(node),
    modifiers,
    params,
    returnType
  };
}

/**
 * Extract variable information
 */
function extractVariableInfo(node: ts.VariableStatement): Entity[] {
  const entities: Entity[] = [];
  const modifiers = node.modifiers ? node.modifiers.map(m => m.getText()) : [];
  
  node.declarationList.declarations.forEach(declaration => {
    if (declaration.name && ts.isIdentifier(declaration.name)) {
      const name = declaration.name.getText();
      const type = declaration.type ? declaration.type.getText() : 'inferred';
      
      entities.push({
        name,
        kind: 'variable',
        description: extractJSDocComment(node),
        modifiers,
        returnType: type
      });
    }
  });
  
  return entities;
}

/**
 * Extract enum information
 */
function extractEnumInfo(node: ts.EnumDeclaration): Entity {
  const name = node.name.getText();
  const modifiers = node.modifiers ? node.modifiers.map(m => m.getText()) : [];
  const properties: Entity[] = [];
  
  node.members.forEach(member => {
    const memberName = member.name.getText();
    let value = '';
    
    if (member.initializer) {
      value = member.initializer.getText();
    }
    
    properties.push({
      name: memberName,
      kind: 'enum member',
      description: value,
      returnType: 'enum value'
    });
  });
  
  return {
    name,
    kind: 'enum',
    description: extractJSDocComment(node),
    modifiers,
    properties
  };
}

/**
 * Extract JSDoc comments
 */
function extractJSDocComment(node: ts.Node): string {
  const sourceFile = node.getSourceFile();
  const fullText = sourceFile.getFullText();
  const commentRanges = ts.getLeadingCommentRanges(fullText, node.pos);
  
  if (commentRanges && commentRanges.length > 0) {
    const commentRange = commentRanges[commentRanges.length - 1];
    const comment = fullText.substring(commentRange.pos, commentRange.end);
    
    // Clean up JSDoc markers
    return comment
      .replace(/\/\*\*|\*\/|^\s*\*\s?/gm, '')
      .trim();
  }
  
  return 'No description available.';
}

/**
 * Generate markdown documentation for a file
 */
function generateMarkdownDoc(fileDoc: FileDocumentation): string {
  const relativePath = path.relative(SRC_DIR, fileDoc.filePath);
  let markdown = `# ${fileDoc.fileName}\n\n`;
  
  // File path and overview
  markdown += `**File Path:** \`${relativePath}\`\n\n`;
  markdown += `## Overview\n\n${fileDoc.overview}\n\n`;
  
  // Imports
  if (fileDoc.imports.length > 0) {
    markdown += `## Dependencies\n\n`;
    markdown += fileDoc.imports.map(imp => `- \`${imp}\``).join('\n');
    markdown += '\n\n';
  }
  
  // Entities
  if (fileDoc.entities.length > 0) {
    markdown += `## Entities\n\n`;
    
    fileDoc.entities.forEach(entity => {
      markdown += `### ${entity.kind}: \`${entity.name}\`\n\n`;
      
      if (entity.modifiers && entity.modifiers.length > 0) {
        markdown += `**Modifiers:** ${entity.modifiers.join(', ')}\n\n`;
      }
      
      if (entity.extends && entity.extends.length > 0) {
        markdown += `**Extends:** ${entity.extends.join(', ')}\n\n`;
      }
      
      if (entity.implements && entity.implements.length > 0) {
        markdown += `**Implements:** ${entity.implements.join(', ')}\n\n`;
      }
      
      markdown += `${entity.description}\n\n`;
      
      if (entity.params && entity.params.length > 0) {
        markdown += `**Parameters:**\n\n`;
        entity.params.forEach(param => {
          markdown += `- \`${param}\`\n`;
        });
        markdown += '\n';
      }
      
      if (entity.returnType) {
        markdown += `**Returns:** \`${entity.returnType}\`\n\n`;
      }
      
      if (entity.properties && entity.properties.length > 0) {
        markdown += `**Properties:**\n\n`;
        
        entity.properties.forEach(prop => {
          const type = prop.returnType ? `: \`${prop.returnType}\`` : '';
          markdown += `- \`${prop.name}${type}\``;
          
          if (prop.description && prop.description !== 'No description available.') {
            markdown += ` - ${prop.description}`;
          }
          
          markdown += '\n';
        });
        
        markdown += '\n';
      }
      
      if (entity.methods && entity.methods.length > 0) {
        markdown += `**Methods:**\n\n`;
        
        entity.methods.forEach(method => {
          const params = method.params ? `(${method.params.join(', ')})` : '()';
          const returnType = method.returnType ? `: \`${method.returnType}\`` : '';
          
          markdown += `- \`${method.name}${params}${returnType}\``;
          
          if (method.description && method.description !== 'No description available.') {
            markdown += ` - ${method.description}`;
          }
          
          markdown += '\n';
        });
        
        markdown += '\n';
      }
    });
  }
  
  return markdown;
}

/**
 * Generate a mermaid entity relationship diagram for a folder
 */
function generateMermaidERD(folderPath: string, folderName: string): string {
  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
    .map(file => path.join(folderPath, file));
  
  const fileDocs = files.map(file => parseTypeScriptFile(file));
  let mermaid = '```mermaid\nclassDiagram\n';
  
  // Add classes and interfaces
  for (const fileDoc of fileDocs) {
    for (const entity of fileDoc.entities) {
      if (entity.kind === 'class' || entity.kind === 'interface') {
        mermaid += `  class ${entity.name} {\n`;
        
        if (entity.properties) {
          for (const prop of entity.properties) {
            const type = prop.returnType ? `: ${prop.returnType}` : '';
            mermaid += `    ${prop.name}${type}\n`;
          }
        }
        
        if (entity.methods) {
          for (const method of entity.methods) {
            const returnType = method.returnType ? `: ${method.returnType}` : '';
            mermaid += `    ${method.name}()${returnType}\n`;
          }
        }
        
        mermaid += '  }\n';
      }
    }
  }
  
  // Add relationships
  for (const fileDoc of fileDocs) {
    for (const entity of fileDoc.entities) {
      if (entity.extends && entity.extends.length > 0) {
        for (const ext of entity.extends as string[]) {
          mermaid += `  ${entity.name} --|> ${ext}: extends\n`;
        }
      }
      
      if (entity.implements && entity.implements.length > 0) {
        for (const impl of entity.implements as string[]) {
          mermaid += `  ${entity.name} ..|> ${impl}: implements\n`;
        }
      }
    }
    
    // Add dependencies based on imports
    for (const dependency of fileDoc.dependencies) {
      const dependencyName = path.basename(dependency, path.extname(dependency));
      for (const entity of fileDoc.entities) {
        if (entity.kind === 'class' || entity.kind === 'interface') {
          // Look for entities in other files that match the import
          for (const otherDoc of fileDocs) {
            if (otherDoc !== fileDoc) {
              for (const otherEntity of otherDoc.entities) {
                if (otherEntity.name === dependencyName) {
                  mermaid += `  ${entity.name} --> ${otherEntity.name}: uses\n`;
                }
              }
            }
          }
        }
      }
    }
  }
  
  mermaid += '```\n';
  return mermaid;
}

/**
 * Process a folder recursively
 */
async function processFolder(folderStructure: FolderStructure, currentPath: string = SRC_DIR): Promise<void> {
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
      const fileDoc = parseTypeScriptFile(filePath);
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
      const diagramPath = path.join(DIAGRAMS_DIR, `${folderStructure.path || folderStructure.name}.md`);
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
function generateDocIndex(folderStructure: FolderStructure): string {
  let markdown = '# Remcode Codebase Documentation\n\n';
  markdown += 'This documentation provides an overview of the Remcode codebase structure, entities, and relationships.\n\n';
  
  markdown += '## Folder Structure\n\n';
  
  function addFolderToIndex(folder: FolderStructure, depth: number): void {
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
  function addDiagramsToIndex(folder: FolderStructure, depth: number): void {
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
async function main(): Promise<void> {
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
