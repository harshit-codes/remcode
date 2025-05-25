#!/usr/bin/env node

/**
 * NPM Token Setup Script for GitHub Actions
 * 
 * This script helps configure the NPM_TOKEN secret in GitHub repository
 * for automatic package publishing via GitHub Actions.
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔐 NPM Token Setup for GitHub Actions\n');

function checkGitHubCLI() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function getRepositoryInfo() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  } catch (error) {
    console.error('❌ Could not determine repository information');
  }
  return null;
}

function showInstructions() {
  const repoInfo = getRepositoryInfo();
  
  console.log('📋 **MANUAL SETUP INSTRUCTIONS**\n');
  
  console.log('1️⃣ **Get NPM Token:**');
  console.log('   • Go to https://www.npmjs.com/settings/tokens');
  console.log('   • Click "Generate New Token" → "Classic Token"');
  console.log('   • Select "Automation" for CI/CD publishing');
  console.log('   • Copy the generated token\n');
  
  console.log('2️⃣ **Add GitHub Secret:**');  if (repoInfo) {
    console.log(`   • Go to https://github.com/${repoInfo.owner}/${repoInfo.repo}/settings/secrets/actions`);
  } else {
    console.log('   • Go to your GitHub repo → Settings → Secrets and variables → Actions');
  }
  console.log('   • Click "New repository secret"');
  console.log('   • Name: NPM_TOKEN');
  console.log('   • Value: [paste your NPM token]');
  console.log('   • Click "Add secret"\n');
  
  console.log('3️⃣ **Test the Pipeline:**');
  console.log('   • Make a commit with "feat:" prefix for minor version bump');
  console.log('   • Or "fix:" prefix for patch version bump');
  console.log('   • Push to main branch to trigger auto-publishing\n');
  
  console.log('🎯 **Example Commit Messages:**');
  console.log('   • "feat: add new MCP tool" → 0.1.6 → 0.2.0');
  console.log('   • "fix: resolve API issue" → 0.1.6 → 0.1.7');
  console.log('   • "docs: update README" → 0.1.6 → 0.1.7\n');
  
  console.log('✅ **Pipeline Status Check:**');
  if (repoInfo) {
    console.log(`   • Monitor: https://github.com/${repoInfo.owner}/${repoInfo.repo}/actions`);
  } else {
    console.log('   • Check GitHub Actions tab in your repository');
  }
}

function checkNPMLogin() {
  try {
    const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
    console.log(`✅ NPM Login: ${whoami}`);
    return whoami;
  } catch (error) {
    console.log('❌ NPM Login: Not logged in');
    console.log('   Run: npm login');
    return null;
  }
}

function main() {
  console.log('🔍 **Current Status:**');
  
  // Check NPM login
  const npmUser = checkNPMLogin();
  
  // Check GitHub CLI
  const hasGHCLI = checkGitHubCLI();
  console.log(`${hasGHCLI ? '✅' : '❌'} GitHub CLI: ${hasGHCLI ? 'Available' : 'Not installed'}`);
  
  // Check repository
  const repoInfo = getRepositoryInfo();
  console.log(`${repoInfo ? '✅' : '❌'} Repository: ${repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : 'Not detected'}`);
  
  // Check if NPM_TOKEN might be configured
  if (hasGHCLI && repoInfo) {
    try {
      execSync(`gh secret list --repo ${repoInfo.owner}/${repoInfo.repo}`, { stdio: 'ignore' });
      console.log('✅ GitHub Secrets: Access verified');
    } catch (error) {
      console.log('❌ GitHub Secrets: Cannot verify (may need authentication)');
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  showInstructions();
  
  if (!npmUser) {
    console.log('⚠️  **ACTION REQUIRED:** Please run "npm login" first\n');
  }
  
  if (!hasGHCLI) {
    console.log('💡 **OPTIONAL:** Install GitHub CLI for easier secret management:');
    console.log('   • macOS: brew install gh');
    console.log('   • Windows: winget install GitHub.cli');
    console.log('   • Linux: apt install gh (or equivalent)\n');
  }
}

if (require.main === module) {
  main();
}

module.exports = { showInstructions, checkNPMLogin, getRepositoryInfo };
