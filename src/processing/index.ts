/**
 * Processing module exports
 * 
 * This module provides the complete processing pipeline for incremental
 * code analysis, vectorization, and dependency mapping.
 */

// Core processing components
export { ChangeDetector } from './change-detector';
export { FileAnalyzer } from './file-analyzer';
export { IncrementalProcessor } from './incremental';
export { StateManager } from './state-manager';
export { ProcessingPipeline } from './pipeline';

// Types
export * from './types';

// Enhanced analyzers - removed for simplification
