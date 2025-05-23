#!/usr/bin/env node

/**
 * Get Specific GitHub Actions Workflow Details
 * This script gets detailed information about a specific workflow run
 */

const { Octokit } = require('@octokit/rest');
require('dotenv').config();

async function getSpecificWorkflowDetails() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = 'harshit-codes';
  const repo = 'remcode';
  const runId = 15216790752; // Run #15 - Remcode Advanced Processing

  try {
    console.log('🔍 Getting detailed workflow information for Run #15...\n');
    
    // Get specific workflow run
    const { data: run } = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId
    });

    console.log(`📋 Analyzing Run #${run.run_number}: ${run.name}`);
    console.log(`🏷️  Status: ${run.status} (${run.conclusion})`);
    console.log(`🌿 Branch: ${run.head_branch}`);
    console.log(`⏰ Duration: ${new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()}ms`);
    console.log(`🔗 URL: ${run.html_url}\n`);

    // Get jobs for this run
    const { data: jobs } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId
    });

    console.log('🔧 Jobs:\n');
    
    for (const job of jobs.jobs) {
      const emoji = job.conclusion === 'success' ? '✅' : job.conclusion === 'failure' ? '❌' : '❓';
      console.log(`${emoji} ${job.name}`);
      console.log(`   Status: ${job.status} (${job.conclusion || 'running'})`);
      
      if (job.steps) {
        console.log('   Steps:');
        for (const step of job.steps) {
          const stepEmoji = step.conclusion === 'success' ? '✅' : step.conclusion === 'failure' ? '❌' : '⏳';
          console.log(`     ${stepEmoji} ${step.name}`);
          if (step.conclusion === 'failure') {
            console.log(`       ⚠️  This step failed!`);
          }
        }
      }
      console.log('');
    }

    console.log('💡 Recommendation:');
    console.log('   Check the workflow logs at the URL above for detailed error messages.');
    
  } catch (error) {
    console.error('❌ Error getting workflow details:', error.message);
  }
}

getSpecificWorkflowDetails().catch(console.error);
