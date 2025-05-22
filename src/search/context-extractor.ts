import * as fs from 'fs';
import * as path from 'path';

// Using require instead of import to avoid module resolution issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const typescriptEstree = require('@typescript-eslint/typescript-estree');
import { getLogger } from '../utils/logger';

const logger = getLogger('ContextExtractor');

export interface CodeContext {
  targetContent: string;
  surroundingLines: string[];
  relatedFunctions: string[];
  imports: string[];
  classContext?: string;
  moduleContext?: string;
  fileStructure?: FileStructure;
}

export interface FileStructure {
  classes: ClassInfo[];
  functions: FunctionInfo[];
  exports: string[];
  imports: ImportInfo[];
}

export interface ClassInfo {
  name: string;
  methods: FunctionInfo[];
  properties: string[];
  startLine: number;
  endLine: number;
}

export interface FunctionInfo {
  name: string;
  params: string[];
  startLine: number;
  endLine: number;
  isMethod: boolean;
  parentClass?: string;
}

export interface ImportInfo {
  source: string;
  imported: string[];
  startLine: number;
}

export class ContextExtractor {
  /**
   * Extract code context from a file based on line range
   * @param filePath Path to the source file
   * @param startLine Starting line number (0-indexed)
   * @param endLine Ending line number (0-indexed)
   * @returns Extracted code context
   */
  async extractContext(filePath: string, startLine: number, endLine: number): Promise<CodeContext> {
    logger.info(`Extracting context for ${filePath}:${startLine}-${endLine}`);
    
    try {
      // Read file content
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Make sure the requested lines are within the file bounds
      if (startLine < 0 || endLine >= lines.length || startLine > endLine) {
        throw new Error(`Invalid line range: ${startLine}-${endLine} for file with ${lines.length} lines`);
      }
      
      // Extract the target content
      const targetContent = lines.slice(startLine, endLine + 1).join('\n');
      
      // Extract surrounding context (5 lines before and after)
      const contextSize = 5;
      const surroundingStart = Math.max(0, startLine - contextSize);
      const surroundingEnd = Math.min(lines.length - 1, endLine + contextSize);
      
      const surroundingLines = [
        ...lines.slice(surroundingStart, startLine),
        ...lines.slice(endLine + 1, surroundingEnd + 1)
      ];
      
      // Analyze file structure to find imports, classes, and functions
      const fileStructure = await this.getFileStructure(filePath);
      
      // Find class context if the code is within a class
      let classContext: string | undefined;
      for (const classInfo of fileStructure.classes) {
        if (startLine >= classInfo.startLine && endLine <= classInfo.endLine) {
          classContext = `class ${classInfo.name}`;
          break;
        }
      }
      
      // Find related functions that might be relevant to the selected code
      const relatedFunctions: string[] = [];
      for (const func of fileStructure.functions) {
        // Include functions that overlap with the target range
        const isOverlapping = (func.startLine <= endLine && func.endLine >= startLine);
        // Or functions that are close to the target range
        const isClose = Math.abs(func.startLine - endLine) <= 20 || Math.abs(func.endLine - startLine) <= 20;
        
        if (isOverlapping || isClose) {
          relatedFunctions.push(func.name);
        }
      }
      
      // Extract all imports
      const imports = fileStructure.imports.map(imp => 
        `import { ${imp.imported.join(', ')} } from "${imp.source}"`
      );
      
      // Get module context from the file path
      const moduleContext = path.basename(filePath, path.extname(filePath));
      
      return {
        targetContent,
        surroundingLines,
        relatedFunctions,
        imports,
        classContext,
        moduleContext,
        fileStructure
      };
    } catch (error) {
      logger.error(`Error extracting context: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Parse a file and extract its structure (classes, functions, imports, exports)
   * @param filePath Path to the source file
   * @returns Structured representation of the file
   */
  async getFileStructure(filePath: string): Promise<FileStructure> {
    logger.info(`Analyzing file structure: ${filePath}`);
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const fileExt = path.extname(filePath).toLowerCase();
      
      if (['.ts', '.tsx', '.js', '.jsx'].includes(fileExt)) {
        return this.parseTypescript(content, fileExt.includes('x'));
      } else {
        // For non-JS/TS files, provide a simplified structure
        return this.parseGenericFile(content);
      }
    } catch (error) {
      logger.error(`Error analyzing file structure: ${error instanceof Error ? error.message : String(error)}`);
      return {
        classes: [],
        functions: [],
        exports: [],
        imports: []
      };
    }
  }
  
  /**
   * Parse TypeScript/JavaScript files to extract their structure
   * @param content File content
   * @param isJsx Whether the file contains JSX
   * @returns Structured representation of the file
   */
  private parseTypescript(content: string, isJsx: boolean): FileStructure {
    try {
      const ast = typescriptEstree.parse(content, {
        jsx: isJsx,
        loc: true
      });
      
      const classes: ClassInfo[] = [];
      const functions: FunctionInfo[] = [];
      const exports: string[] = [];
      const imports: ImportInfo[] = [];
      
      // Process the AST to extract code structure
      this.traverseAst(ast, {
        classes,
        functions,
        exports,
        imports
      });
      
      return {
        classes,
        functions,
        exports,
        imports
      };
    } catch (error) {
      logger.error(`Error parsing TypeScript: ${error instanceof Error ? error.message : String(error)}`);
      return {
        classes: [],
        functions: [],
        exports: [],
        imports: []
      };
    }
  }
  
  /**
   * Parse non-JS/TS files for a simplified structure
   * @param content File content
   * @returns Basic file structure
   */
  private parseGenericFile(content: string): FileStructure {
    const lines = content.split('\n');
    const imports: ImportInfo[] = [];
    const functions: FunctionInfo[] = [];
    
    // Simple regex-based detection for common patterns
    // This is a simplistic approach; a real implementation would be more sophisticated
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect import statements in various languages
      if (line.match(/^import\s|^#include\s|^from\s.*\simport\s|^require\s/)) {
        imports.push({
          source: line.split(/['"]/).filter(Boolean)[0] || 'unknown',
          imported: ['*'],
          startLine: i
        });
      }
      
      // Detect function declarations
      const functionMatch = line.match(/^(function|def|func)\s+(\w+)\s*\(/i);
      if (functionMatch) {
        const name = functionMatch[2];
        functions.push({
          name,
          params: [],
          startLine: i,
          endLine: i + 10, // Estimate function length
          isMethod: false
        });
      }
    }
    
    return {
      classes: [],
      functions,
      exports: [],
      imports
    };
  }
  
  /**
   * Traverse the AST to extract code structure
   * @param ast AST node to process
   * @param structure Structure being built
   */
  private traverseAst(ast: any, structure: FileStructure): void {
    // This is a simplified implementation of AST traversal
    // A real implementation would be more comprehensive
    
    if (!ast || typeof ast !== 'object') return;
    
    // Process node based on its type
    if (ast.type) {
      switch (ast.type) {
        case 'ImportDeclaration':
          this.processImport(ast, structure.imports);
          break;
        case 'ExportNamedDeclaration':
        case 'ExportDefaultDeclaration':
          this.processExport(ast, structure.exports);
          break;
        case 'ClassDeclaration':
        case 'ClassExpression':
          this.processClass(ast, structure.classes, structure.functions);
          break;
        case 'FunctionDeclaration':
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
          this.processFunction(ast, structure.functions);
          break;
      }
    }
    
    // Recursively process all properties
    for (const key in ast) {
      if (Array.isArray(ast[key])) {
        ast[key].forEach((node: any) => this.traverseAst(node, structure));
      } else if (ast[key] && typeof ast[key] === 'object') {
        this.traverseAst(ast[key], structure);
      }
    }
  }
  
  /**
   * Process an import declaration node
   * @param node Import node
   * @param imports Collection of imports
   */
  private processImport(node: any, imports: ImportInfo[]): void {
    if (!node.source || !node.source.value) return;
    
    const importInfo: ImportInfo = {
      source: node.source.value,
      imported: [],
      startLine: node.loc ? node.loc.start.line - 1 : 0
    };
    
    if (node.specifiers) {
      for (const specifier of node.specifiers) {
        if (specifier.imported) {
          importInfo.imported.push(specifier.imported.name || 'default');
        } else if (specifier.local) {
          importInfo.imported.push(specifier.local.name || 'default');
        }
      }
    }
    
    imports.push(importInfo);
  }
  
  /**
   * Process an export declaration node
   * @param node Export node
   * @param exports Collection of exports
   */
  private processExport(node: any, exports: string[]): void {
    if (node.declaration) {
      if (node.declaration.id && node.declaration.id.name) {
        exports.push(node.declaration.id.name);
      } else if (node.declaration.declarations) {
        for (const decl of node.declaration.declarations) {
          if (decl.id && decl.id.name) {
            exports.push(decl.id.name);
          }
        }
      }
    }
    
    if (node.specifiers) {
      for (const specifier of node.specifiers) {
        if (specifier.exported && specifier.exported.name) {
          exports.push(specifier.exported.name);
        }
      }
    }
  }
  
  /**
   * Process a class declaration node
   * @param node Class node
   * @param classes Collection of classes
   * @param functions Collection of functions
   */
  private processClass(node: any, classes: ClassInfo[], functions: FunctionInfo[]): void {
    if (!node.id || !node.id.name) return;
    
    const className = node.id.name;
    const classInfo: ClassInfo = {
      name: className,
      methods: [],
      properties: [],
      startLine: node.loc ? node.loc.start.line - 1 : 0,
      endLine: node.loc ? node.loc.end.line - 1 : 0
    };
    
    if (node.body && node.body.body) {
      for (const member of node.body.body) {
        if (member.type === 'MethodDefinition') {
          this.processMethod(member, className, classInfo.methods, functions);
        } else if (member.type === 'PropertyDefinition') {
          if (member.key && member.key.name) {
            classInfo.properties.push(member.key.name);
          }
        }
      }
    }
    
    classes.push(classInfo);
  }
  
  /**
   * Process a method definition
   * @param node Method node
   * @param className Parent class name
   * @param methods Collection of class methods
   * @param functions Collection of all functions
   */
  private processMethod(node: any, className: string, methods: FunctionInfo[], functions: FunctionInfo[]): void {
    if (!node.key || !node.key.name) return;
    
    const methodName = node.key.name;
    const methodInfo: FunctionInfo = {
      name: methodName,
      params: this.extractParams(node.value),
      startLine: node.loc ? node.loc.start.line - 1 : 0,
      endLine: node.loc ? node.loc.end.line - 1 : 0,
      isMethod: true,
      parentClass: className
    };
    
    methods.push(methodInfo);
    functions.push(methodInfo); // Add to both collections
  }
  
  /**
   * Process a function declaration
   * @param node Function node
   * @param functions Collection of functions
   */
  private processFunction(node: any, functions: FunctionInfo[]): void {
    // Skip anonymous functions without an identifier
    if ((node.type === 'FunctionDeclaration' && (!node.id || !node.id.name)) ||
        (node.type !== 'FunctionDeclaration' && (!node.id || !node.id.name))) {
      return;
    }
    
    const functionName = node.id ? node.id.name : 'anonymous';
    const functionInfo: FunctionInfo = {
      name: functionName,
      params: this.extractParams(node),
      startLine: node.loc ? node.loc.start.line - 1 : 0,
      endLine: node.loc ? node.loc.end.line - 1 : 0,
      isMethod: false
    };
    
    functions.push(functionInfo);
  }
  
  /**
   * Extract function parameters
   * @param node Function node
   * @returns Array of parameter names
   */
  private extractParams(node: any): string[] {
    const params: string[] = [];
    
    if (!node.params) return params;
    
    for (const param of node.params) {
      if (param.name) {
        params.push(param.name);
      } else if (param.left && param.left.name) {
        params.push(param.left.name);
      } else if (param.type === 'ObjectPattern') {
        params.push('{...}');
      } else if (param.type === 'ArrayPattern') {
        params.push('[...]');
      } else if (param.type === 'RestElement' && param.argument && param.argument.name) {
        params.push(`...${param.argument.name}`);
      }
    }
    
    return params;
  }
}
