import { getLogger } from '../../utils/logger';
import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';

const logger = getLogger('PineconeStorage');

interface PineconeStorageOptions {
  apiKey: string;
  indexName: string;
  dimension?: number;
  metric?: 'cosine' | 'dotproduct' | 'euclidean';
  environment?: string;
  namespace?: string;
}

interface VectorData {
  id?: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

interface PineconeVector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export class PineconeStorage {
  private options: PineconeStorageOptions;
  private initialized: boolean = false;
  private client: Pinecone | null = null;
  private index: any = null; // Using any type to accommodate Pinecone SDK API

  constructor(options: PineconeStorageOptions) {
    this.options = {
      ...options,
      dimension: options.dimension || 768, // Default dimension for GraphCodeBERT
      metric: options.metric || 'cosine',  // Default to cosine similarity
    };
  }

  async initialize(): Promise<void> {
    logger.info(`Initializing Pinecone index: ${this.options.indexName}`);
    
    if (!this.options.apiKey) {
      throw new Error('Pinecone API key is required');
    }
    
    try {
      // 1. Initialize the Pinecone client using non-deprecated API
      this.client = new Pinecone({
        apiKey: this.options.apiKey,
        environment: this.options.environment || 'gcp-starter',
      });
      
      // 2. Check if the index exists, create it if not
      const indexList = await this.client.listIndexes();
      const existingIndex = indexList.some(idx => idx.name === this.options.indexName);
      
      if (!existingIndex) {
        logger.info(`Creating new Pinecone index: ${this.options.indexName}`);
        await this.client.createIndex({
          name: this.options.indexName,
          dimension: this.options.dimension || 768,
          metric: this.options.metric || 'cosine',
          waitUntilReady: true
        });
        
        // Wait for index to be ready
        await this.waitForIndexReady(this.options.indexName);
      } else {
        logger.info(`Found existing Pinecone index: ${this.options.indexName}`);
        
        // Verify the index exists
        const indexDetails = await this.client.describeIndex(this.options.indexName);
        
        logger.info(`Using existing Pinecone index: ${this.options.indexName}`);
      }
      
      // 3. Connect to the index
      this.index = this.client.index(this.options.indexName);
      
      logger.info(`Successfully initialized Pinecone storage with index: ${this.options.indexName}`);
      this.initialized = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to initialize Pinecone: ${errorMessage}`);
      throw new Error(`Pinecone initialization failed: ${errorMessage}`);
    }
  }

  // Helper method to wait for index creation to complete
  private async waitForIndexReady(indexName: string, maxAttempts: number = 10): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const indexDescription = await this.client!.describeIndex(indexName);
        
        if (indexDescription.status?.ready) {
          logger.info(`Index ${indexName} is ready`);
          return;
        }
        logger.info(`Waiting for index ${indexName} to be ready`);
      } catch (error) {
        logger.warn(`Error checking index status: ${error instanceof Error ? error.message : String(error)}`);
        // Ignore errors during polling
      }
      
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error(`Index ${indexName} not ready after ${maxAttempts} attempts`);
  }

  async storeVectors(vectors: VectorData[]): Promise<void> {
    if (!this.initialized || !this.index) {
      throw new Error('Pinecone storage is not initialized');
    }
    
    logger.info(`Storing ${vectors.length} vectors in Pinecone`);
    
    try {
      // 1. Format vectors for Pinecone upsert
      const pineconeVectors = vectors.map(vec => ({
        id: vec.id || uuidv4(),
        values: vec.embedding,
        metadata: vec.metadata || {},
      }));
      
      // 2. Batch upsert to Pinecone (in chunks of 100)
      const chunkSize = 100;
      const namespace = this.options.namespace || '';
      
      for (let i = 0; i < pineconeVectors.length; i += chunkSize) {
        const chunk = pineconeVectors.slice(i, i + chunkSize);
        // Upsert using current Pinecone format
        await this.index.upsert({
          vectors: chunk,
          namespace: namespace
        });
        logger.debug(`Upserted batch ${Math.floor(i/chunkSize) + 1}/${Math.ceil(pineconeVectors.length/chunkSize)}`);
      }
      
      logger.info(`Successfully stored ${vectors.length} vectors in Pinecone`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to store vectors in Pinecone: ${errorMessage}`);
      throw new Error(`Vector storage failed: ${errorMessage}`);
    }
  }

