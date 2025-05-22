#!/usr/bin/env ts-node

/**
 * Test the core vectorization components
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { SimpleVectorizer } from '../src/vectorizers/simple';

async function testCoreVectorization() {
  console.log('🧪 Testing Core Vectorization Components...\n');

  try {
    // Check environment
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const huggingfaceToken = process.env.HUGGINGFACE_TOKEN;

    if (!pineconeApiKey || !huggingfaceToken) {
      throw new Error('Missing required environment variables');
    }

    console.log('✅ Environment variables loaded');

    // Initialize vectorizer
    console.log('🔧 Initializing vectorizer...');
    const vectorizer = new SimpleVectorizer({
      pineconeApiKey,
      pineconeIndexName: 'remcode-test',
      huggingfaceToken,
      namespace: 'test'
    });

    await vectorizer.initialize();
    console.log('✅ Vectorizer initialized');

    // Test vectorization
    console.log('📝 Testing vectorization...');
    await vectorizer.vectorizeText('function authenticate(user) { return user.isValid; }', {
      file_path: 'test/auth.js',
      language: 'javascript',
      function_name: 'authenticate'
    });
    console.log('✅ Text vectorized');

    // Test search
    console.log('🔍 Testing search...');
    const results = await vectorizer.search('authentication function', 3);
    console.log(`✅ Search completed: ${results.length} results found`);

    if (results.length > 0) {
      console.log('📋 Search results:');
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. Score: ${result.score?.toFixed(3)} - ${result.metadata?.file_path}`);
      });
    }

    // Get stats
    console.log('📊 Getting stats...');
    const stats = await vectorizer.getStats();
    console.log('✅ Stats:', JSON.stringify(stats, null, 2));

    console.log('\n🎉 Core vectorization test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run test
testCoreVectorization();
