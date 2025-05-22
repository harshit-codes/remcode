import { getLogger } from '../utils/logger';
import { PineconeStorage } from '../vectorizers/storage/pinecone';
import { EmbeddingManager } from '../vectorizers/embedders/manager';
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
  private pineconeStorage: PineconeStorage | null = null;
  private embeddingManager: EmbeddingManager | null = null;
  private options: SemanticSearchOptions;
  private initialized: boolean = false;

  /**
   * Creates a new SemanticSearch instance
   * @param options Configuration options
   */
  constructor(options: SemanticSearchOptions = {}) {
    this.options = {
      pineconeApiKey: options.pineconeApiKey || process.env.PINECONE_API_KEY,
      pineconeIndexName: options.pineconeIndexName || process.env.PINECONE_INDEX || 'remcode',
      pineconeEnvironment: options.pineconeEnvironment || process.env.PINECONE_ENVIRONMENT,
      pineconeNamespace: options.pineconeNamespace || process.env.PINECONE_NAMESPACE,
      huggingfaceToken: options.huggingfaceToken || process.env.HUGGINGFACE_TOKEN,
      embeddingModel: options.embeddingModel || 'microsoft/graphcodebert-base',
      fallbackModel: options.fallbackModel || 'sentence-transformers/all-MiniLM-L6-v2',
      embeddingDimension: options.embeddingDimension || 768, // Default for GraphCodeBERT
      batchSize: options.batchSize || 10
    };
  }

  /**
   * Initializes the search service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    logger.info('Initializing semantic search service');

    try {
      // Initialize Pinecone storage
      if (!this.options.pineconeApiKey) {
        throw new Error('Pinecone API key is required');
      }

      if (!this.options.pineconeIndexName) {
        throw new Error('Pinecone index name is required');
      }

      this.pineconeStorage = new PineconeStorage({
        apiKey: this.options.pineconeApiKey,
        indexName: this.options.pineconeIndexName,
        environment: this.options.pineconeEnvironment,
        namespace: this.options.pineconeNamespace,
        dimension: this.options.embeddingDimension
      });

      await this.pineconeStorage.initialize();
      logger.info('Pinecone storage initialized successfully');

      // Initialize embedding manager
      this.embeddingManager = new EmbeddingManager({
        primary: this.options.embeddingModel!,
        fallback: this.options.fallbackModel!,
        token: this.options.huggingfaceToken,
        dimension: this.options.embeddingDimension,
        batchSize: this.options.batchSize!
      });

      this.initialized = true;
      logger.info('Semantic search service initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to initialize semantic search: ${errorMessage}`);
      throw new Error(`Semantic search initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Performs a semantic search using the provided query
   * @param query The search query
   * @param topK Number of results to return
   * @param filters Optional filters to apply
   * @returns Array of search results
   */
  async search(query: string, topK: number = 10, filters?: Record<string, any>): Promise<SearchResult[]> {
    logger.info(`Performing semantic search: "${query}" (top ${topK})`);
    
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.embeddingManager || !this.pineconeStorage) {
      throw new Error('Semantic search is not properly initialized');
    }

    try {
      // 1. Generate embedding for the query
      const queryChunk = { content: query };
      const embeddedChunks = await this.embeddingManager.embedChunks([queryChunk]);
      const queryEmbedding = embeddedChunks[0].embedding;

      if (!queryEmbedding) {
        throw new Error('Failed to generate embedding for query');
      }

      // 2. Search Pinecone for similar vectors
      const namespace = this.options.pineconeNamespace;
      const matches = await this.pineconeStorage.queryVectors(queryEmbedding, topK, filters, namespace);

      // 3. Format results
      return this.formatSearchResults(matches);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Semantic search failed: ${errorMessage}`);
      throw new Error(`Semantic search failed: ${errorMessage}`);
    }
  }

  /**
   * Searches for code snippets similar to the provided one
   * @param codeSnippet The code snippet to find similar examples of
   * @param topK Number of results to return
   * @param filters Optional filters to apply
   * @returns Array of search results
   */
  async searchSimilarCode(codeSnippet: string, topK: number = 5, filters?: Record<string, any>): Promise<SearchResult[]> {
    logger.info(`Searching for code snippets similar to provided code (${codeSnippet.length} chars)`);
    
    // We can use the same method, but may want to add specific filters for code
    // such as limiting to same language or same file type
    return this.search(codeSnippet, topK, filters);
  }

  /**
   * Searches for patterns in the codebase
   * @param pattern The pattern description or example
   * @param topK Number of results to return
   * @param language Optional language filter
   * @returns Array of search results
   */
  async searchPatterns(pattern: string, topK: number = 5, language?: string): Promise<SearchResult[]> {
    logger.info(`Searching for pattern: "${pattern}" in language ${language || 'any'}`);
    
    // Add language filter if provided
    const filters = language ? { language } : undefined;
    
    return this.search(pattern, topK, filters);
  }

  /**
   * Searches for functions with specific behavior
   * @param functionDescription Description of the function behavior
   * @param topK Number of results to return
   * @returns Array of search results
   */
  async searchFunctionality(functionDescription: string, topK: number = 5): Promise<SearchResult[]> {
    logger.info(`Searching for functionality: "${functionDescription}"`);
    
    // Add filter to only return functions
    const filters = { chunkType: 'function' };
    
    return this.search(functionDescription, topK, filters);
  }

  /**
   * Formats raw Pinecone matches into SearchResult objects
   * @param matches Matches from Pinecone query
   * @returns Formatted search results
   */
  private formatSearchResults(matches: any[]): SearchResult[] {
    return matches.map(match => {
      // Extract metadata from match
      const metadata = match.metadata || {};
      
      return {
        id: match.id,
        score: match.score,
        content: metadata.content || '',
        metadata: {
          filePath: metadata.file_path || metadata.filePath || '',
          language: metadata.language || 'unknown',
          chunkType: metadata.chunk_type || metadata.chunkType || 'unknown',
          startLine: metadata.start_line || metadata.startLine,
          endLine: metadata.end_line || metadata.endLine,
          ...metadata // Include any other metadata
        }
      };
    });
  }
}
