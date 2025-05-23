import { getLogger } from '../utils/logger';
import { SearchResult, SemanticSearch } from './semantic';
import { EmbeddingManager } from '../vectorizers/embedders/manager';
import * as jsSimilarity from 'string-similarity';
import * as path from 'path';
import * as fs from 'fs';

const logger = getLogger('SimilarityAnalyzer');

/**
 * Known code patterns that can be detected
 */
export enum CodePattern {
  ERROR_HANDLING = 'error-handling',
  ASYNC_AWAIT = 'async-await',
  CLASS_BASED = 'class-based',
  FUNCTIONAL = 'functional',
  SINGLETON = 'singleton',
  FACTORY = 'factory',
  OBSERVER = 'observer',
  MVC = 'mvc',
  API_CLIENT = 'api-client',
  DATA_TRANSFORMATION = 'data-transformation',
  STATE_MANAGEMENT = 'state-management'
}

/**
 * Type of code segment being analyzed
 */
export type PatternType = 'function' | 'class' | 'module' | 'pattern';

/**
 * Result of a similarity analysis
 */
export interface SimilarityResult {
  targetCode: string;
  similarCode: SearchResult[];
  similarityReasons: string[];
  patternType: PatternType;
  patternName?: string;
  confidence: number;
}

/**
 * Configuration options for the similarity analyzer
 */
export interface SimilarityOptions {
  semanticSearch?: SemanticSearch;
  embeddingManager?: EmbeddingManager;
  minSimilarity?: number;
  enableSemanticSearch?: boolean;
  enableSyntaxAnalysis?: boolean;
  enablePatternDetection?: boolean;
}

/**
 * Analyzes code for similarity and pattern detection
 */
export class SimilarityAnalyzer {
  private semanticSearch: SemanticSearch | null = null;
  private embeddingManager: EmbeddingManager | null = null;
  private options: SimilarityOptions;
  private initialized = false;
  
