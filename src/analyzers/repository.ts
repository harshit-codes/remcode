import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { getLogger } from '../utils/logger';

const logger = getLogger('RepositoryAnalyzer');

interface RepositoryAnalyzerOptions {
  depth?: number;
  ignore?: string[];
}

interface RepositoryInfo {
  name: string;
  total_files: number;
  total_lines: number;
  languages: Record<string, {
    files: number;
    lines: number;
    percentage: number;
  }>;
  build_systems: string[];
}

interface ModuleInfo {
  module_path: string;
  files: number;
  complexity_score: number;
  test_coverage?: number;
  recommended_chunking: string;
  quality_assessment: string;
  languages: string[];
  dependencies: string[];
}

interface FileInfo {
  file_path: string;
  line_count: number;
  complexity_score: number;
  test_coverage?: number;
  quality_assessment: string;
  classes: number;
  functions: number;
  recommended_chunking: string;
  dependencies: string[];
}

interface RepositoryAnalysis {
  repository_info: RepositoryInfo;
  modules: ModuleInfo[];
  files: FileInfo[];
}

/**
 * Mapping of file extensions to languages
 */
const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  javascript: ['.js', '.jsx'],
  typescript: ['.ts', '.tsx'],
  python: ['.py'],
  java: ['.java'],
  kotlin: ['.kt'],
  swift: ['.swift'],
  ruby: ['.rb'],
  go: ['.go'],
  rust: ['.rs'],
  csharp: ['.cs'],
  cpp: ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
  php: ['.php'],
  html: ['.html', '.htm'],
  css: ['.css', '.scss', '.sass', '.less'],
  json: ['.json'],
  markdown: ['.md', '.markdown'],
  yaml: ['.yml', '.yaml'],
  shell: ['.sh', '.bash', '.zsh'],
  sql: ['.sql'],
  xml: ['.xml'],
};

/**
 * Common build systems by language
 */
const BUILD_SYSTEMS: Record<string, string[]> = {
  javascript: ['npm', 'yarn', 'pnpm'],
  typescript: ['npm', 'yarn', 'pnpm'],
  python: ['pip', 'poetry', 'conda', 'setuptools'],
  java: ['maven', 'gradle', 'ant'],
  kotlin: ['gradle'],
  ruby: ['bundler', 'rake'],
  go: ['go modules'],
  rust: ['cargo'],
  csharp: ['dotnet', 'nuget'],
  cpp: ['cmake', 'make', 'bazel'],
};

/**
 * Analyzes a repository to provide insights about its structure and composition
 */
export class RepositoryAnalyzer {
  private repoPath: string;
  private options: Required<RepositoryAnalyzerOptions>;
  private extensionToLanguage: Map<string, string>;

  /**
   * Creates a new RepositoryAnalyzer
   * @param repoPath Path to the repository to analyze
   * @param options Configuration options
   */
  constructor(repoPath: string, options: RepositoryAnalyzerOptions = {}) {
    this.repoPath = repoPath;
    this.options = {
      depth: options.depth || 2,
      ignore: options.ignore || ['node_modules', 'dist', 'build', '.git']
    };
    
    // Create a map of extensions to languages for quick lookups
    this.extensionToLanguage = new Map();
    for (const [language, extensions] of Object.entries(LANGUAGE_EXTENSIONS)) {
      for (const ext of extensions) {
        this.extensionToLanguage.set(ext, language);
      }
    }
  }

  /**
   * Analyzes the repository to provide insights about its structure and composition
   * @returns Analysis results
   */
  async analyze(): Promise<RepositoryAnalysis> {
    logger.info(`Analyzing repository at ${this.repoPath}`);
    
    // Step 1: Find all files in the repository
    const allFiles = await this.findFiles();
    logger.info(`Found ${allFiles.length} files in the repository`);
    
    // Step 2: Analyze repository stats
    const repoInfo = await this.analyzeRepositoryInfo(allFiles);
    
    // Step 3: Identify and analyze modules
    const modules = await this.analyzeModules(allFiles);
    
    // Step 4: Analyze individual files
    const files = await this.analyzeFiles(allFiles, modules);
    
    return {
      repository_info: repoInfo,
      modules,
      files
    };
  }
  
