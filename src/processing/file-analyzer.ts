import { getLogger } from '../utils/logger';
import { FileChange } from './change-detector';
import * as fs from 'fs';
import * as path from 'path';
// Note: For production use, install these dependencies:
// npm install @typescript-eslint/parser acorn --save-dev

// Using regex-based parsing as a fallback if AST parsers aren't available

const logger = getLogger('FileAnalyzer');

export interface FileAnalysis {
  path: string;
  category: 'priority' | 'normal' | 'test' | 'config' | 'ignore';
  language: string;
  complexity: 'low' | 'medium' | 'high';
  size: number;
  sloc?: number; // Source lines of code (excluding comments and blank lines)
  imports?: string[];
  exports?: string[];
  functions?: string[];
  classes?: string[];
  dependencies?: string[];
  chunkingStrategy: ChunkingStrategy;
  metadata?: Record<string, any>;
}

export type ChunkingStrategy = 
  | 'function_level' // Chunk by function/method
  | 'class_level'    // Chunk by class/module
  | 'file_level'     // Chunk by entire file
  | 'hybrid'         // Combination based on file size/complexity
  | 'semantic';      // Based on semantic units of code

export interface AnalysisOptions {
  basePath: string;
  skipAST?: boolean;
  skipDependencies?: boolean;
  maxFileSizeBytes?: number;
}

export class FileAnalyzer {
  private repoPath: string;
  private maxFileSize: number;
  
  constructor(repoPath: string = process.cwd(), options: {
    maxFileSizeBytes?: number
  } = {}) {
    this.repoPath = repoPath;
    this.maxFileSize = options.maxFileSizeBytes || 1024 * 1024; // Default 1MB
  }
  
  /**
   * Analyze a list of changed files to determine their characteristics
   */
  async analyzeChangedFiles(changes: FileChange[], options: Partial<AnalysisOptions> = {}): Promise<FileAnalysis[]> {
    logger.info(`Analyzing ${changes.length} changed files`);
    
    const opts: AnalysisOptions = {
      basePath: this.repoPath,
      skipAST: options.skipAST || false,
      skipDependencies: options.skipDependencies || false,
      maxFileSizeBytes: options.maxFileSizeBytes || this.maxFileSize
    };
    
    // Filter out deleted files
    const activeChanges = changes.filter(change => change.status !== 'deleted');
    
    // Process in batches to avoid memory issues with large repos
    const batchSize = 20;
    const results: FileAnalysis[] = [];
    
    for (let i = 0; i < activeChanges.length; i += batchSize) {
      const batch = activeChanges.slice(i, i + batchSize);
      logger.debug(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(activeChanges.length/batchSize)}`);
      
      // Process files in parallel within each batch
      const batchResults = await Promise.all(
        batch.map(change => this.analyzeFile(change.path, opts))
      );
      
      results.push(...batchResults);
    }
    
    logger.info(`Completed analysis of ${results.length} files`);
    return results;
  }
  
  /**
   * Analyze a single file to determine its characteristics
   */
  async analyzeFile(filePath: string, options: AnalysisOptions): Promise<FileAnalysis> {
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(options.basePath, filePath);
    
    const relativePath = path.isAbsolute(filePath)
      ? path.relative(options.basePath, filePath)
      : filePath;
    
    logger.debug(`Analyzing file: ${relativePath}`);
    
    // Basic file info
    const language = this.detectLanguage(relativePath);
    const category = this.categorizeFile(relativePath);
    
    // Default analysis with minimal info
    const analysis: FileAnalysis = {
      path: relativePath,
      category,
      language,
      complexity: 'low',
      size: 0,
      chunkingStrategy: this.determineChunkingStrategy(relativePath, language)
    };
    
    try {
      // Check if file exists and get its stats
      if (!fs.existsSync(absolutePath)) {
        logger.warn(`File not found: ${absolutePath}`);
        return analysis;
      }
      
      const stats = fs.statSync(absolutePath);
      analysis.size = stats.size;
      
      // Skip very large files to avoid memory issues
      if (stats.size > (options.maxFileSizeBytes || this.maxFileSize)) {
        logger.warn(`Skipping detailed analysis of large file (${stats.size} bytes): ${relativePath}`);
        analysis.complexity = 'high'; // Assume large files are complex
        return analysis;
      }
      
      // Read file content
      const content = fs.readFileSync(absolutePath, 'utf8');
      
      // Count source lines of code (excluding comments and blank lines)
      analysis.sloc = this.countSourceLines(content, language);
      
      // Set complexity based on SLOC
      analysis.complexity = this.determineComplexity(analysis.sloc, language);
      
      // Skip AST parsing if requested
      if (options.skipAST) {
        return analysis;
      }
      
      // Additional language-specific analysis
      if (language === 'typescript' || language === 'javascript') {
        this.analyzeJsTs(content, analysis, language);
      } else if (language === 'python') {
        this.analyzePython(content, analysis);
      }
      
      // Determine chunking strategy based on detailed analysis
      analysis.chunkingStrategy = this.refineChunkingStrategy(analysis);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Error analyzing file ${relativePath}: ${errorMsg}`);
      // Return basic analysis with what we have
    }
    
