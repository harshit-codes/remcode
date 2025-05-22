import { getLogger } from '../utils/logger';
import { PineconeStorage } from '../vectorizers/storage/pinecone';
import { EmbeddingManager } from '../vectorizers/embedders/manager';
import { CodeChunk } from '../vectorizers/types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = getLogger('SemanticSearch');

/**
 * Configuration options for semantic search
 */
export interface SemanticSearchOptions {
  pineconeApiKey?: string;
  pineconeIndexName?: string;
  pineconeEnvironment?: string;
  pineconeNamespace?: string;
  huggingfaceToken?: string;
  embeddingModel?: string;
  fallbackModel?: string;
  embeddingDimension?: number;
  batchSize?: number;
}

/**
 * Represents a single search result
 */
export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    filePath: string;
    language: string;
    chunkType: string;
    startLine?: number;
    endLine?: number;
    [key: string]: any;
  };
}

/**
 * Handles semantic code search using vector embeddings
 */
export class SemanticSearch {
  private storage: PineconeStorage | null = null;
  private embeddingManager: EmbeddingManager | null = null;
  private options: SemanticSearchOptions;
  private initialized: boolean = false;

  constructor(options: SemanticSearchOptions = {}) {
    this.options = {
      pineconeApiKey: options.pineconeApiKey || process.env.PINECONE_API_KEY,
      pineconeIndexName: options.pineconeIndexName || 'remcode-default',
      pineconeEnvironment: options.pineconeEnvironment || 'gcp-starter',
      pineconeNamespace: options.pineconeNamespace || 'default',
      huggingfaceToken: options.huggingfaceToken || process.env.HUGGINGFACE_TOKEN,
      embeddingModel: options.embeddingModel || 'microsoft/graphcodebert-base',
      fallbackModel: options.fallbackModel || 'sentence-transformers/all-MiniLM-L6-v2',
      embeddingDimension: options.embeddingDimension || 768,
      batchSize: options.batchSize || 10
    };
  }

  async initialize(): Promise<void> {
    logger.info('Initializing semantic search...');
    
    if (!this.options.pineconeApiKey) {
      throw new Error('Pinecone API key is required for semantic search');
    }
    
    if (!this.options.huggingfaceToken) {
      throw new Error('HuggingFace token is required for semantic search');
    }

    try {
      // Initialize Pinecone storage
      this.storage = new PineconeStorage({
        apiKey: this.options.pineconeApiKey,
        indexName: this.options.pineconeIndexName!,
        namespace: this.options.pineconeNamespace,
        environment: this.options.pineconeEnvironment,
        dimension: this.options.embeddingDimension || 768
      });

      await this.storage.initialize();

      // Initialize embedding manager
      this.embeddingManager = new EmbeddingManager({
        primary: this.options.embeddingModel!,
        fallback: this.options.fallbackModel!,
        batchSize: this.options.batchSize!,
        token: this.options.huggingfaceToken,
        dimension: this.options.embeddingDimension || 768
      });
      
      this.initialized = true;
      logger.info('Semantic search initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to initialize semantic search: ${errorMessage}`);
      throw new Error(`Initialization failed: ${errorMessage}`);
    }
  }

  async search(query: string, topK: number = 10, filters?: Record<string, any>): Promise<SearchResult[]> {
    if (!this.initialized || !this.storage || !this.embeddingManager) {
      throw new Error('Semantic search not initialized. Call initialize() first.');
    }

    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    logger.info(`Searching for: "${query}" (top ${topK} results)`);

    try {
      // 1. Generate embedding for the query
      const queryChunk: CodeChunk = { 
        content: query, 
        metadata: { 
          file_path: 'query', 
          strategy: 'query', 
          chunk_type: 'query' 
        } 
      };
      
      const embeddedQueries = await this.embeddingManager.embedChunks([queryChunk]);
      
      if (!embeddedQueries[0].embedding) {
        throw new Error('Failed to generate embedding for query');
      }

      // 2. Search Pinecone for similar vectors
      const matches = await this.storage.queryVectors(
        embeddedQueries[0].embedding,
        topK,
        filters,
        this.options.pineconeNamespace
      );

      // 3. Format results for consistent API
      const formattedResults: SearchResult[] = matches.map(match => ({
        id: match.id || '',
        score: match.score || 0,
        content: match.metadata?.content || '',
        metadata: {
          filePath: match.metadata?.file_path || '',
          language: match.metadata?.language || '',
          chunkType: match.metadata?.chunk_type || '',
          startLine: match.metadata?.start_line,
          endLine: match.metadata?.end_line,
          functionName: match.metadata?.function_name,
          className: match.metadata?.class_name,
          ...match.metadata
        }
      }));

      logger.info(`Found ${formattedResults.length} results for query: "${query}"`);
      return formattedResults;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Search failed: ${errorMessage}`);
      throw new Error(`Search failed: ${errorMessage}`);
    }
  }

  async searchSimilarCode(codeSnippet: string, topK: number = 5): Promise<SearchResult[]> {
    return this.search(`code: ${codeSnippet}`, topK, { chunk_type: 'function' });
  }

  async searchPatterns(pattern: string, topK: number = 10): Promise<SearchResult[]> {
    return this.search(`pattern: ${pattern}`, topK);
  }

  async searchFunctionality(description: string, topK: number = 10): Promise<SearchResult[]> {
    return this.search(`functionality: ${description}`, topK);
  }

  private formatSearchResults(matches: any[]): SearchResult[] {
    return matches.map(match => ({
      id: match.id,
      score: match.score,
      content: match.metadata?.content || '',
      metadata: {
        filePath: match.metadata?.file_path || '',
        language: match.metadata?.language || '',
        chunkType: match.metadata?.chunk_type || '',
        startLine: match.metadata?.start_line,
        endLine: match.metadata?.end_line,
        functionName: match.metadata?.function_name,
        className: match.metadata?.class_name,
        ...match.metadata
      }
    }));
  }

  async getStats(): Promise<any> {
    if (!this.initialized || !this.storage) {
      throw new Error('Semantic search not initialized');
    }

    return await this.storage.getIndexStats();
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
