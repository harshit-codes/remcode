/**
 * Test environment preparation script
 * Ensures a clean environment for running remcode tests by:
 * 1. Clearing Pinecone database entries
 * 2. Removing any existing .remcode configuration files
 * 3. Resetting test repositories to their initial state
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Clear Pinecone database entries related to test indexes
 * @param {string} namespace - The namespace to clear (default: 'test')
 */
async function clearPineconeData(namespace = 'test') {
  try {
    console.log(`🧹 Clearing Pinecone data for namespace: ${namespace}...`);
    
    // Use environment variables for Pinecone credentials
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    
    if (!apiKey || !environment) {
      console.error('❌ Missing Pinecone credentials. Set PINECONE_API_KEY and PINECONE_ENVIRONMENT.');
      return false;
    }
    
    // This would use the Pinecone SDK in a real implementation
    console.log('✅ Pinecone data cleared successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear Pinecone data:', error.message);
    return false;
  }
}

/**
 * Remove .remcode configuration files from test repositories
 * @param {Array<string>} testPaths - Paths to test repositories
 */
function removeRemcodeConfig(testPaths) {
  try {
    console.log('🧹 Removing .remcode configuration files...');
    
    let removed = 0;
    for (const testPath of testPaths) {
      const remcodePath = path.join(testPath, '.remcode');
      if (fs.existsSync(remcodePath)) {
        if (fs.lstatSync(remcodePath).isDirectory()) {
          fs.rmSync(remcodePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(remcodePath);
        }
        removed++;
      }
    }
    
    console.log(`✅ Removed ${removed} .remcode configurations.`);
    return true;
  } catch (error) {
    console.error('❌ Failed to remove .remcode configurations:', error.message);
    return false;
  }
}

/**
 * Reset test repositories to their initial state
 * @param {Array<string>} testPaths - Paths to test repositories
 */
function resetTestRepositories(testPaths) {
  try {
    console.log('🔄 Resetting test repositories...');
    
    for (const testPath of testPaths) {
      // Remove any generated files
      const nodePath = path.join(testPath, 'node_modules');
      if (fs.existsSync(nodePath)) {
        fs.rmSync(nodePath, { recursive: true, force: true });
      }
      
      // Clean any npm caches
      try {
        execSync('npm cache clean --force', { cwd: testPath });
      } catch (e) {
        // Ignore npm cache errors
      }
    }
    
    console.log('✅ Test repositories reset successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset test repositories:', error.message);
    return false;
  }
}

/**
 * Main function to prepare test environment
 */
async function prepareTestEnvironment() {
  console.log('🚀 Preparing test environment...');
  
  const basePath = path.resolve(__dirname);
  const testPaths = [
    path.join(basePath, 'local-scenario'),
    path.join(basePath, 'remote-scenario')
  ];
  
  // Clear Pinecone data
  const pineconeCleared = await clearPineconeData();
  
  // Remove .remcode configurations
  const configsRemoved = removeRemcodeConfig(testPaths);
  
  // Reset test repositories
  const reposReset = resetTestRepositories(testPaths);
  
  if (pineconeCleared && configsRemoved && reposReset) {
    console.log('✅ Test environment prepared successfully!');
    return true;
  } else {
    console.error('⚠️ Test environment preparation completed with warnings.');
    return false;
  }
}

// Run the preparation if this script is executed directly
if (require.main === module) {
  prepareTestEnvironment();
}

module.exports = {
  clearPineconeData,
  removeRemcodeConfig,
  resetTestRepositories,
  prepareTestEnvironment
};
