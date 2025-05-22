// Core vectorization components
export { VectorizationPipeline } from './pipeline';
export { ChunkingManager } from './chunkers/manager';
export { EmbeddingManager } from './embedders/manager';
export { PineconeStorage } from './storage/pinecone';

// Types
export interface VectorizationConfig {
  pineconeApiKey: string;
  pineconeIndexName: string;
  pineconeNamespace?: string;
  pineconeEnvironment?: string;
  huggingfaceToken: string;
  embeddingModel?: string;
  fallbackModel?: string;
  batchSize?: number;
  maxFileSize?: number;
  includeExtensions?: string[];
  excludeExtensions?: string[];
  excludePaths?: string[];
}

export interface CodeChunk {
  content: string;
  metadata: {
    file_path: string;
    strategy: string;
    language?: string;
    start_line?: number;
    end_line?: number;
    function_name?: string;
    class_name?: string;
    chunk_type?: string;
    [key: string]: any;
  };
  embedding?: number[];
  id?: string;
}

export interface VectorizationResult {
  success: boolean;
  filesProcessed: number;
  chunksCreated: number;
  vectorsStored: number;
  errors: string[];
  duration: number;
}
