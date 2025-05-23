import { getLogger } from '../utils/logger';
import { ChunkingManager } from './chunkers/manager';
import { EmbeddingManager } from './embedders/manager';
import { PineconeStorage } from './storage/pinecone';
import { CodeChunk, FileInfo, VectorizationResult, VectorizationOptions } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = getLogger('VectorizationPipeline');

/**
 * Main vectorization pipeline that orchestrates chunking, embedding, and storage
 */
export class VectorizationPipeline {
  private options: VectorizationOptions;
  private chunkingManager: ChunkingManager;
  private embeddingManager: EmbeddingManager;
  private storage: PineconeStorage;
  private initialized: boolean = false;

  constructor(options: VectorizationOptions) {
    this.options = {
      // Default values with working models
      embeddingModel: 'microsoft/codebert-base',
      fallbackModel: 'microsoft/graphcodebert-base',
      batchSize: 5, // Reduced for stability
      maxFileSize: 1024 * 1024, // 1MB
      includeExtensions: ['.ts', '.js', '.py', '.java', '.go', '.rb', '.php', '.cpp', '.c', '.cs', '.rs'],
      excludeExtensions: ['.min.js', '.bundle.js', '.test.js', '.spec.js'],
      excludePaths: ['node_modules', '.git', 'dist', 'build', '__pycache__', '.pytest_cache'],
      chunkingStrategy: {
        clean_modules: 'function_level',
        complex_modules: 'class_level', 
        monolithic_files: 'sliding_window_with_overlap'
      },
      pineconeNamespace: 'default',
      ...options
    };

    // Initialize managers with correct configurations
    this.chunkingManager = new ChunkingManager(this.options.chunkingStrategy!);
    
    this.embeddingManager = new EmbeddingManager({
      primary: this.options.embeddingModel!,
      fallback: this.options.fallbackModel!,
      batchSize: this.options.batchSize!,
      token: this.options.huggingfaceToken,
      dimension: 768 // CodeBERT dimension
    });

    this.storage = new PineconeStorage({
      apiKey: this.options.pineconeApiKey,
      indexName: this.options.pineconeIndexName,
      namespace: this.options.pineconeNamespace,
      dimension: 768,
      metric: 'cosine'
    });
  }

  /**
   * Initialize the vectorization pipeline
   */
  async initialize(): Promise<void> {
    logger.info('Initializing vectorization pipeline...');
    
    try {
      // Initialize Pinecone storage
      await this.storage.initialize();
      
      this.initialized = true;
      logger.info('Vectorization pipeline initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to initialize vectorization pipeline: ${errorMessage}`);
      throw new Error(`Initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Process a single file and return its vectorized chunks
   */
  async processFile(filePath: string, relativePath?: string): Promise<CodeChunk[]> {
    if (!this.initialized) {
      throw new Error('Pipeline not initialized. Call initialize() first.');
    }

    logger.debug(`Processing file: ${filePath}`);

    try {
      // 1. Read file content
      const content = await fs.promises.readFile(filePath, 'utf8');
      
      // 2. Create file info
      const fileInfo = this.createFileInfo(filePath, relativePath);
      
      // 3. Determine chunking strategy based on file characteristics
      const strategy = this.determineChunkingStrategy(content, fileInfo);
      
      // 4. Chunk the file
      const chunks = await this.chunkingManager.chunkFile(content, strategy, fileInfo);
      
      if (chunks.length === 0) {
        logger.warn(`No chunks created for file: ${filePath}`);
        return [];
      }

      logger.debug(`Created ${chunks.length} chunks for file: ${filePath}`);

      // 5. Generate embeddings for chunks
      const embeddedChunks = await this.embeddingManager.embedChunks(chunks);
      
      // 6. Store vectors in Pinecone
      const vectorData = embeddedChunks
        .filter(chunk => chunk.embedding) // Only store chunks with embeddings
        .map(chunk => ({
          embedding: chunk.embedding!,
          metadata: {
            ...chunk.metadata,
            content: chunk.content, // Store the actual content in metadata
            processed_at: new Date().toISOString()
          }
        }));
      
      if (vectorData.length > 0) {
        await this.storage.storeVectors(vectorData);
        logger.debug(`Stored ${vectorData.length} vectors for file: ${filePath}`);
      }
      
      logger.info(`Successfully processed file: ${filePath} (${chunks.length} chunks, ${vectorData.length} stored)`);
      return embeddedChunks;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error processing file ${filePath}: ${errorMessage}`);
      throw new Error(`File processing failed: ${errorMessage}`);
    }
  }

  /**
   * Search for similar code using vector similarity
   */
  async searchSimilarCode(query: string, topK: number = 10, filter?: Record<string, any>): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('Pipeline not initialized. Call initialize() first.');
    }