    return analysis;
  }
  
  /**
   * Analyze JavaScript/TypeScript code
   */
  private analyzeJsTs(content: string, analysis: FileAnalysis, language: string): void {
    try {
      // Using regex-based analysis instead of full AST parsing for simplicity
      // Extract imports, exports, functions, and classes
      analysis.imports = [];
      analysis.exports = [];
      analysis.functions = [];
      analysis.classes = [];
      
      // Simple extraction of imports (without full AST traversal)
      const importRegex = /import\s+(?:(?:\{[^\}]*\}|\*\s+as\s+[\w$]+|[\w$]+)\s+from\s+)?['"]([^'"]+)['"];?/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        if (match[1]) analysis.imports.push(match[1]);
      }
      
      // Simple extraction of exports (without full AST traversal)
      const exportRegex = /export\s+(?:(?:default\s+)?(?:class|function|const|let|var)\s+([\w$]+))/g;
      while ((match = exportRegex.exec(content)) !== null) {
        if (match[1]) analysis.exports.push(match[1]);
      }
      
      // Simple extraction of functions and classes (without full AST traversal)
      const functionRegex = /(?:function\s+([\w$]+)|(?:const|let|var)\s+([\w$]+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g;
      while ((match = functionRegex.exec(content)) !== null) {
        const name = match[1] || match[2];
        if (name) analysis.functions.push(name);
      }
      
      const classRegex = /class\s+([\w$]+)/g;
      while ((match = classRegex.exec(content)) !== null) {
        if (match[1]) analysis.classes.push(match[1]);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Error parsing ${language} code: ${errorMsg}`);
    }
  }
  
  /**
   * Analyze Python code
   */
  private analyzePython(content: string, analysis: FileAnalysis): void {
    try {
      // Simple regex-based analysis for Python (without full AST parsing)
      analysis.imports = [];
      analysis.functions = [];
      analysis.classes = [];
      
      // Extract imports
      const importRegex = /(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importName = match[1] || match[2];
        if (importName) analysis.imports.push(importName);
      }
      
      // Extract functions
      const functionRegex = /def\s+([\w_]+)\s*\(/g;
      while ((match = functionRegex.exec(content)) !== null) {
        if (match[1]) analysis.functions.push(match[1]);
      }
      
      // Extract classes
      const classRegex = /class\s+([\w_]+)\s*(?:\([^)]*\))?:/g;
      while ((match = classRegex.exec(content)) !== null) {
        if (match[1]) analysis.classes.push(match[1]);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Error analyzing Python code: ${errorMsg}`);
    }
  }
  
  /**
   * Count source lines of code (excluding comments and blank lines)
   */
  private countSourceLines(content: string, language: string): number {
    // Remove comments based on language
    let noComments = content;
    
    if (language === 'typescript' || language === 'javascript') {
      // Remove JS/TS comments
      noComments = noComments
        .replace(/\/\/.*$/gm, '') // Single line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // Multi-line comments
    } else if (language === 'python') {
      // Remove Python comments
      noComments = noComments
        .replace(/#.*$/gm, '') // Single line comments
        .replace(/'''[\s\S]*?'''/g, '') // Triple single quote docstrings
        .replace(/"""[\s\S]*?"""/g, ''); // Triple double quote docstrings
    }
    
    // Split into lines and count non-empty lines
    return noComments.split('\n')
      .filter(line => line.trim().length > 0)
      .length;
  }
  
  /**
   * Determine the complexity of a file based on its characteristics
   */
  private determineComplexity(sloc: number, language: string): FileAnalysis['complexity'] {
    // Simple complexity determination based on SLOC
    if (sloc < 100) return 'low';
    if (sloc < 500) return 'medium';
    return 'high';
  }
  
  /**
   * Determine the initial chunking strategy based on file path and language
   */
  private determineChunkingStrategy(filePath: string, language: string): ChunkingStrategy {
    const filename = path.basename(filePath).toLowerCase();
    
    // Special case for specific file types
    if (filename === 'package.json' || filename === 'tsconfig.json' || filename.endsWith('.config.js')) {
      return 'file_level';
    }
    
    // Language-specific defaults
    if (language === 'typescript' || language === 'javascript') {
      return 'function_level';
    } else if (language === 'python') {
      return 'function_level';
    }
    
    return 'hybrid';
  }
  
  /**
   * Refine the chunking strategy based on the detailed analysis
   */
  private refineChunkingStrategy(analysis: FileAnalysis): ChunkingStrategy {
    // Start with the initial strategy
    let strategy = analysis.chunkingStrategy;
    
    // If file is very small, use file_level
    if (analysis.size < 1000 || (analysis.sloc && analysis.sloc < 50)) {
      return 'file_level';
    }
    
    // If file has many classes but few functions, use class_level
    if (analysis.classes && analysis.classes.length > 1 && 
        (!analysis.functions || analysis.functions.length / analysis.classes.length < 5)) {
      return 'class_level';
    }
    
    // If file is very complex, use hybrid approach
    if (analysis.complexity === 'high') {
      return 'hybrid';
    }
    
    return strategy;
  }
  
  /**
   * Detect the programming language of a file based on its extension
   */
  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    const langMap: Record<string, string> = {
      // TypeScript/JavaScript
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.mjs': 'javascript',
      '.cjs': 'javascript',
      
      // Python
      '.py': 'python',
      '.pyi': 'python',
      '.pyx': 'python',
      
      // Java and JVM
      '.java': 'java',
      '.kt': 'kotlin',
      '.groovy': 'groovy',
      '.scala': 'scala',
      
      // C-family
      '.c': 'c',
      '.cpp': 'cpp',
      '.cc': 'cpp',
      '.h': 'c',
      '.hpp': 'cpp',
      
      // C#
      '.cs': 'csharp',
      
      // Go
      '.go': 'go',
      
      // Rust
      '.rs': 'rust',
      
      // Swift
      '.swift': 'swift',
      
      // Web
      '.html': 'html',
      '.htm': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.less': 'less',
      
      // PHP
      '.php': 'php',
      
      // Ruby
      '.rb': 'ruby',
      
      // Shell
      '.sh': 'shell',
      '.bash': 'shell',
      '.zsh': 'shell',
      
      // Data formats
      '.json': 'json',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.xml': 'xml',
      
      // Markdown and docs
      '.md': 'markdown',
      '.mdx': 'markdown',
      '.rst': 'restructuredtext',
    };
    
    return langMap[ext] || 'unknown';
  }
  
  /**
   * Categorize a file based on its path and name
   */
  private categorizeFile(filePath: string): FileAnalysis['category'] {
    const filename = path.basename(filePath).toLowerCase();
    const dirPath = path.dirname(filePath).toLowerCase();
    
    // Test files
    if (filename.includes('test') || filename.includes('spec') || 
        dirPath.includes('test') || dirPath.includes('spec') || 
        dirPath.includes('__tests__')) {
      return 'test';
    }
    
    // Config files
    if (filename.includes('config') || filename.includes('setup') || 
        filename.endsWith('.json') || filename.endsWith('.yml') || 
        filename.endsWith('.yaml') || filename.endsWith('.ini') || 
        filename === '.env' || filename.startsWith('.') || 
        dirPath.includes('config')) {
      return 'config';
    }
    
    // Priority files (entry points, core modules)
    if (filename === 'index.ts' || filename === 'index.js' || 
        filename === 'main.ts' || filename === 'main.js' || 
        filename === 'app.ts' || filename === 'app.js' || 
        dirPath.includes('core') || dirPath.includes('main')) {
      return 'priority';
    }
    
    // Files to ignore
    if (filename.endsWith('.min.js') || filename.endsWith('.d.ts') || 
        dirPath.includes('node_modules') || dirPath.includes('dist') || 
        dirPath.includes('build')) {
      return 'ignore';
    }
    
    return 'normal';
  }
}