  async queryVectors(embeddings: number[], topK: number = 10, filter?: Record<string, any>, namespace?: string): Promise<any[]> {
    if (!this.initialized || !this.index) {
      throw new Error('Pinecone storage is not initialized');
    }
    
    logger.info(`Querying Pinecone index: ${this.options.indexName} for top ${topK} matches`);
    
    try {
      // Query using the current Pinecone SDK format
      const ns = namespace || this.options.namespace || '';
      
      const queryResponse = await this.index.query({
        vector: embeddings,
        topK,
        includeMetadata: true,
        includeValues: false,
        filter,
        namespace: ns,
      });
      
      logger.info(`Found ${queryResponse.matches.length} matches in Pinecone`);
      return queryResponse.matches;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to query vectors in Pinecone: ${errorMessage}`);
      throw new Error(`Vector query failed: ${errorMessage}`);
    }
  }
  
  async deleteVectors(ids?: string[], deleteAll: boolean = false, filter?: Record<string, any>, namespace?: string): Promise<number> {
    if (!this.initialized || !this.index) {
      throw new Error('Pinecone storage is not initialized');
    }
    
    const ns = namespace || this.options.namespace || '';
    
    try {
      if (deleteAll) {
        logger.info(`Deleting all vectors from Pinecone index: ${this.options.indexName}`);
        // Delete all vectors in the namespace
        await this.index.deleteAll({
          namespace: ns
        });
        return -1; // Indicating all vectors were deleted
      } else if (ids && ids.length > 0) {
        logger.info(`Deleting ${ids.length} vectors from Pinecone index: ${this.options.indexName}`);
        
        // Delete in batches of 100
        const batchSize = 100;
        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          // Delete using current Pinecone format
          await this.index.deleteMany({
            ids: batch,
            namespace: ns
          });
          logger.debug(`Deleted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(ids.length/batchSize)}`);
        }
        
        return ids.length;
      } else if (filter) {
        logger.info(`Deleting vectors by filter from Pinecone index: ${this.options.indexName}`);
        // Delete by filter using current format
        await this.index.deleteMany({
          filter,
          namespace: ns
        });
        return -1; // Can't know how many were deleted with a filter
      } else {
        throw new Error('Either ids, deleteAll flag, or filter must be provided');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to delete vectors from Pinecone: ${errorMessage}`);
      throw new Error(`Vector deletion failed: ${errorMessage}`);
    }
  }
  
  /**
   * Delete vectors by metadata fields
   * This is a convenience method for incremental updates when vectors need
   * to be deleted by file path or other metadata criteria
   * @param metadata Metadata field criteria to match
   * @param namespace Optional namespace (uses default if not provided)
   * @returns A promise that resolves when deletion is complete
   */
  async deleteVectorsByMetadata(metadata: Record<string, any>, namespace?: string): Promise<number> {
    if (!this.initialized || !this.index) {
      throw new Error('Pinecone storage is not initialized');
    }
    
    if (!metadata || Object.keys(metadata).length === 0) {
      throw new Error('Metadata filter is required');
    }
    
    logger.info(`Deleting vectors by metadata from Pinecone index: ${this.options.indexName}`);
    logger.debug('Metadata filter:', metadata);
    
    try {
      // Convert the metadata object to a proper Pinecone filter
      const filter: Record<string, any> = {};
      
      // For each metadata field, add a filter condition
      Object.entries(metadata).forEach(([key, value]) => {
        filter[`metadata.${key}`] = { $eq: value };
      });
      
      // Use the deleteVectors method with the constructed filter
      return await this.deleteVectors(undefined, false, filter, namespace);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to delete vectors by metadata: ${errorMessage}`);
      throw new Error(`Vector deletion by metadata failed: ${errorMessage}`);
    }
  }
  
  async listIndexes(): Promise<any[]> {
    if (!this.client) {
      throw new Error('Pinecone client is not initialized');
    }
    
    try {
      const indexes = await this.client.listIndexes();
      return indexes;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to list Pinecone indexes: ${errorMessage}`);
      throw new Error(`Failed to list indexes: ${errorMessage}`);
    }
  }
  
  async getIndexStats(namespace?: string): Promise<any> {
    if (!this.initialized || !this.index) {
      throw new Error('Pinecone storage is not initialized');
    }
    
    try {
      // Get index stats using current format
      const stats = await this.index.describeIndexStats();
      
      const ns = namespace || this.options.namespace || '';
      const namespaceStats = ns ? stats.namespaces?.[ns] : stats;
      
      return namespaceStats || stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to get index stats: ${errorMessage}`);
      throw new Error(`Failed to get index stats: ${errorMessage}`);
    }
  }
}
