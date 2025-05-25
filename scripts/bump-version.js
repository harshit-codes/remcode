#!/usr/bin/env node

/**
 * Automatic Version Bumping Script
 * 
 * This script automatically bumps the package version based on commit messages:
 * - feat: minor version bump
 * - fix: patch version bump  
 * - BREAKING CHANGE: major version bump
 * - chore/docs/style: patch version bump
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function setVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  return newVersion;
}

function bumpVersion(type = 'patch') {
  const currentVersion = getCurrentVersion();
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  return setVersion(newVersion);
}

function determineVersionBump() {
  try {
    // Get the latest commit message
    const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    
    console.log('Latest commit message:', commitMessage);
    
    // Determine version bump type based on commit message
    if (commitMessage.includes('BREAKING CHANGE') || commitMessage.startsWith('!')) {
      return 'major';
    } else if (commitMessage.startsWith('feat')) {
      return 'minor';
    } else {
      return 'patch'; // fix, chore, docs, style, etc.
    }
  } catch (error) {
    console.log('Could not read git commit message, defaulting to patch');
    return 'patch';
  }
}

function main() {
  const currentVersion = getCurrentVersion();
  console.log('Current version:', currentVersion);
  
  const bumpType = process.argv[2] || determineVersionBump();
  console.log('Version bump type:', bumpType);
  
  const newVersion = bumpVersion(bumpType);
  console.log('New version:', newVersion);
  
  // Configure git for the commit
  try {
    execSync('git config --local user.email "action@github.com"');
    execSync('git config --local user.name "GitHub Action"');
  } catch (error) {
    console.log('Git config already set or not needed');
  }
  
  // Stage and commit the version bump
  try {
    execSync('git add package.json');
    execSync(`git commit -m "chore: bump version to ${newVersion}"`);
    console.log(`Version bumped and committed: ${currentVersion} → ${newVersion}`);
  } catch (error) {
    console.log('No changes to commit or git operation failed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { bumpVersion, getCurrentVersion, setVersion, determineVersionBump };
