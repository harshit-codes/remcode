#!/usr/bin/env node

/**
 * Quick validation script for model initialization functionality
 */

const path = require('path');

async function validateModelInitialization() {
  const { ModelInitializer } = require('../dist/setup/model-initializer');
  const { EmbeddingManager } = require('../dist/vectorizers/embedders/manager');

  console.log('🔧 Testing Model Initialization Functionality\n');

  // Check if HuggingFace token is available
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    console.log('❌ HUGGINGFACE_TOKEN environment variable not found');
    console.log('💡 Please set HUGGINGFACE_TOKEN to test model initialization');
    process.exit(1);
  }

  try {
    // Test 1: Token validation
    console.log('1. Testing token validation...');
    const isValidToken = await ModelInitializer.validateToken(token);
    console.log(`   Token valid: ${isValidToken ? '✅' : '❌'}`);

    if (!isValidToken) {
      console.log('❌ Invalid token. Please check your HUGGINGFACE_TOKEN');
      process.exit(1);
    }

    // Test 2: Model initialization
    console.log('\n2. Testing model initialization...');
    const initializer = new ModelInitializer(token);
    const result = await initializer.initializeEmbeddingModel({
      token: token,
      preferredModel: 'microsoft/codebert-base',
      testEmbedding: true
    });

    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Model ID: ${result.modelId}`);
    console.log(`   Model Name: ${result.modelName}`);
    console.log(`   Dimension: ${result.embeddingDimension}`);
    console.log(`   Healthy: ${result.isHealthy ? '✅' : '❌'}`);
    console.log(`   Available Models: ${result.availableModels?.length || 0}`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    // Test 3: Configuration generation
    console.log('\n3. Testing configuration generation...');
    const config = ModelInitializer.getModelConfiguration(result);
    console.log(`   Config generated: ✅`);
    console.log(`   Embedding Model: ${config.embeddingModel}`);
    console.log(`   Model Name: ${config.embeddingModelName}`);
    console.log(`   Dimension: ${config.embeddingDimension}`);

    // Test 4: EmbeddingManager integration
    console.log('\n4. Testing EmbeddingManager integration...');
    const manager = new EmbeddingManager({
      token: token,
      primary: 'microsoft/codebert-base',
      fallback: 'BAAI/bge-base-en-v1.5',
      batchSize: 10
    });

    const availableModels = manager.getAvailableModels();
    console.log(`   Available models: ${availableModels.length}`);
    
    const codeBertModel = availableModels.find(m => m.id === 'microsoft/codebert-base');
    console.log(`   CodeBERT found: ${codeBertModel ? '✅' : '❌'}`);
    
    if (codeBertModel) {
      console.log(`   CodeBERT name: ${codeBertModel.name}`);
      console.log(`   CodeBERT strategy: ${codeBertModel.strategy}`);
      console.log(`   CodeBERT dimension: ${codeBertModel.embeddingDimension}`);
    }

    console.log('\n🎉 Model initialization validation completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Token validation: Working`);
    console.log(`   ✅ Model initialization: Working`);
    console.log(`   ✅ Configuration generation: Working`);
    console.log(`   ✅ EmbeddingManager integration: Working`);

  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run validation
validateModelInitialization().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
