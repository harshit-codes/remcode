#!/usr/bin/env node

/**
 * Monitor GitHub Actions Workflow Status
 * This script monitors the status of running workflows
 */

const { Octokit } = require('@octokit/rest');
require('dotenv').config();

async function monitorWorkflow() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = 'harshit-codes';
  const repo = 'remcode';

  try {
    console.log('📊 Checking workflow status...\n');
    
    // Get latest workflow runs
    const { data: workflowRuns } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 5
    });

    if (workflowRuns.workflow_runs.length === 0) {
      console.log('ℹ️  No workflow runs found.');
      return;
    }

    console.log('🔄 Recent Workflow Runs:\n');
    
    for (const run of workflowRuns.workflow_runs.slice(0, 3)) {
      const status = run.status;
      const conclusion = run.conclusion;
      const emoji = getStatusEmoji(status, conclusion);
      
      console.log(`${emoji} Run #${run.run_number}`);
      console.log(`   📋 Workflow: ${run.name}`);
      console.log(`   🏷️  Status: ${status}${conclusion ? ` (${conclusion})` : ''}`);
      console.log(`   🌿 Branch: ${run.head_branch}`);
      console.log(`   ⏰ Started: ${new Date(run.created_at).toLocaleString()}`);
      console.log(`   🔗 URL: ${run.html_url}`);
      console.log('');
    }

    // Check if any are currently running
    const running = workflowRuns.workflow_runs.filter(r => r.status === 'in_progress' || r.status === 'queued');
    
    if (running.length > 0) {
      console.log('⏳ Active workflows detected! Continuing to monitor...\n');
      setTimeout(() => monitorWorkflow(), 10000); // Check again in 10 seconds
    } else {
      console.log('✅ No active workflows running.\n');
    }
    
  } catch (error) {
    console.error('❌ Error monitoring workflow:', error.message);
  }
}

function getStatusEmoji(status, conclusion) {
  if (status === 'completed') {
    if (conclusion === 'success') return '✅';
    if (conclusion === 'failure') return '❌';
    if (conclusion === 'cancelled') return '⏹️';
    return '❓';
  }
  if (status === 'in_progress') return '🔄';
  if (status === 'queued') return '⏳';
  return '❓';
}

monitorWorkflow().catch(console.error);
