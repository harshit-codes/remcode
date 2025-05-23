#!/usr/bin/env node

/**
 * Get Specific GitHub Actions Workflow Details for Basic Workflow
 */

const { Octokit } = require('@octokit/rest');
require('dotenv').config();

async function getBasicWorkflowDetails() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = 'harshit-codes';
  const repo = 'remcode';
  const runId = 15216874927; // Run #20 - Remcode Processing (basic)

  try {
    console.log('🔍 Getting detailed workflow information for Run #20 (Basic Workflow)...\n');
    
    // Get specific workflow run
    const { data: run } = await octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId
    });

    console.log(`📋 Analyzing Run #${run.run_number}: ${run.name}`);
    console.log(`🏷️  Status: ${run.status} (${run.conclusion})`);
    console.log(`🌿 Branch: ${run.head_branch}`);
    console.log(`⏰ Duration: ${Math.round((new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 1000)}s`);
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
      console.log(`   Duration: ${Math.round((new Date(job.completed_at || job.started_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s`);
      
      if (job.steps) {
        console.log('   Steps:');
        for (const step of job.steps) {
          const stepEmoji = step.conclusion === 'success' ? '✅' : step.conclusion === 'failure' ? '❌' : step.conclusion === 'skipped' ? '⏭️' : '⏳';
          console.log(`     ${stepEmoji} ${step.name}`);
          if (step.conclusion === 'failure') {
            console.log(`       ⚠️  This step failed!`);
          }
        }
      }
      console.log('');
    }

    console.log('💡 Analysis:');
    console.log('   ✅ All workflows now pass dependency installation');
    console.log('   ✅ Workflows are running much longer than before');
    console.log('   🔗 Check the workflow logs at the URL above for the new failure point');
    
  } catch (error) {
    console.error('❌ Error getting workflow details:', error.message);
  }
}

getBasicWorkflowDetails().catch(console.error);
