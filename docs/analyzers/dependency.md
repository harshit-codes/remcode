# dependency.ts

**File Path:** `analyzers/dependency.ts`

## Overview

Represents a complete dependency analysis of a repository

## Dependencies

- `../utils/logger`

## Classes

### `DependencyAnalyzer`

**Class Definition:**

```typescript
export class DependencyAnalyzer {
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  /**
   * Analyzes dependencies in the repository
   * @returns A complete dependency analysis
   */
  async analyze(): Promise<DependencyAnalysis> {
    logger.info(`Analyzing dependencies at ${this.repoPath}`);
    
    // Step 1: Find all code files in the repository
    const codeFiles = await this.findCodeFiles();
    logger.info(`Found ${codeFiles.length} code files to analyze`);
    
    // Step 2: Create modules map (directories)
    const modules: Record<string, {dependencies: string[]; dependents: string[]; is_core: boolean}> = {};
    const modulePaths = new Set<string>();
    
    codeFiles.forEach(file => {
      const relativePath = path.relative(this.repoPath, file);
      const modulePath = path.dirname(relativePath);
      if (modulePath !== '.') {
        modulePaths.add(modulePath);
      }
    });
    
    // Initialize modules
    modulePaths.forEach(modulePath => {
      modules[modulePath] = {
        dependencies: [],
        dependents: [],
        is_core: this.isCorePath(modulePath)
      };
    });
    
    // Step 3: Analyze each file for dependencies
    const files: Record<string, {
      dependencies: string[];
      dependents: string[];
      imports: Record<string, string[]>;
      exports: string[];
      is_entry_point: boolean;
    }> = {};
    
    const graph = {
      nodes: [] as Array<{id: string; type: 'file' | 'module'; is_core?: boolean; is_entry_point?: boolean}>,
      edges: [] as Array<{source: string; target: string; type: 'imports' | 'exports' | 'uses'}>
    };
    
    // Add module nodes to graph
    Object.keys(modules).forEach(moduleName => {
      graph.nodes.push({
        id: moduleName,
        type: 'module',
        is_core: modules[moduleName].is_core
      });
    });
    
    // Analyze each file
    for (const file of codeFiles) {
      const relativePath = path.relative(this.repoPath, file);
      const fileAnalysis = await this.analyzeFile(file);
      
      files[relativePath] = {
        dependencies: fileAnalysis.dependencies,
        dependents: [],
        imports: fileAnalysis.imports,
        exports: fileAnalysis.exports,
        is_entry_point: this.isEntryPoint(relativePath)
      };
      
      // Add file node to graph
      graph.nodes.push({
        id: relativePath,
        type: 'file',
        is_entry_point: this.isEntryPoint(relativePath)
      });
    }
    
    // Step 4: Build dependents lists and dependency graph
    Object.entries(files).forEach(([filePath, fileInfo]) => {
      const modulePathOfFile = path.dirname(filePath);
      
      // Add dependency edges to graph
      fileInfo.dependencies.forEach(dependency => {
        // Add to file dependencies
        if (files[dependency]) {
          files[dependency].dependents.push(filePath);
          
          // Add edge to graph
          graph.edges.push({
            source: filePath,
            target: dependency,
            type: 'imports'
          });
        }
        
        // Add to module dependencies
        const dependencyModulePath = path.dirname(dependency);
        if (dependencyModulePath !== '.' && modulePathOfFile !== dependencyModulePath) {
          if (!modules[modulePathOfFile].dependencies.includes(dependencyModulePath)) {
            modules[modulePathOfFile].dependencies.push(dependencyModulePath);
            if (modules[dependencyModulePath]) {
              modules[dependencyModulePath].dependents.push(modulePathOfFile);
            }
            
            // Add module dependency edge
            graph.edges.push({
              source: modulePathOfFile,
              target: dependencyModulePath,
              type: 'uses'
            });
          }
        }
      });
    });
    
    // Step 5: Identify key files
    const keyFiles = this.identifyKeyFiles(files);
    
    return {
      modules,
      files,
      key_files: keyFiles,
      dependency_graph: graph
    };
  }

  /**
   * Finds all code files in the repository
   */
  private async findCodeFiles(): Promise<string[]> {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.py', '.rb', '.java', '.go', '.php', '.rs', '.swift', '.cs', '.c', '.cpp'];
    
    const allFiles = await glob.glob('**/*', {
      cwd: this.repoPath,
      absolute: true,
      nodir: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']
    });
    
    return allFiles.filter(file => codeExtensions.includes(path.extname(file)));
  }

  /**
   * Determines if a path is a core module
   */
  private isCorePath(modulePath: string): boolean {
    // Consider core folders like 'src', 'lib', 'app', 'core'
    const coreFolders = ['src', 'lib', 'app', 'core'];
    const topLevelFolder = modulePath.split('/')[0];
    return coreFolders.includes(topLevelFolder);
  }
  
  /**
   * Determines if a file is an entry point
   */
  private isEntryPoint(filePath: string): boolean {
    const entryPointPatterns = [
      /index\.(js|jsx|ts|tsx)$/,
      /main\.(js|jsx|ts|tsx)$/,
      /app\.(js|jsx|ts|tsx)$/,
      /server\.(js|jsx|ts|tsx)$/
    ];
    
    return entryPointPatterns.some(pattern => pattern.test(filePath));
  }
  
  /**
   * Identifies key files in the codebase
   */
  private identifyKeyFiles(files: Record<string, any>): string[] {
    const keyFiles: string[] = [];
    
    // Files with many dependents are key files
    Object.entries(files).forEach(([filePath, fileInfo]) => {
      if (fileInfo.dependents.length > 3 || fileInfo.is_entry_point) {
        keyFiles.push(filePath);
      }
    });
    
    // If no key files found, use entry points
    if (keyFiles.length === 0) {
      Object.entries(files).forEach(([filePath, fileInfo]) => {
        if (fileInfo.is_entry_point) {
          keyFiles.push(filePath);
        }
      });
    }
    
    return keyFiles;
  }
  
  /**
   * Analyzes a single file for dependencies
   * @param filePath Path to the file
   */
  private async analyzeFile(filePath: string): Promise<{
    dependencies: string[];
    imports: Record<string, string[]>;
    exports: string[];
  }> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();
      
      const dependencies: string[] = [];
      const imports: Record<string, string[]> = {};
      const exports: string[] = [];
      
      // Handle different file types
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        // JavaScript/TypeScript
        this.parseJSImports(content, imports, dependencies, filePath);
        this.parseJSExports(content, exports);
      } else if (ext === '.py') {
        // Python
        this.parsePythonImports(content, imports, dependencies, filePath);
      }
      
      return { dependencies, imports, exports };
    } catch (error) {
      logger.error(`Error analyzing file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      return { dependencies: [], imports: {}, exports: [] };
    }
  }
  
  /**
   * Parses JavaScript/TypeScript imports
   */
  private parseJSImports(content: string, imports: Record<string, string[]>, dependencies: string[], filePath: string): void {
    // ES6 imports
    const es6ImportRegex = /import\s+(?:{\s*([\w\s,]+)\s*}\s+from\s+)?['"]([^'"]+)['"];?/g;
    let match;
    
    while ((match = es6ImportRegex.exec(content)) !== null) {
      const importedSymbols = match[1] ? match[1].split(',').map(s => s.trim()).filter(Boolean) : [];
      const modulePath = match[2];
      
      if (modulePath) {
        // Handle relative imports
        if (modulePath.startsWith('.')) {
          const resolved = this.resolveRelativePath(modulePath, filePath);
          if (resolved) {
            dependencies.push(resolved);
            imports[resolved] = importedSymbols;
          }
        } else {
          // External dependency
          imports[modulePath] = importedSymbols;
        }
      }
    }
    
    // CommonJS require
    const requireRegex = /(?:const|let|var)\s+(?:{\s*([\w\s,]+)\s*}|([\w\s,]+))\s*=\s*require\(['"]([^'"]+)['"]\)/g;
    
    while ((match = requireRegex.exec(content)) !== null) {
      const importedSymbols = match[1] ? match[1].split(',').map(s => s.trim()).filter(Boolean) : [];
      const moduleName = match[2] ? [match[2].trim()] : [];
      const modulePath = match[3];
      
      if (modulePath) {
        // Handle relative imports
        if (modulePath.startsWith('.')) {
          const resolved = this.resolveRelativePath(modulePath, filePath);
          if (resolved) {
            dependencies.push(resolved);
            imports[resolved] = [...importedSymbols, ...moduleName];
          }
        } else {
          // External dependency
          imports[modulePath] = [...importedSymbols, ...moduleName];
        }
      }
    }
  }
  
  /**
   * Parses JavaScript/TypeScript exports
   */
  private parseJSExports(content: string, exports: string[]): void {
    // Named exports
    const namedExportRegex = /export\s+(?:const|let|var|function|class)\s+([\w]+)/g;
    let match;
    
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    // Default export
    const defaultExportRegex = /export\s+default\s+(?:function|class)?\s*([\w]+)?/g;
    
    while ((match = defaultExportRegex.exec(content)) !== null) {
      if (match[1]) {
        exports.push(`default:${match[1]}`);
      } else {
        exports.push('default');
      }
    }
  }
  
  /**
   * Parses Python imports
   */
  private parsePythonImports(content: string, imports: Record<string, string[]>, dependencies: string[], filePath: string): void {
    // Python import statements
    const importRegex = /from\s+([\w.]+)\s+import\s+([\w,\s*]+)|import\s+([\w,\s.]+)/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1] && match[2]) {
        // from X import Y
        const module = match[1];
        const symbols = match[2].split(',').map(s => s.trim()).filter(Boolean);
        
        // Only handle relative imports (for internal dependencies)
        if (module.startsWith('.')) {
          const resolved = this.resolveRelativePythonPath(module, filePath);
          if (resolved) {
            dependencies.push(resolved);
            imports[resolved] = symbols;
          }
        } else {
          imports[module] = symbols;
        }
      } else if (match[3]) {
        // import X
        const modules = match[3].split(',').map(s => s.trim()).filter(Boolean);
        
        modules.forEach(module => {
          // Only handle relative imports (for internal dependencies)
          if (module.startsWith('.')) {
            const resolved = this.resolveRelativePythonPath(module, filePath);
            if (resolved) {
              dependencies.push(resolved);
              imports[resolved] = ['*'];
            }
          } else {
            imports[module] = ['*'];
          }
        });
      }
    }
  }
  
  /**
   * Resolves a relative path to an absolute path
   */
  private resolveRelativePath(relativePath: string, fromFilePath: string): string | null {
    const fromDir = path.dirname(fromFilePath);
    const fullPath = path.resolve(fromDir, relativePath);
    
    // Try to resolve with different extensions
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    
    // If the path already has an extension
    if (path.extname(relativePath)) {
      const relativeToCwd = path.relative(this.repoPath, fullPath);
      return fs.existsSync(fullPath) ? relativeToCwd : null;
    }
    
    // Try with index files
    if (relativePath.endsWith('/')) {
      for (const ext of extensions) {
        const indexPath = path.join(fullPath, `index${ext}`);
        if (fs.existsSync(indexPath)) {
          return path.relative(this.repoPath, indexPath);
        }
      }
    }
    
    // Try with different extensions
    for (const ext of extensions) {
      const pathWithExt = `${fullPath}${ext}`;
      if (fs.existsSync(pathWithExt)) {
        return path.relative(this.repoPath, pathWithExt);
      }
    }
    
    // Try as directory with index file
    for (const ext of extensions) {
      const indexPath = path.join(fullPath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return path.relative(this.repoPath, indexPath);
      }
    }
    
    return null;
  }
  
  /**
   * Resolves a relative Python import path
   */
  private resolveRelativePythonPath(relativePath: string, fromFilePath: string): string | null {
    const fromDir = path.dirname(fromFilePath);
    const segments = relativePath.split('.');
    
    // Handle dot prefix (relative imports)
    let currentDir = fromDir;
    let dotCount = 0;
    
    while (segments[0] === '') {
      segments.shift();
      dotCount++;
      currentDir = path.dirname(currentDir);
    }
    
    if (segments.length === 0) {
      return path.relative(this.repoPath, currentDir);
    }
    
    const modulePath = path.join(currentDir, ...segments);
    
    // Check for .py file
    const pyFilePath = `${modulePath}.py`;
    if (fs.existsSync(pyFilePath)) {
      return path.relative(this.repoPath, pyFilePath);
    }
    
    // Check for __init__.py in directory
    const initPath = path.join(modulePath, '__init__.py');
    if (fs.existsSync(initPath)) {
      return path.relative(this.repoPath, initPath);
    }
    
    return null;
  }
}
```

**Methods:**

#### `analyze()`

Analyzes dependencies in the repository
@returns A complete dependency analysis

```typescript
analyze(): Promise<DependencyAnalysis> {
```

#### `isCorePath()`

Determines if a path is a core module

```typescript
isCorePath(modulePath: string): boolean {
    // Consider core folders like 'src', 'lib', 'app', 'core'
```

#### `isEntryPoint()`

Determines if a file is an entry point

```typescript
isEntryPoint(filePath: string): boolean {
```

#### `identifyKeyFiles()`

Identifies key files in the codebase

```typescript
identifyKeyFiles(files: Record<string, any>): string[] {
```

#### `parseJSImports()`

Parses JavaScript/TypeScript imports

```typescript
parseJSImports(content: string, imports: Record<string, string[]>, dependencies: string[], filePath: string): void {
    // ES6 imports
```

#### `parseJSExports()`

Parses JavaScript/TypeScript exports

```typescript
parseJSExports(content: string, exports: string[]): void {
    // Named exports
```

#### `parsePythonImports()`

Parses Python imports

```typescript
parsePythonImports(content: string, imports: Record<string, string[]>, dependencies: string[], filePath: string): void {
    // Python import statements
```

#### `resolveRelativePath()`

Resolves a relative path to an absolute path

```typescript
resolveRelativePath(relativePath: string, fromFilePath: string): string | null {
```

#### `resolveRelativePythonPath()`

Resolves a relative Python import path

```typescript
resolveRelativePythonPath(relativePath: string, fromFilePath: string): string | null {
```

## Variables

- `defaultExportRegex`

