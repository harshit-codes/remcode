#!/usr/bin/env node

/**
 * Test script for the Processing Pipeline
 * 
 * This script demonstrates the complete processing pipeline functionality
 */

import { ProcessingPipeline } from '../src/processing';
import { IncrementalProcessorOptions } from '../src/processing/types';
import { getLogger } from '../src/utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = getLogger('ProcessingPipelineTest');

async function testProcessingPipeline() {
  logger.info('Starting Processing Pipeline Test');

  const repoPath = process.cwd();
  
  // Configuration for the incremental processor
  const options: IncrementalProcessorOptions = {
    repoPath,
    pineconeApiKey: process.env.PINECONE_API_KEY || 'test-key',
    pineconeIndexName: 'test-remcode-index',
    pineconeEnvironment: 'gcp-starter',
    pineconeNamespace: 'test',
    embeddingModel: 'microsoft/graphcodebert-base',
    batchSize: 5,
    dryRun: true, // Safe mode for testing
    includeTests: false
  };

  try {
    // Initialize processing pipeline
    const pipeline = new ProcessingPipeline(repoPath, options);
    
    // Test 1: Get current status
    logger.info('Test 1: Getting pipeline status...');
    const status = await pipeline.getStatus();
    logger.info(`Status: ${JSON.stringify(status, null, 2)}`);

    // Test 2: Check for pending changes
    logger.info('Test 2: Checking for pending changes...');
    const hasPending = await pipeline.hasPendingChanges();
    logger.info(`Has pending changes: ${hasPending}`);

    // Test 3: Run incremental processing
    logger.info('Test 3: Running incremental processing...');
    const stats = await pipeline.processIncremental();
    logger.info(`Processing stats: ${JSON.stringify(stats, null, 2)}`);

    logger.info('✅ All tests completed successfully!');

  } catch (error) {
    logger.error(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testProcessingPipeline().catch(console.error);
}
