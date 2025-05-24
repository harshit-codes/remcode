#!/usr/bin/env node

/**
 * Trigger GitHub Actions Workflow
 * This script manually triggers the Remcode processing workflow
 */

const { Octokit } = require('@octokit/rest');
require('dotenv').config();

async function triggerWorkflow() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = 'harshit-codes';
  const repo = 'remcode';
  const workflowId = 'remcode.yml';

  try {
    console.log('🚀 Triggering GitHub Actions workflow...');
    
    await octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref: 'main',
      inputs: {
        processing_type: 'auto',
        force_full_reprocess: false
      }
    });
    
    console.log('✅ Workflow dispatch triggered successfully!');
    console.log(`📋 Workflow: ${workflowId}`);
    console.log(`🏷️  Repository: ${owner}/${repo}`);
    console.log(`🌿 Branch: main`);
    console.log(`🔧 Processing Type: auto`);
    
    console.log('\n🔗 Monitor the workflow at:');
    console.log(`   https://github.com/${owner}/${repo}/actions`);
    
  } catch (error) {
    console.error('❌ Error triggering workflow:', error.message);
    if (error.status === 404) {
      console.log('💡 Note: The workflow file might not exist or workflow_dispatch might not be enabled.');
    }
  }
}

triggerWorkflow().catch(console.error);
