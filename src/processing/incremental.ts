import { getLogger } from '../utils/logger';
import { FileChange } from './change-detector';
import { FileAnalysis } from './file-analyzer';
import { StateManager, RemcodeState } from './state-manager';
import * as fs from 'fs';
import * as path from 'path';

// Import vector storage class
import { PineconeStorage } from '../vectorizers/storage/pinecone';

// Note: These modules need to be created or installed
// For reference implementation only

// Interface for Code Chunker
interface CodeChunker {
  chunkCode(content: string, options: {
    filePath: string;
    language: string;
    strategy: string;
  }): CodeChunk[];
}

// Interface for Embedding Manager
interface EmbeddingManager {
  embedChunks(chunks: CodeChunk[]): Promise<VectorData[]>;
}

// Interface for Code Chunk
interface CodeChunk {
  content: string;
  startLine?: number;
  endLine?: number;
  metadata?: Record<string, any>;
}

// Interface for Vector Data
interface VectorData {
  id?: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

const logger = getLogger('IncrementalProcessor');

export interface ProcessingStats {
  totalFiles: number;
  addedFiles: number;
  modifiedFiles: number;
  deletedFiles: number;
  totalChunks: number;
  totalEmbeddings: number;
  errorCount: number;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
}

export interface IncrementalProcessorOptions {
  repoPath: string;
  pineconeApiKey: string;
  pineconeEnvironment?: string;
  pineconeIndexName: string;
  pineconeNamespace?: string;
  embeddingModel?: string;
  batchSize?: number;
  dryRun?: boolean;
  includeTests?: boolean;
}

export class IncrementalProcessor {
  private repoPath: string;
  private stateManager: StateManager;
  private storage: PineconeStorage | null = null;
  private chunker: CodeChunker;
  private embeddingManager: EmbeddingManager;
  private options: IncrementalProcessorOptions;
  private stats: ProcessingStats;
  
  constructor(options: IncrementalProcessorOptions) {
    this.options = {
      ...options,
      batchSize: options.batchSize || 50,
      dryRun: options.dryRun || false,
      includeTests: options.includeTests || false,
      pineconeEnvironment: options.pineconeEnvironment || 'gcp-starter',
      pineconeNamespace: options.pineconeNamespace || 'default',
      embeddingModel: options.embeddingModel || 'text-embedding-ada-002'
    };
    
    this.repoPath = options.repoPath;
    this.stateManager = new StateManager(options.repoPath);
    
    // Note: In a real implementation, these would be properly initialized
    // This is a simplified implementation for reference
    this.chunker = {} as CodeChunker; // Placeholder
    this.embeddingManager = {} as EmbeddingManager; // Placeholder
    
    // Initialize stats
    this.stats = {
      totalFiles: 0,
      addedFiles: 0,
      modifiedFiles: 0,
      deletedFiles: 0,
      totalChunks: 0,
      totalEmbeddings: 0,
      errorCount: 0,
      startTime: new Date()
    };
    
    logger.info(`Initialized IncrementalProcessor with ${this.options.dryRun ? 'DRY RUN MODE' : 'LIVE MODE'}`);
  }
  
  /**
   * Initialize vector storage
   */
  async initialize(): Promise<void> {
    // Skip initialization in dry run mode
    if (this.options.dryRun) {
      logger.info('Dry run mode: Skipping vector storage initialization');
      return;
    }
    
    logger.info('Initializing vector storage...');
    
    try {
      // Initialize Pinecone storage
      this.storage = new PineconeStorage({
        apiKey: this.options.pineconeApiKey,
        indexName: this.options.pineconeIndexName,
        environment: this.options.pineconeEnvironment,
        namespace: this.options.pineconeNamespace
      });
      
      await this.storage.initialize();
      logger.info('Vector storage initialized successfully');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to initialize vector storage: ${errorMsg}`);
      throw new Error(`Vector storage initialization failed: ${errorMsg}`);
    }
  }
  
  /**
   * Process a batch of changed files incrementally
   */
  async processChangedFiles(changes: FileChange[], analyses: FileAnalysis[]): Promise<ProcessingStats> {
    const fileCount = changes.length;
    logger.info(`Processing ${fileCount} changed files incrementally`);
    this.stats.totalFiles = fileCount;
    
    // Map analyses by path for easy lookup
    const analysisMap = new Map<string, FileAnalysis>();
    for (const analysis of analyses) {
      analysisMap.set(analysis.path, analysis);
    }
    
    // Process deleted files first
    const deletedFiles = changes.filter(change => change.status === 'deleted');
    this.stats.deletedFiles = deletedFiles.length;
    
    if (deletedFiles.length > 0) {
      logger.info(`Processing ${deletedFiles.length} deleted files`);
      for (const file of deletedFiles) {
        await this.deleteVectorsForFile(file.path);
      }
    }
    
    // Process added and modified files
    const activeFiles = changes.filter(change => change.status !== 'deleted');
    const addedFiles = changes.filter(change => change.status === 'added');
    const modifiedFiles = changes.filter(change => change.status === 'modified' || change.status === 'renamed');
    
    this.stats.addedFiles = addedFiles.length;
    this.stats.modifiedFiles = modifiedFiles.length;
    
    // Process in batches
    const batchSize = this.options.batchSize || 20;
    
    for (let i = 0; i < activeFiles.length; i += batchSize) {
      const batch = activeFiles.slice(i, i + batchSize);
      logger.info(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(activeFiles.length/batchSize)}`);
      
      // Process each file in the batch
      const processPromises = batch.map(async (file) => {
        const analysis = analysisMap.get(file.path);
        
        if (!analysis) {
          logger.warn(`No analysis available for file: ${file.path}`);
          return;
        }
        
        // Skip test files if not including tests
        if (analysis.category === 'test' && !this.options.includeTests) {
          logger.debug(`Skipping test file: ${file.path}`);
          return;
        }
        
        // Skip files marked for ignore
        if (analysis.category === 'ignore') {
          logger.debug(`Skipping ignored file: ${file.path}`);
          return;
        }
        
        try {
          await this.processFile(file, analysis);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          logger.error(`Error processing file ${file.path}: ${errorMsg}`);
          this.stats.errorCount++;
        }
      });
      
      await Promise.all(processPromises);
    }
    
