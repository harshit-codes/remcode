import { getLogger } from '../../utils/logger';
import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';

const logger = getLogger('PineconeStorage');

interface PineconeStorageOptions {
  apiKey: string;
  indexName: string;
  dimension?: number;
  metric?: 'cosine' | 'dotproduct' | 'euclidean';
  namespace?: string;
}

interface VectorData {
  id?: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export class PineconeStorage {
  private options: PineconeStorageOptions;
  private initialized: boolean = false;
  private client: Pinecone | null = null;
  private index: any = null;

  constructor(options: PineconeStorageOptions) {
    this.options = {
      ...options,
      dimension: options.dimension || 768,
      metric: options.metric || 'cosine',
    };
  }

  async initialize(): Promise<void> {
    logger.info(`Initializing Pinecone index: ${this.options.indexName}`);
    
    if (!this.options.apiKey) {
      throw new Error('Pinecone API key is required');
    }
    
    try {
      // Initialize the Pinecone client with v6 API
      this.client = new Pinecone({
        apiKey: this.options.apiKey
      });
      
      // Check if the index exists
      const indexList = await this.client.listIndexes();
      const existingIndex = indexList.indexes?.find(idx => idx.name === this.options.indexName);
      
      if (!existingIndex) {
        logger.info(`Creating new Pinecone index: ${this.options.indexName}`);
        
        // Create index using v6 API format
        await this.client.createIndex({
          name: this.options.indexName,
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          },
          dimension: this.options.dimension || 768,
          metric: this.options.metric || 'cosine',
          waitUntilReady: true
        });
        
        logger.info(`Created new Pinecone index: ${this.options.indexName}`);
      } else {
        logger.info(`Using existing Pinecone index: ${this.options.indexName}`);
      }
      
      // Connect to the index
      this.index = this.client.index(this.options.indexName);
      
      logger.info(`Successfully initialized Pinecone storage`);
      this.initialized = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to initialize Pinecone: ${errorMessage}`);
      throw new Error(`Pinecone initialization failed: ${errorMessage}`);
    }
  }

  async storeVectors(vectors: VectorData[]): Promise<void> {
    if (!this.initialized || !this.index) {
      throw new Error('Pinecone storage is not initialized');
    }
    
    logger.info(`Storing ${vectors.length} vectors in Pinecone`);
    
    try {
      const pineconeVectors = vectors.map(vec => ({
        id: vec.id || uuidv4(),
        values: vec.embedding,
        metadata: vec.metadata || {},
      }));
      
      // Batch upsert (100 vectors per batch)
      const chunkSize = 100;
      const namespace = this.options.namespace || '';
      
      for (let i = 0; i < pineconeVectors.length; i += chunkSize) {
        const chunk = pineconeVectors.slice(i, i + chunkSize);
        
        await this.index.namespace(namespace).upsert(chunk);
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
    
    logger.info(`Querying Pinecone index for top ${topK} matches`);
    
    try {
      const ns = namespace || this.options.namespace || '';
      
      const queryResponse = await this.index.namespace(ns).query({
        vector: embeddings,
        topK,
        includeMetadata: true,
        includeValues: false,
        filter
      });
      
      logger.info(`Found ${queryResponse.matches?.length || 0} matches in Pinecone`);
      return queryResponse.matches || [];
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
    const indexNamespace = this.index.namespace(ns);
    
    try {
      if (deleteAll) {
        logger.info(`Deleting all vectors from namespace: ${ns}`);
        await indexNamespace.deleteAll();
        return -1; // All vectors deleted
      } else if (ids && ids.length > 0) {
        logger.info(`Deleting ${ids.length} vectors by ID`);
        
        // Delete in batches
        const batchSize = 100;
        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          await indexNamespace.deleteMany(batch);
        }
        
        return ids.length;
      } else if (filter) {
        logger.info(`Deleting vectors by filter`);
        await indexNamespace.deleteMany({ filter });
        return -1; // Unknown count
      } else {
        throw new Error('Either ids, deleteAll flag, or filter must be provided');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to delete vectors: ${errorMessage}`);
      throw new Error(`Vector deletion failed: ${errorMessage}`);
    }
  }
  
  async deleteVectorsByMetadata(metadata: Record<string, any>, namespace?: string): Promise<number> {
    if (!metadata || Object.keys(metadata).length === 0) {
      throw new Error('Metadata filter is required');
    }
    
    logger.info(`Deleting vectors by metadata`);
    
    // Build filter for Pinecone v6
    const filter: Record<string, any> = {};
    Object.entries(metadata).forEach(([key, value]) => {
      filter[key] = { $eq: value };
    });
    
    return await this.deleteVectors(undefined, false, filter, namespace);
  }
  
  async listIndexes(): Promise<any[]> {
    if (!this.client) {
      throw new Error('Pinecone client is not initialized');
    }
    
    try {
      const response = await this.client.listIndexes();
      return response.indexes || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to list indexes: ${errorMessage}`);
      throw new Error(`Failed to list indexes: ${errorMessage}`);
    }
  }
  
  async getIndexStats(namespace?: string): Promise<any> {
    if (!this.initialized || !this.index) {
      throw new Error('Pinecone storage is not initialized');
    }
    
    try {
      const stats = await this.index.describeIndexStats();
      
      const ns = namespace || this.options.namespace || '';
      if (ns && stats.namespaces?.[ns]) {
        return stats.namespaces[ns];
      }
      
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to get index stats: ${errorMessage}`);
      throw new Error(`Failed to get index stats: ${errorMessage}`);
    }
  }
}
