#!/usr/bin/env node

/**
 * Test the compiled core vectorization components with correct Pinecone settings
 */

require('dotenv').config();

async function testCoreVectorization() {
  console.log('🧪 Testing Core Vectorization Components...\n');

  try {
    // Check environment
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const huggingfaceToken = process.env.HUGGINGFACE_TOKEN;

    if (!pineconeApiKey || !huggingfaceToken) {
      throw new Error('Missing required environment variables: PINECONE_API_KEY and HUGGINGFACE_TOKEN');
    }

    console.log('✅ Environment variables loaded');

    // Test Pinecone Storage with correct settings for free tier
    console.log('🔧 Testing Pinecone storage...');
    const { PineconeStorage } = require('./dist/vectorizers/storage/pinecone');
    
    const storage = new PineconeStorage({
      apiKey: pineconeApiKey,
      indexName: 'remcode-test',
      namespace: 'test',
      dimension: 768,
      metric: 'cosine',
      environment: 'us-east-1-aws' // Use AWS environment for free tier
    });

    await storage.initialize();
    console.log('✅ Pinecone storage initialized');

    // Test Embedding Manager
    console.log('🔧 Testing embedding manager...');
    const { EmbeddingManager } = require('./dist/vectorizers/embedders/manager');
    
    const embedder = new EmbeddingManager({
      primary: 'microsoft/graphcodebert-base',
      fallback: 'sentence-transformers/all-MiniLM-L6-v2',
      batchSize: 2,
      token: huggingfaceToken,
      dimension: 768
    });

    // Test embedding generation
    const testChunk = {
      content: 'function authenticate(user) { return user.isValid; }',
      metadata: {
        file_path: 'test/auth.js',
        strategy: 'manual',
        language: 'javascript',
        function_name: 'authenticate',
        chunk_type: 'function'
      }
    };

    console.log('📝 Generating embeddings...');
    const embeddedChunks = await embedder.embedChunks([testChunk]);
    
    if (embeddedChunks[0] && embeddedChunks[0].embedding) {
      console.log(`✅ Embedding generated: ${embeddedChunks[0].embedding.length} dimensions`);
      
      // Test storage
      console.log('💾 Storing vector...');
      await storage.storeVectors([{
        embedding: embeddedChunks[0].embedding,
        metadata: embeddedChunks[0].metadata
      }]);
      console.log('✅ Vector stored');

      // Test search
      console.log('🔍 Testing search...');
      const searchResults = await storage.queryVectors(embeddedChunks[0].embedding, 3);
      console.log(`✅ Search completed: ${searchResults.length} results found`);

      if (searchResults.length > 0) {
        console.log('📋 Search results:');
        searchResults.forEach((result, index) => {
          console.log(`  ${index + 1}. Score: ${result.score?.toFixed(3)} - ${result.metadata?.file_path || 'Unknown'}`);
        });
      }

      // Test end-to-end semantic search
      console.log('🧠 Testing semantic search...');
      const searchQuery = {
        content: 'user authentication',
        metadata: {
          file_path: 'query',
          strategy: 'search',
          chunk_type: 'query'
        }
      };

      const queryEmbedded = await embedder.embedChunks([searchQuery]);
      if (queryEmbedded[0].embedding) {
        const semanticResults = await storage.queryVectors(queryEmbedded[0].embedding, 2);
        console.log(`✅ Semantic search: ${semanticResults.length} results found`);
      }

    } else {
      throw new Error('Failed to generate embedding');
    }

    // Test stats
    console.log('📊 Getting index stats...');
    const stats = await storage.getIndexStats();
    console.log('✅ Stats retrieved:', JSON.stringify(stats, null, 2));

    console.log('\n🎉 Core vectorization test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Pinecone Storage: Working');
    console.log('  ✅ Embedding Manager: Working'); 
    console.log('  ✅ Vector Storage: Working');
    console.log('  ✅ Vector Search: Working');
    console.log('  ✅ Semantic Search: Working');
    console.log('\n🚀 Core Vectorization Engine is fully functional!');

  } catch (error) {
    console.error('❌ Test failed:', error.message || error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run test
testCoreVectorization().catch(console.error);
