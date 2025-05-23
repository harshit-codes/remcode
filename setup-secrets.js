#!/usr/bin/env node

/**
 * Setup GitHub Repository Secrets for Remcode
 * This script sets up the required secrets for GitHub Actions workflow
 */

const { Octokit } = require('@octokit/rest');
const sodium = require('libsodium-wrappers');
require('dotenv').config();

async function setupSecrets() {
  // Initialize GitHub client
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = 'harshit-codes';
  const repo = 'remcode';

  try {
    console.log('🔧 Setting up GitHub repository secrets...');
    
    // Get repository public key for encryption
    console.log('📑 Getting repository public key...');
    const { data: publicKey } = await octokit.rest.actions.getRepoPublicKey({
      owner,
      repo,
    });

    console.log(`✅ Public key obtained: ${publicKey.key_id}`);

    // Function to encrypt secret
    function encryptSecret(secret, publicKey) {
      // Convert the secret and key to Uint8Array
      const secretBytes = Buffer.from(secret, 'utf8');
      const keyBytes = Buffer.from(publicKey, 'base64');
      
      // Encrypt using libsodium
      const encryptedBytes = sodium.crypto_box_seal(secretBytes, keyBytes);
      
      // Convert to base64
      return Buffer.from(encryptedBytes).toString('base64');
    }

    // Secrets to set up
    const secrets = [
      {
        name: 'PINECONE_API_KEY',
        value: process.env.PINECONE_API_KEY,
        description: 'Pinecone API key for vector storage'
      },
      {
        name: 'HUGGINGFACE_TOKEN', 
        value: process.env.HUGGINGFACE_TOKEN,
        description: 'HuggingFace API token for embeddings'
      }
    ];

    // Set up each secret
    for (const secret of secrets) {
      if (!secret.value) {
        console.log(`⚠️  Warning: ${secret.name} not found in environment variables`);
        continue;
      }

      console.log(`🔐 Setting up secret: ${secret.name}...`);
      
      try {
        // Encrypt the secret
        const encryptedValue = encryptSecret(secret.value, publicKey.key);
        
        // Create or update the secret
        await octokit.rest.actions.createOrUpdateRepoSecret({
          owner,
          repo,
          secret_name: secret.name,
          encrypted_value: encryptedValue,
          key_id: publicKey.key_id,
        });
        
        console.log(`✅ Secret ${secret.name} set successfully`);
      } catch (error) {
        console.error(`❌ Failed to set secret ${secret.name}:`, error.message);
      }
    }

    console.log('\n🎉 GitHub repository secrets setup complete!');
    console.log('\n📋 Summary:');
    console.log('- Repository: harshit-codes/remcode');
    console.log('- Secrets configured for GitHub Actions workflow');
    console.log('- Ready for end-to-end workflow testing');
    
  } catch (error) {
    console.error('❌ Error setting up secrets:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupSecrets().catch(console.error);
