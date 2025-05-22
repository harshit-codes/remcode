# vectorizers Entity Relationship Diagram

```mermaid
classDiagram
  class VectorizationConfig {
    <<interface>>
    pineconeApiKey: string
    pineconeIndexName: string
    pineconeNamespace: string
    pineconeEnvironment: string
    huggingfaceToken: string
    embeddingModel: string
    fallbackModel: string
    batchSize: number
    maxFileSize: number
    includeExtensions: string[]
    excludeExtensions: string[]
    excludePaths: string[]
  }
  class CodeChunk {
    <<interface>>
    content: string
    metadata: {
    file_path: string
    strategy: string
    language: string
    start_line: number
    end_line: number
    function_name: string
    class_name: string
    chunk_type: string
    [key: string]: any
    embedding: number[]
    id: string
  }
  class VectorizationResult {
    <<interface>>
    success: boolean
    filesProcessed: number
    chunksCreated: number
    vectorsStored: number
    errors: string[]
    duration: number
  }
  class VectorizationPipeline {
    options: VectorizationOptions
    chunkingManager: ChunkingManager
    embeddingManager: EmbeddingManager
    storage: PineconeStorage
    initialized: boolean = false
    ChunkingManager()
    EmbeddingManager()
    PineconeStorage()
    initialize(): Promise<void>
    catch()
    String()
    Error()
    processFile(): Promise<CodeChunk[]>
    if()
    Error()
    if()
    Date()
    if()
    catch()
    String()
    Error()
    searchSimilarCode(): Promise<any[]>
    if()
    Error()
    if()
    Error()
    catch()
    String()
    Error()
    getStats(): Promise<any>
    if()
    Error()
    file()
    deleteFileVectors(): Promise<number>
    if()
    Error()
    catch()
    String()
    Error()
    createFileInfo(): FileInfo
    determineChunkingStrategy(): string
    if()
    if()
    estimateComplexity(): 'low' | 'medium' | 'high'
    if()
    if()
  }
  class SimpleVectorizer {
    storage: PineconeStorage
    embedder: EmbeddingManager
    PineconeStorage()
    EmbeddingManager()
    initialize(): Promise<void>
    vectorizeText(): Promise<void>
    if()
    Error()
    if()
    Error()
    search(): Promise<any[]>
    if()
    Error()
    if()
    Error()
    getStats(): Promise<any>
    if()
    Error()
  }
  class CodeChunk {
    <<interface>>
    content: string
    metadata: {
    file_path: string
    strategy: string
    language: string
    start_line: number
    end_line: number
    function_name: string
    class_name: string
    chunk_type: string
    [key: string]: any
    embedding: number[]
    id: string
  }
  class FileInfo {
    <<interface>>
    file_path: string
    relative_path: string
    language: string
    size: number
    extension: string
  }
  class VectorizationResult {
    <<interface>>
    success: boolean
    filesProcessed: number
    chunksCreated: number
    vectorsStored: number
    errors: string[]
    duration: number
  }
  class VectorizationOptions {
    <<interface>>
    pineconeApiKey: string
    pineconeIndexName: string
    pineconeNamespace: string
    pineconeEnvironment: string
    huggingfaceToken: string
    embeddingModel: string
    fallbackModel: string
    batchSize: number
    chunkingStrategy: {
    clean_modules: string
    complex_modules: string
    monolithic_files: string
    maxFileSize: number
    includeExtensions: string[]
    excludeExtensions: string[]
    excludePaths: string[]
  }
  class ChunkingStrategy {
    <<interface>>
    clean_modules: string
    complex_modules: string
    monolithic_files: string
  }
  class EmbeddingManagerOptions {
    <<interface>>
    primary: string
    fallback: string
    batchSize: number
    token: string
    dimension: number
  }
  class PineconeStorageOptions {
    <<interface>>
    apiKey: string
    indexName: string
    dimension: number
    metric: 'cosine' | 'dotproduct' | 'euclidean'
    environment: string
    namespace: string
  }
  class VectorData {
    <<interface>>
    id: string
    embedding: number[]
    metadata: Record<string, any>
  }

  %% Inheritance relationships

  %% Usage relationships
  VectorizationPipeline --> CodeChunk: uses
  VectorizationPipeline --> FileInfo: uses
  VectorizationPipeline --> VectorizationResult: uses
  VectorizationPipeline --> VectorizationOptions: uses
  VectorizationPipeline --> ChunkingStrategy: uses
  VectorizationPipeline --> EmbeddingManagerOptions: uses
  VectorizationPipeline --> PineconeStorageOptions: uses
  VectorizationPipeline --> VectorData: uses

  %% Style and notes
  note "Generated from folder: vectorizers" as Note1

  %% File groupings
  note "index.ts" as Note_index
  note "types.ts" as Note_types
  note "pipeline.ts" as Note_pipeline
  note "simple.ts" as Note_simple
```
