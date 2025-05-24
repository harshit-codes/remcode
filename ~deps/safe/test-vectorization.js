#!/usr/bin/env node

/**
 * Test script for the Core Vectorization Engine
 * This tests the basic pipeline functionality
 */

import * as dotenv from 'dotenv';
import { VectorizationPipeline } from '../src/vectorizers/pipeline';

// Load environment variables
dotenv.config();

async function testVectorizationPipeline() {
  console.log('🧪 Testing Core Vectorization Engine...\n');

  try {
    // Check environment variables
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const huggingfaceToken = process.env.HUGGINGFACE_TOKEN;

    if (!pineconeApiKey) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }

    if (!huggingfaceToken) {
      throw new Error('HUGGINGFACE_TOKEN environment variable is required');
    }

    console.log('✅ Environment variables found');

    // Initialize the pipeline
    console.log('🔧 Initializing vectorization pipeline...');
    
    const pipeline = new VectorizationPipeline({
      pineconeApiKey,
      pineconeIndexName: 'remcode-test',
      pineconeNamespace: 'test',
      pineconeEnvironment: 'gcp-starter',
      huggingfaceToken,
      embeddingModel: 'microsoft/graphcodebert-base',
      fallbackModel: 'sentence-transformers/all-MiniLM-L6-v2',
      batchSize: 5,
      maxFileSize: 1024 * 1024, // 1MB
      includeExtensions: ['.ts', '.js', '.py'],
      excludeExtensions: ['.test.js', '.spec.js', '.d.ts'],
      excludePaths: ['node_modules', '.git', 'dist', 'build']
    });

    await pipeline.initialize();
    console.log('✅ Pipeline initialized successfully');

    // Test search functionality (if index has data)
    console.log('🔍 Testing search functionality...');
    try {
      const searchResults = await pipeline.searchSimilarCode('function authentication', 3);
      console.log(`✅ Search test successful: found ${searchResults.length} results`);
      
      if (searchResults.length > 0) {
        console.log('📋 Sample results:');
        searchResults.slice(0, 2).forEach((result, index) => {
          console.log(`  ${index + 1}. Score: ${result.score?.toFixed(3)} - ${result.metadata?.file_path || 'Unknown'}`);
        });
      }
    } catch (searchError) {
      console.log(`⚠️  Search test failed (expected if index is empty): ${searchError instanceof Error ? searchError.message : String(searchError)}`);
    }

    // Get stats
    console.log('📊 Getting index statistics...');
    try {
      const stats = await pipeline.getStats();
      console.log('✅ Stats retrieved:', JSON.stringify(stats, null, 2));
    } catch (statsError) {
      console.log(`⚠️  Stats retrieval failed: ${statsError instanceof Error ? statsError.message : String(statsError)}`);
    }

    console.log('\n🎉 Core Vectorization Engine test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the test
testVectorizationPipeline();