    try {
      logger.info(`Searching for similar code with query: "${query.substring(0, 50)}..."`);
      
      // 1. Generate embedding for the query
      const queryChunk: CodeChunk = { 
        content: query, 
        metadata: { 
          file_path: '', 
          strategy: 'query', 
          chunk_type: 'query' 
        } 
      };
      
      const embeddedQuery = await this.embeddingManager.embedChunks([queryChunk]);
      
      if (!embeddedQuery[0].embedding) {
        throw new Error('Failed to generate embedding for query');
      }

      // 2. Search Pinecone for similar vectors
      const results = await this.storage.queryVectors(
        embeddedQuery[0].embedding,
        topK,
        filter,
        this.options.pineconeNamespace
      );

      logger.info(`Found ${results.length} similar code matches`);
      return results;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error searching for similar code: ${errorMessage}`);
      throw new Error(`Search failed: ${errorMessage}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<any> {
    if (!this.initialized) {
      throw new Error('Pipeline not initialized. Call initialize() first.');
    }

    return await this.storage.getIndexStats(this.options.pineconeNamespace);
  }

  /**
   * Delete vectors for a specific file (useful for incremental updates)
   */
  async deleteFileVectors(filePath: string): Promise<number> {
    if (!this.initialized) {
      throw new Error('Pipeline not initialized. Call initialize() first.');
    }

    try {
      return await this.storage.deleteVectorsByMetadata(
        { file_path: filePath },
        this.options.pineconeNamespace
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error deleting vectors for file ${filePath}: ${errorMessage}`);
      throw new Error(`Vector deletion failed: ${errorMessage}`);
    }
  }

  // Private helper methods
  private createFileInfo(filePath: string, relativePath?: string): FileInfo {
    const stats = fs.statSync(filePath);
    const extension = path.extname(filePath).toLowerCase();
    
    // Simple language detection based on extension
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rb': 'ruby',
      '.php': 'php',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.rs': 'rust',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala'
    };

    return {
      file_path: filePath,
      relative_path: relativePath || path.basename(filePath),
      language: languageMap[extension] || 'text',
      size: stats.size,
      extension: extension.substring(1) // Remove the dot
    };
  }

  private determineChunkingStrategy(content: string, fileInfo: FileInfo): string {
    const lines = content.split('\n').length;
    const complexity = this.estimateComplexity(content);
    
    // Simple heuristics for strategy selection
    if (complexity === 'low' && lines < 200) {
      return this.options.chunkingStrategy!.clean_modules;
    } else if (complexity === 'high' || lines > 1000) {
      return this.options.chunkingStrategy!.monolithic_files;
    } else {
      return this.options.chunkingStrategy!.complex_modules;
    }
  }

  private estimateComplexity(content: string): 'low' | 'medium' | 'high' {
    const lines = content.split('\n').length;
    const functions = (content.match(/function|def |class |const |let |var /g) || []).length;
    const nesting = (content.match(/\{|\[|\(/g) || []).length;
    
    const complexityScore = (functions * 2) + (nesting * 0.1) + (lines * 0.01);
    
    if (complexityScore < 10) return 'low';
    if (complexityScore < 50) return 'medium';
    return 'high';
  }


  /**
   * Process all files in a directory recursively
   */
  async processDirectory(dirPath: string): Promise<VectorizationResult> {
    if (!this.initialized) {
      throw new Error('Pipeline not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    const result: VectorizationResult = {
      success: false,
      filesProcessed: 0,
      chunksCreated: 0,
      vectorsStored: 0,
      errors: [],
      duration: 0
    };

    try {
      // Find all code files
      const files = await this.findCodeFiles(dirPath);
      
      for (const filePath of files) {
        try {
          const chunks = await this.processFile(filePath);
          result.filesProcessed++;
          result.chunksCreated += chunks.length;
          result.vectorsStored += chunks.length;
        } catch (error) {
          const errorMsg = `Failed to process ${filePath}: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          logger.warn(errorMsg, error instanceof Error ? error : undefined);
        }
      }

      result.success = result.errors.length < files.length;
      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      result.errors.push(`Directory processing failed: ${error instanceof Error ? error.message : String(error)}`);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Find all code files in a directory recursively
   */
  private async findCodeFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const excludePatterns = this.options.excludePaths || [];
    const includeExtensions = this.options.includeExtensions || ['.ts', '.js', '.py'];

    const walk = async (currentPath: string): Promise<void> => {
      const items = await fs.promises.readdir(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isDirectory()) {
          const shouldSkip = excludePatterns.some(pattern => 
            fullPath.includes(pattern) || item === pattern
          );
          if (!shouldSkip) {
            await walk(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (includeExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    await walk(dirPath);
    return files;
  }
}