  /**
   * Finds all files in the repository
   */
  private async findFiles(): Promise<string[]> {
    const ignorePatterns = this.options.ignore.map(pattern => `**/${pattern}/**`);
    
    try {
      const files = await glob.glob('**/*', {
        cwd: this.repoPath,
        ignore: ignorePatterns,
        nodir: true,
        absolute: true
      });
      
      return files;
    } catch (error) {
      logger.error(`Error finding files: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
  
  /**
   * Analyzes repository-level information
   */
  private async analyzeRepositoryInfo(allFiles: string[]): Promise<RepositoryInfo> {
    const name = path.basename(this.repoPath);
    const total_files = allFiles.length;
    
    // Analyze language distribution
    const languageStats: Record<string, { files: number; lines: number }> = {};
    let total_lines = 0;
    
    // Process each file
    for (const file of allFiles) {
      const extension = path.extname(file).toLowerCase();
      const language = this.extensionToLanguage.get(extension) || 'other';
      
      if (!languageStats[language]) {
        languageStats[language] = { files: 0, lines: 0 };
      }
      
      languageStats[language].files++;
      
      try {
        // Count lines in the file
        const content = await fs.promises.readFile(file, 'utf-8');
        const lineCount = content.split('\n').length;
        
        languageStats[language].lines += lineCount;
        total_lines += lineCount;
      } catch (error) {
        logger.warn(`Could not read file ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Calculate percentages
    const languages: RepositoryInfo['languages'] = {};
    
    for (const [language, stats] of Object.entries(languageStats)) {
      languages[language] = {
        files: stats.files,
        lines: stats.lines,
        percentage: total_lines > 0 ? Math.round((stats.lines / total_lines) * 100) : 0
      };
    }
    
    // Detect build systems
    const build_systems = await this.detectBuildSystems(allFiles);
    
    return {
      name,
      total_files,
      total_lines,
      languages,
      build_systems
    };
  }
  
  /**
   * Detects build systems used in the repository
   */
  private async detectBuildSystems(allFiles: string[]): Promise<string[]> {
    const buildSystems: Set<string> = new Set();
    const filenames = allFiles.map(file => path.basename(file));
    
    // Common build files
    const buildFileMap: Record<string, string> = {
      'package.json': 'npm',
      'yarn.lock': 'yarn',
      'pnpm-lock.yaml': 'pnpm',
      'requirements.txt': 'pip',
      'pyproject.toml': 'poetry',
      'setup.py': 'setuptools',
      'pom.xml': 'maven',
      'build.gradle': 'gradle',
      'build.xml': 'ant',
      'go.mod': 'go modules',
      'cargo.toml': 'cargo',
      'Gemfile': 'bundler',
      'Rakefile': 'rake',
      'CMakeLists.txt': 'cmake',
      'Makefile': 'make',
      'WORKSPACE': 'bazel',
    };
    
    // Check for build files
    for (const filename of filenames) {
      if (buildFileMap[filename]) {
        buildSystems.add(buildFileMap[filename]);
      }
    }
    
    // If no build system detected, infer from primary language
    if (buildSystems.size === 0) {
      // Get primary language
      const languages = await this.getPrimaryLanguages(allFiles);
      
      for (const language of languages) {
        const possibleBuildSystems = BUILD_SYSTEMS[language];
        if (possibleBuildSystems && possibleBuildSystems.length > 0) {
          buildSystems.add(possibleBuildSystems[0]);
        }
      }
    }
    
    return Array.from(buildSystems);
  }
  
  /**
   * Gets primary languages used in the repository
   */
  private async getPrimaryLanguages(allFiles: string[]): Promise<string[]> {
    const languageCounts: Record<string, number> = {};
    
    for (const file of allFiles) {
      const extension = path.extname(file).toLowerCase();
      const language = this.extensionToLanguage.get(extension) || 'other';
      
      languageCounts[language] = (languageCounts[language] || 0) + 1;
    }
    
    // Sort languages by file count
    const sortedLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([language]) => language);
    
    // Return top languages (up to 3)
    return sortedLanguages.slice(0, 3);
  }
  
  /**
   * Analyzes modules in the repository
   */
  private async analyzeModules(allFiles: string[]): Promise<ModuleInfo[]> {
    const moduleMap = new Map<string, {
      files: string[];
      languages: Set<string>;
    }>();
    
    // Group files by module
    for (const file of allFiles) {
      const relativePath = path.relative(this.repoPath, file);
      const modulePath = this.getModulePath(relativePath);
      
      if (modulePath) {
        if (!moduleMap.has(modulePath)) {
          moduleMap.set(modulePath, {
            files: [],
            languages: new Set()
          });
        }
        
        const moduleInfo = moduleMap.get(modulePath)!;
        moduleInfo.files.push(file);
        
        const extension = path.extname(file).toLowerCase();
        const language = this.extensionToLanguage.get(extension);
        if (language) {
          moduleInfo.languages.add(language);
        }
      }
    }
    
    // Convert to ModuleInfo array
    const modules: ModuleInfo[] = [];
    
    for (const [modulePath, moduleData] of moduleMap.entries()) {
      // Calculate complexity based on file count and nesting level
      const nestingLevel = modulePath.split(path.sep).length;
      const complexity_score = Math.min(10, Math.ceil(moduleData.files.length / 10) + nestingLevel);
      
      // Estimate test coverage based on test file count
      const testFileCount = moduleData.files.filter(file => {
        const filename = path.basename(file).toLowerCase();
        return filename.includes('test') || filename.includes('spec');
      }).length;
      
      const test_coverage = moduleData.files.length > 0 ? 
        Math.min(100, Math.round((testFileCount / moduleData.files.length) * 100)) : 0;
      
      // Determine quality assessment
      let quality_assessment = 'moderate' as 'excellent' | 'good' | 'moderate' | 'poor' | 'problematic';
      
      if (complexity_score <= 3 && test_coverage >= 70) {
        quality_assessment = 'excellent';
      } else if (complexity_score <= 5 && test_coverage >= 50) {
        quality_assessment = 'good';
      } else if (complexity_score >= 8 || test_coverage < 20) {
        quality_assessment = 'poor';
      }
      
      // Determine chunking recommendation
      let recommended_chunking = 'module' as string;
      
      if (moduleData.files.length > 20) {
        recommended_chunking = 'file';
      } else if (complexity_score > 7) {
        recommended_chunking = 'function';
      }
      
      modules.push({
        module_path: modulePath,
        files: moduleData.files.length,
        complexity_score,
        test_coverage,
        recommended_chunking,
        quality_assessment,
        languages: Array.from(moduleData.languages),
        dependencies: [] // Dependencies would be filled in by DependencyAnalyzer
      });
    }
    
    // Sort by complexity score (descending)
    return modules.sort((a, b) => b.complexity_score - a.complexity_score);
  }
  
  /**
   * Analyzes individual files in the repository
   */
  private async analyzeFiles(allFiles: string[], modules: ModuleInfo[]): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    
    for (const file of allFiles) {
      try {
        const relativePath = path.relative(this.repoPath, file);
        const content = await fs.promises.readFile(file, 'utf-8');
        const lines = content.split('\n');
        const line_count = lines.length;
        
        // Simple complexity analysis
        const extension = path.extname(file).toLowerCase();
        const language = this.extensionToLanguage.get(extension) || 'other';
        
        // Count classes and functions
        const { classes, functions } = this.countClassesAndFunctions(content, language);
        
        // Calculate complexity score
        const complexity_score = Math.min(10, Math.ceil(
          (line_count / 100) + (classes * 1.5) + (functions * 0.5)
        ));
        
        // Determine quality assessment
        let quality_assessment = 'moderate' as 'excellent' | 'good' | 'moderate' | 'poor' | 'problematic';
        
        if (complexity_score <= 3 && line_count < 200) {
          quality_assessment = 'excellent';
        } else if (complexity_score <= 5 && line_count < 500) {
          quality_assessment = 'good';
        } else if (complexity_score >= 8 || line_count > 1000) {
          quality_assessment = 'poor';
        }
        
        // Determine chunking strategy
        let recommended_chunking = 'function' as 'function' | 'class' | 'file';
        
        if (classes > 3) {
          recommended_chunking = 'class';
        } else if (functions < 2 || line_count < 100) {
          recommended_chunking = 'file';
        }
        
        files.push({
          file_path: relativePath,
          line_count,
          complexity_score,
          quality_assessment,
          classes,
          functions,
          recommended_chunking,
          dependencies: [] // Dependencies would be filled in by DependencyAnalyzer
        });
      } catch (error) {
        logger.warn(`Could not analyze file ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return files;
  }
  
  /**
   * Gets the module path for a file
   */
  private getModulePath(relativePath: string): string | null {
    const parts = relativePath.split(path.sep);
    
    // Handle different module depths
    if (parts.length <= 1) {
      return null; // File is in the root
    }
    
    // Use specified depth or default
    const depth = Math.min(this.options.depth, parts.length - 1);
    return parts.slice(0, depth).join(path.sep);
  }
  
  /**
   * Counts classes and functions in a file
   */
  private countClassesAndFunctions(content: string, language: string): { classes: number; functions: number } {
    let classes = 0;
    let functions = 0;
    
    if (['javascript', 'typescript'].includes(language)) {
      // Count classes
      const classRegex = /class\s+[\w_$]+/g;
      const classMatches = content.match(classRegex);
      classes = classMatches ? classMatches.length : 0;
      
      // Count functions
      const functionRegex = /function\s+[\w_$]+|\w+\s*=\s*\([^)]*\)\s*=>|\w+\s*\([^)]*\)\s*{/g;
      const functionMatches = content.match(functionRegex);
      functions = functionMatches ? functionMatches.length : 0;
    } else if (language === 'python') {
      // Count classes
      const classRegex = /class\s+[\w_]+/g;
      const classMatches = content.match(classRegex);
      classes = classMatches ? classMatches.length : 0;
      
      // Count functions
      const functionRegex = /def\s+[\w_]+/g;
      const functionMatches = content.match(functionRegex);
      functions = functionMatches ? functionMatches.length : 0;
    } else if (['java', 'kotlin', 'csharp'].includes(language)) {
      // Count classes
      const classRegex = /class\s+[\w_$]+|interface\s+[\w_$]+|enum\s+[\w_$]+/g;
      const classMatches = content.match(classRegex);
      classes = classMatches ? classMatches.length : 0;
      
      // Count methods
      const methodRegex = /(?:public|private|protected)\s+(?:static\s+)?[\w<>\[\]]+\s+[\w_$]+\s*\(/g;
      const methodMatches = content.match(methodRegex);
      functions = methodMatches ? methodMatches.length : 0;
    }
    
    return { classes, functions };
  }
}
