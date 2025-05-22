# file-analyzer.ts

**File Path:** `processing/file-analyzer.ts`

## Overview

Analyze a list of changed files to determine their characteristics

## Dependencies

- `../utils/logger`
- `./types`

## Classes

### `FileAnalyzer`

**Class Definition:**

```typescript
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
```

**Methods:**

#### `analyzeChangedFiles()`

Analyze a list of changed files to determine their characteristics

```typescript
analyzeChangedFiles(changes: FileChange[], options: Partial<AnalysisOptions> = {}
```

#### `analyzeFile()`

Analyze a single file to determine its characteristics

```typescript
analyzeFile(filePath: string, options: AnalysisOptions): Promise<FileAnalysis> {
```

#### `analyzeJsTs()`

Analyze JavaScript/TypeScript code

```typescript
analyzeJsTs(content: string, analysis: FileAnalysis, language: string): void {
```

#### `analyzePython()`

Analyze Python code

```typescript
analyzePython(content: string, analysis: FileAnalysis): void {
```

#### `countSourceLines()`

Count source lines of code (excluding comments and blank lines)

```typescript
countSourceLines(content: string, language: string): number {
    // Remove comments based on language
```

#### `determineComplexity()`

Determine the complexity of a file based on its characteristics

```typescript
determineComplexity(sloc: number, language: string): FileAnalysis['complexity'] {
    // Simple complexity determination based on SLOC
```

#### `determineChunkingStrategy()`

Determine the initial chunking strategy based on file path and language

```typescript
determineChunkingStrategy(filePath: string, language: string): ChunkStrategyType {
```

#### `refineChunkingStrategy()`

Refine the chunking strategy based on the detailed analysis

```typescript
refineChunkingStrategy(analysis: FileAnalysis): ChunkStrategyType {
    // Start with the initial strategy
```

#### `detectLanguage()`

Detect the programming language of a file based on its extension

```typescript
detectLanguage(filePath: string): string {
```

#### `categorizeFile()`

Categorize a file based on its path and name

```typescript
categorizeFile(filePath: string): FileAnalysis['category'] {
```

