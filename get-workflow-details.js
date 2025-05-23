#!/usr/bin/env node

/**
 * Get GitHub Actions Workflow Details
 * This script gets detailed information about workflow failures
 */

const { Octokit } = require('@octokit/rest');
require('dotenv').config();

async function getWorkflowDetails() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = 'harshit-codes';
  const repo = 'remcode';

  try {
    console.log('🔍 Getting detailed workflow information...\n');
    
    // Get the latest failed run
    const { data: workflowRuns } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 1,
      status: 'completed'
    });

    if (workflowRuns.workflow_runs.length === 0) {
      console.log('ℹ️  No completed workflow runs found.');
      return;
    }

    const latestRun = workflowRuns.workflow_runs[0];
    console.log(`📋 Analyzing Run #${latestRun.run_number}: ${latestRun.name}`);
    console.log(`🏷️  Status: ${latestRun.status} (${latestRun.conclusion})`);
    console.log(`🌿 Branch: ${latestRun.head_branch}`);
    console.log(`⏰ Duration: ${new Date(latestRun.updated_at).getTime() - new Date(latestRun.created_at).getTime()}ms`);
    console.log(`🔗 URL: ${latestRun.html_url}\n`);

    // Get jobs for this run
    const { data: jobs } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: latestRun.id
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

getWorkflowDetails().catch(console.error);