    // Update stats
    this.stats.endTime = new Date();
    this.stats.durationMs = this.stats.endTime.getTime() - this.stats.startTime.getTime();
    
    logger.info(`Completed incremental processing in ${this.stats.durationMs}ms`);
    logger.info(`Stats: ${JSON.stringify(this.stats, null, 2)}`);
    
    return this.stats;
  }
  
  /**
   * Process a single file
   */
  private async processFile(file: FileChange, analysis: FileAnalysis): Promise<void> {
    logger.info(`Processing file: ${file.path}`);
    
    try {
      // 1. Read file content
      const filePath = path.join(this.repoPath, file.path);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 2. Chunk the content based on the chunking strategy
      const chunks = this.chunker.chunkCode(content, {
        filePath: file.path,
        language: analysis.language,
        strategy: analysis.chunkingStrategy
      });
      
      this.stats.totalChunks += chunks.length;
      logger.debug(`Created ${chunks.length} chunks for ${file.path}`);
      
      // 3. Add metadata to chunks
      const enrichedChunks = chunks.map((chunk: CodeChunk) => ({
        ...chunk,
        metadata: {
          ...chunk.metadata,
          filePath: file.path,
          language: analysis.language,
          category: analysis.category,
          repo: path.basename(this.repoPath),
          changeType: file.status
        }
      }));
      
      // In dry run mode, just log the chunks
      if (this.options.dryRun) {
        logger.info(`[DRY RUN] Would process ${enrichedChunks.length} chunks for ${file.path}`);
        return;
      }
      
      // If modified, first delete existing vectors
      if (file.status === 'modified' || file.status === 'renamed') {
        await this.deleteVectorsForFile(file.path);
        
        // If renamed, also delete vectors for the previous path
        if (file.status === 'renamed' && file.previousPath) {
          await this.deleteVectorsForFile(file.previousPath);
        }
      }
      
      // 4. Generate embeddings
      const embeddings = await this.embeddingManager.embedChunks(enrichedChunks);
      this.stats.totalEmbeddings += embeddings.length;
      
      // 5. Store vectors in database
      if (this.storage && embeddings.length > 0) {
        await this.storage.storeVectors(embeddings);
        logger.info(`Stored ${embeddings.length} vectors for ${file.path}`);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to process file ${file.path}: ${errorMsg}`);
      this.stats.errorCount++;
      throw error;
    }
  }
  
  /**
   * Delete vectors for a file
   */
  async deleteVectorsForFile(filePath: string): Promise<void> {
    logger.info(`Deleting vectors for file: ${filePath}`);
    
    if (this.options.dryRun) {
      logger.info(`[DRY RUN] Would delete vectors for file: ${filePath}`);
      return;
    }
    
    try {
      if (!this.storage) {
        throw new Error('Vector storage not initialized');
      }
      
      // Delete vectors by metadata filter
      const deleteCount = await this.storage.deleteVectorsByMetadata({
        filePath: filePath
      }, this.options.pineconeNamespace);
      
      logger.info(`Deleted vectors for file: ${filePath}`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to delete vectors for file ${filePath}: ${errorMsg}`);
      this.stats.errorCount++;
    }
  }
  
  /**
   * Update processing state with the latest commit
   */
  async updateProcessingState(lastCommit: string): Promise<void> {
    logger.info(`Updating processing state to commit: ${lastCommit}`);
    
    if (this.options.dryRun) {
      logger.info(`[DRY RUN] Would update processing state to: ${lastCommit}`);
      return;
    }
    
    try {
      // Load current state
      const state = await this.stateManager.loadState() || {};
      
      // Update state with new commit and stats
      // Define default state with explicit type casting
      const stateObj = state as Partial<RemcodeState>;
      
      const updatedState = {
        ...stateObj,
        processing: {
          // Ensure we have a default status if processing doesn't exist
          status: (stateObj.processing && 'status' in stateObj.processing) 
            ? stateObj.processing.status 
            : 'updated' as 'idle' | 'analyzing' | 'vectorizing' | 'updating' | 'completed' | 'failed',
          // Include any existing processing properties
          ...(stateObj.processing || {}),
          // Add the new properties
          lastCommit,
          lastUpdated: new Date().toISOString(),
          stats: this.stats
        }
      } as RemcodeState;
      
      // Save updated state
      await this.stateManager.updateState(updatedState);
      logger.info(`Successfully updated processing state to commit: ${lastCommit}`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to update processing state: ${errorMsg}`);
      throw new Error(`Failed to update processing state: ${errorMsg}`);
    }
  }
}
