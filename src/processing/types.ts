/**
 * Common types used across the processing system
 */

import { CodeChunk, ChunkStrategyType } from '../vectorizers/types';

// Re-export core types for convenience
export { CodeChunk, ChunkStrategyType } from '../vectorizers/types';

/**
 * File change information from git
 */
export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  previousPath?: string;
  size?: number;
  extension?: string;
}

/**
 * Analysis of a single file
 */
export interface FileAnalysis {
  path: string;
  category: 'priority' | 'normal' | 'test' | 'config' | 'ignore';
  language: string;
  complexity: 'low' | 'medium' | 'high';
  size: number;
  sloc?: number;
  imports?: string[];
  exports?: string[];
  functions?: string[];
  classes?: string[];
  dependencies?: string[];
  chunkingStrategy: ChunkStrategyType;
  metadata?: Record<string, any>;
}

/**
 * Processing statistics
 */
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

/**
 * Analysis options for file processing
 */
export interface AnalysisOptions {
  basePath: string;
  skipAST?: boolean;
  skipDependencies?: boolean;
  maxFileSizeBytes?: number;
}

/**
 * Options for incremental processing
 */
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

/**
 * Vector metadata for storage
 */
export interface VectorMetadata {
  filePath: string;
  language: string;
  category: string;
  startLine?: number;
  endLine?: number;
  functionName?: string;
  className?: string;
  chunkType: string;
  strategy: string;
  repo: string;
  changeType?: 'added' | 'modified' | 'deleted' | 'renamed';
  [key: string]: any;
}