  // Pattern definitions - each with regex patterns and signatures
  private patterns: Record<CodePattern, {
    regex: RegExp[];
    signatures: string[];
    description: string;
  }> = {
    [CodePattern.ERROR_HANDLING]: {
      regex: [
        /try\s*{[\s\S]*?}\s*catch\s*\([^)]*\)\s*{[\s\S]*?}/g,
        /throw\s+new\s+\w+\(/g,
        /\.catch\s*\([^)]*\)/g
      ],
      signatures: [
        'try/catch blocks',
        'throw new Error',
        'promise.catch'
      ],
      description: 'Error handling patterns including try/catch blocks and promise rejection handling'
    },
    [CodePattern.ASYNC_AWAIT]: {
      regex: [
        /async\s+function/g,
        /async\s+\([^)]*\)\s*=>/g,
        /await\s+/g
      ],
      signatures: [
        'async function',
        'await operator'
      ],
      description: 'Asynchronous code patterns using async/await syntax'
    },
    [CodePattern.CLASS_BASED]: {
      regex: [
        /class\s+\w+/g,
        /extends\s+\w+/g,
        /constructor\s*\(/g,
        /this\./g
      ],
      signatures: [
        'class declaration',
        'extends keyword',
        'constructor method'
      ],
      description: 'Object-oriented patterns using class syntax'
    },
    [CodePattern.FUNCTIONAL]: {
      regex: [
        /\w+\s*=>\s*{/g,
        /\w+\.map\s*\(/g,
        /\w+\.filter\s*\(/g,
        /\w+\.reduce\s*\(/g
      ],
      signatures: [
        'arrow functions',
        'map/filter/reduce'
      ],
      description: 'Functional programming patterns using higher-order functions'
    },
    [CodePattern.SINGLETON]: {
      regex: [
        /static\s+getInstance\s*\(/g,
        /private\s+static\s+instance/g,
        /if\s*\(\s*!\s*instance\s*\)/g
      ],
      signatures: [
        'getInstance method',
        'private static instance',
        'instance check'
      ],
      description: 'Singleton pattern implementation ensuring a single instance of a class'
    },
    [CodePattern.FACTORY]: {
      regex: [
        /\w+\.create\w+\s*\(/g,
        /factory\s*=\s*new\s+\w+/gi,
        /new\s+\$\w+\(/g
      ],
      signatures: [
        'create methods',
        'factory class'
      ],
      description: 'Factory pattern for object creation'
    },
    [CodePattern.OBSERVER]: {
      regex: [
        /addEventListener\s*\(/g,
        /removeEventListener\s*\(/g,
        /\.subscribe\s*\(/g,
        /\.unsubscribe\s*\(/g,
        /\.on\s*\(['"]\w+['"]\s*,/g
      ],
      signatures: [
        'event listeners',
        'subscribe/unsubscribe',
        'on/emit methods'
      ],
      description: 'Observer pattern with event listening and notification'
    },
    [CodePattern.MVC]: {
      regex: [
        /class\s+\w+Controller/g,
        /class\s+\w+View/g,
        /class\s+\w+Model/g,
        /render\s*\(\s*\)/g
      ],
      signatures: [
        'Controller class',
        'View class',
        'Model class'
      ],
      description: 'Model-View-Controller architectural pattern'
    },
    [CodePattern.API_CLIENT]: {
      regex: [
        /axios\s*\.\s*(get|post|put|delete)\s*\(/g,
        /fetch\s*\(/g,
        /\.then\s*\(/g,
        /headers\s*:\s*{/g
      ],
      signatures: [
        'HTTP requests',
        'API endpoints',
        'request/response handling'
      ],
      description: 'API client patterns for making HTTP requests'
    },
    [CodePattern.DATA_TRANSFORMATION]: {
      regex: [
        /\.map\s*\(\s*\w+\s*=>/g,
        /JSON\.parse\s*\(/g,
        /JSON\.stringify\s*\(/g
      ],
      signatures: [
        'data mapping',
        'JSON parsing/serialization'
      ],
      description: 'Data transformation and processing patterns'
    },
    [CodePattern.STATE_MANAGEMENT]: {
      regex: [
        /useState\s*\(/g,
        /useReducer\s*\(/g,
        /createStore\s*\(/g,
        /new\s+\w+Store\s*\(/g
      ],
      signatures: [
        'state hooks',
        'reducers',
        'store creation'
      ],
      description: 'State management patterns for tracking application state'
    }
  };

  /**
   * Creates a new SimilarityAnalyzer
   */
  constructor(options: SimilarityOptions = {}) {
    this.options = {
      minSimilarity: options.minSimilarity || 0.7,
      enableSemanticSearch: options.enableSemanticSearch !== false,
      enableSyntaxAnalysis: options.enableSyntaxAnalysis !== false,
      enablePatternDetection: options.enablePatternDetection !== false,
      ...options
    };
    
    this.semanticSearch = options.semanticSearch || null;
    this.embeddingManager = options.embeddingManager || null;
  }

  /**
   * Initialize the analyzer if needed
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    // If semantic search is enabled but not provided, create it
    if (this.options.enableSemanticSearch && !this.semanticSearch) {
      this.semanticSearch = new SemanticSearch({
        pineconeApiKey: process.env.PINECONE_API_KEY,
        pineconeIndexName: 'remcode-default',
        pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || 'gcp-starter',
        pineconeNamespace: 'default',
        huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
        embeddingModel: 'microsoft/graphcodebert-base',
        fallbackModel: 'sentence-transformers/all-MiniLM-L6-v2'
      });
      await this.semanticSearch.initialize();
    }
    
    this.initialized = true;
  }

  /**
   * Find code patterns similar to the provided code snippet
   * @param codeSnippet The code snippet to analyze
   * @param threshold Minimum similarity threshold (0-1)
   * @returns Similarity analysis result
   */
  async findSimilarPatterns(codeSnippet: string, threshold: number = 0.8): Promise<SimilarityResult> {
    logger.info(`Analyzing code similarity patterns with threshold ${threshold}`);
    await this.ensureInitialized();
    
    // Detect what type of code it is (function, class, etc.)
    const patternType = this.detectPatternType(codeSnippet);
    
    // Detect what design patterns are used
    const detectedPatterns = this.detectPatterns(codeSnippet);
    
    let similarCode: SearchResult[] = [];
    
    // If semantic search is enabled and available, find similar code
    if (this.options.enableSemanticSearch && this.semanticSearch) {
      try {
        similarCode = await this.semanticSearch.searchSimilarCode(codeSnippet, 5);
        // Filter results below threshold
        similarCode = similarCode.filter(result => result.score >= threshold);
      } catch (error) {
        logger.error(`Error during semantic search: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Generate reasons for similarity based on detected patterns
    const similarityReasons = this.generateSimilarityReasons(codeSnippet, detectedPatterns);
    
    // Determine overall confidence based on pattern detection and semantic results
    const confidence = this.calculateOverallConfidence(detectedPatterns, similarCode);
    
    return {
      targetCode: codeSnippet,
      similarCode,
      similarityReasons,
      patternType,
      patternName: detectedPatterns.length > 0 ? detectedPatterns[0] : undefined,
      confidence
    };
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(detectedPatterns: string[], similarCode: SearchResult[]): number {
    let confidence = 0.5; // Base confidence
    
    // Add confidence based on pattern detection
    if (detectedPatterns.length > 0) {
      confidence += Math.min(0.3, detectedPatterns.length * 0.1);
    }
    
    // Add confidence based on semantic search results
    if (similarCode.length > 0) {
      const avgScore = similarCode.reduce((sum, result) => sum + result.score, 0) / similarCode.length;
      confidence += avgScore * 0.2;
    }
    
    return Math.min(1, confidence);
  }

  /**
   * Compare the similarity between two code snippets
   * @param code1 First code snippet
   * @param code2 Second code snippet
   * @returns Similarity score (0-1)
   */
  async compareCodeSimilarity(code1: string, code2: string): Promise<number> {
    logger.info('Comparing code similarity');
    
    // Use multiple similarity metrics and combine them for better accuracy
    
    // 1. String-based similarity (Levenshtein distance)
    const stringSimilarity = jsSimilarity.compareTwoStrings(
      this.normalizeCode(code1),
      this.normalizeCode(code2)
    );
    
    // 2. Token-based similarity (if syntax analysis is enabled)
    let tokenSimilarity = 0;
    if (this.options.enableSyntaxAnalysis) {
      const tokens1 = this.extractTokens(code1);
      const tokens2 = this.extractTokens(code2);
      tokenSimilarity = this.calculateTokenSimilarity(tokens1, tokens2);
    }
    
    // 3. Pattern-based similarity 
    let patternSimilarity = 0;
    if (this.options.enablePatternDetection) {
      const patterns1 = this.detectPatterns(code1);
      const patterns2 = this.detectPatterns(code2);
      patternSimilarity = this.calculatePatternSimilarity(patterns1, patterns2);
    }
    
    // 4. Semantic similarity (if available)
    let semanticSimilarity = 0;
    if (this.embeddingManager) {
      try {
        const chunks = [
          { content: code1, metadata: { file_path: 'temp1', strategy: 'comparison', chunk_type: 'snippet' } },
          { content: code2, metadata: { file_path: 'temp2', strategy: 'comparison', chunk_type: 'snippet' } }
        ];
        
        const embeddings = await this.embeddingManager.embedChunks(chunks);
        
        if (embeddings[0].embedding && embeddings[1].embedding) {
          semanticSimilarity = this.cosineSimilarity(
            embeddings[0].embedding,
            embeddings[1].embedding
          );
        }
      } catch (error) {
        logger.error(`Error calculating semantic similarity: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Combine similarities with weights
    let combinedSimilarity;
    if (semanticSimilarity > 0) {
      // If we have semantic similarity, give it more weight
      combinedSimilarity = (
        (stringSimilarity * 0.2) + 
        (tokenSimilarity * 0.2) + 
        (patternSimilarity * 0.2) + 
        (semanticSimilarity * 0.4)
      );
    } else {
      // Without semantic, adjust weights of other metrics
      combinedSimilarity = (
        (stringSimilarity * 0.4) + 
        (tokenSimilarity * 0.3) + 
        (patternSimilarity * 0.3)
      );
    }
    
    return Math.max(0, Math.min(1, combinedSimilarity));
  }

  /**
   * Identify code patterns in a file or code content
   * @param filePathOrContent Path to the file to analyze or code content directly
   * @param isContent Whether the first parameter is content (true) or file path (false)
   * @returns Array of detected pattern names
   */
  async identifyCodePatterns(filePathOrContent: string, isContent: boolean = false): Promise<string[]> {
    if (isContent) {
      logger.info(`Identifying patterns in provided code content`);
      return this.detectPatterns(filePathOrContent);
    }
    
    logger.info(`Identifying patterns in ${filePathOrContent}`);
    
    if (!fs.existsSync(filePathOrContent)) {
      logger.warn(`File not found: ${filePathOrContent}, returning empty patterns`);
      return [];
    }
    
    try {
      const fileContent = fs.readFileSync(filePathOrContent, 'utf-8');
      const extension = path.extname(filePathOrContent).toLowerCase();
      
      // Skip non-code files
      if (!['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.go', '.rb'].includes(extension)) {
        logger.warn(`Skipping non-code file: ${filePathOrContent}`);
        return [];
      }
      
      return this.detectPatterns(fileContent);
    } catch (error) {
      logger.error(`Error identifying patterns in ${filePathOrContent}: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
  
  /**
   * Find design patterns in a repository
   * @param repoPath Path to the repository
   * @returns Map of file paths to detected patterns
   */
  async analyzeRepositoryPatterns(repoPath: string): Promise<Map<string, string[]>> {
    logger.info(`Analyzing design patterns in repository: ${repoPath}`);
    
    const results = new Map<string, string[]>();
    
    if (!fs.existsSync(repoPath)) {
      throw new Error(`Repository path not found: ${repoPath}`);
    }
    
    try {
      // Find code files in the repository
      const codeFiles = this.findCodeFiles(repoPath);
      
      // Analyze each file
      for (const file of codeFiles) {
        const patterns = await this.identifyCodePatterns(file);
        if (patterns.length > 0) {
          results.set(file, patterns);
        }
      }
      
      return results;
    } catch (error) {
      logger.error(`Error analyzing repository patterns: ${error instanceof Error ? error.message : String(error)}`);
      return new Map();
    }
  }
  
  /**
   * Detect patterns in code
   * @param code Code to analyze
   * @returns Array of detected pattern names
   */
  private detectPatterns(code: string): string[] {
    const detectedPatterns: string[] = [];
    
    if (!this.options.enablePatternDetection) {
      return detectedPatterns;
    }
    
    // Check each pattern against the code
    for (const [patternName, patternDef] of Object.entries(this.patterns)) {
      let matchCount = 0;
      
      // Check all regex patterns for this code pattern
      for (const regex of patternDef.regex) {
        const matches = code.match(regex);
        if (matches && matches.length > 0) {
          matchCount += matches.length;
        }
      }
      
      // If enough matches are found, consider the pattern detected
      if (matchCount >= 2) {
        detectedPatterns.push(patternName);
      }
    }
    
    return detectedPatterns;
  }
  
  /**
   * Detect the type of code pattern
   * @param code Code to analyze
   * @returns Pattern type
   */
  private detectPatternType(code: string): PatternType {
    // Check for class pattern
    if (code.match(/class\s+\w+/)) {
      return 'class';
    }
    
    // Check for function pattern
    if (code.match(/function\s+\w+\s*\(/) || code.match(/const\s+\w+\s*=\s*\(\s*\)\s*=>/)) {
      return 'function';
    }
    
    // Check if it might be a module
    if (code.match(/export\s+/) || code.match(/import\s+/) || code.match(/require\s*\(/)) {
      return 'module';
    }
    
    // Default to generic pattern
    return 'pattern';
  }
  
  /**
   * Generate reasons why code is similar based on detected patterns
   * @param code Code to analyze
   * @param detectedPatterns Array of detected patterns
   * @returns Array of reasons
   */
  private generateSimilarityReasons(code: string, detectedPatterns: string[]): string[] {
    const reasons: string[] = [];
    
    // Add reasons based on pattern type
    const patternType = this.detectPatternType(code);
    reasons.push(`Similar ${patternType} structure`);
    
    // Add reasons based on detected design patterns
    for (const pattern of detectedPatterns) {
      const patternDef = this.patterns[pattern as CodePattern];
      if (patternDef) {
        // Find which specific signatures are present
        for (let i = 0; i < patternDef.regex.length; i++) {
          if (code.match(patternDef.regex[i]) && patternDef.signatures[i]) {
            reasons.push(`Uses ${patternDef.signatures[i]}`);
          }
        }
      }
    }
    
    // Check for specific code elements
    if (code.match(/try\s*{/)) reasons.push('Contains error handling');
    if (code.match(/async\s+/)) reasons.push('Uses asynchronous patterns');
    if (code.match(/for\s*\(/)) reasons.push('Contains loop structures');
    if (code.match(/if\s*\(/)) reasons.push('Has conditional logic');
    
    return reasons;
  }
  
  /**
   * Extract tokens from code
   */
  private extractTokens(code: string): string[] {
    // Simple tokenization - split by whitespace and symbols
    return this.normalizeCode(code)
      .split(/[\s\n\r;{}()\[\]\.,=:+\-*\/%<>!&|^~]+/)
      .filter(token => token.length > 0);
  }
  
  /**
   * Calculate similarity between token sets
   */
  private calculateTokenSimilarity(tokens1: string[], tokens2: string[]): number {
    if (tokens1.length === 0 || tokens2.length === 0) {
      return 0;
    }
    
    // Count tokens that appear in both sets
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    let commonCount = 0;
    
    for (const token of set1) {
      if (set2.has(token)) {
        commonCount++;
      }
    }
    
    // Jaccard similarity: size of intersection / size of union
    return commonCount / (set1.size + set2.size - commonCount);
  }
  
  /**
   * Calculate similarity between pattern sets
   */
  private calculatePatternSimilarity(patterns1: string[], patterns2: string[]): number {
    if (patterns1.length === 0 || patterns2.length === 0) {
      return 0;
    }
    
    // Count patterns that appear in both sets
    const set1 = new Set(patterns1);
    const set2 = new Set(patterns2);
    let commonCount = 0;
    
    for (const pattern of set1) {
      if (set2.has(pattern)) {
        commonCount++;
      }
    }
    
    // Jaccard similarity: size of intersection / size of union
    return commonCount / (set1.size + set2.size - commonCount);
  }
  
  /**
   * Normalize code for better comparison
   */
  private normalizeCode(code: string): string {
    return code
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/".*?"/g, '""') // Normalize string literals
      .replace(/'.*?'/g, "''") // Normalize string literals
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  /**
   * Find all code files in a directory recursively
   */
  private findCodeFiles(dir: string): string[] {
    const files: string[] = [];
    const codeExtensions = new Set([
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.go', '.rb'
    ]);
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules, .git, and other common non-source directories
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', 'out'].includes(entry.name)) {
          files.push(...this.findCodeFiles(fullPath));
        }
      } else if (codeExtensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must be of equal length');
    }
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  }
}
