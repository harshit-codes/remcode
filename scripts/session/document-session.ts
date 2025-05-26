#!/usr/bin/env ts-node
/**
 * All-in-one session documentation script
 * Handles template creation, session entry addition, and report generation in a single command
 * 
 * Usage:
 *   npm run session:document -- --description="feature description" --focus="what I worked on" --achievements="what I accomplished"
 */

import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { addSession } from './session-manager';
import { validateSession } from './validator';
import { SessionData } from './types';
import { execSync } from 'child_process';

// Configure command-line options
program
  .description('Document a development session with a single command')
  .option('-d, --description <description>', 'Short description for the session ID (e.g., "feature-name")')
  .option('-f, --focus <focus>', 'What you worked on in this session')
  .option('-a, --achievements <achievements>', 'What you accomplished in this session')
  .option('-b, --blockers <blockers>', 'Any blockers encountered (default: "None")', 'None')
  .option('-n, --next-steps <nextSteps>', 'What to do in the next session')
  .option('-c, --files-changed <filesChanged>', 'Files modified during the session')
  .option('-l, --learnings <learnings>', 'Key insights or lessons learned')
  .option('-t, --notes <notes>', 'Additional context or notes')
  .option('-m, --duration <duration>', 'Session duration in minutes', (val) => parseInt(val, 10), 60)
  .option('--status <status>', 'Session status (completed, in_progress, blocked)', 'completed')
  .option('--developer <developer>', 'Developer name', 'harshit-codes')
  .option('--auto-commit', 'Automatically commit the session document', false)
  .parse(process.argv);

const options = program.opts();

/**
 * Get a list of modified files from git
 * @returns Array of changed file paths
 */
function getChangedFiles(): string[] {
  try {
    const gitOutput = execSync('git diff --name-only HEAD').toString().trim();
    return gitOutput.split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.error('⚠️ Unable to detect changed files from git:', error);
    return [];
  }
}

/**
 * Generate a session ID using the current date and description
 * @param description Session description
 * @returns Formatted session ID
 */
function generateSessionId(description: string): string {
  const today = new Date().toISOString().split('T')[0];
  const sanitizedDescription = description
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${today}-${sanitizedDescription}`;
}

/**
 * Create and add a new session entry
 */
async function documentSession() {
  try {
    // Generate template and current time in ISO format
    const template: Partial<SessionData> = {
      sessionId: `${new Date().toISOString().split('T')[0]}-session-description`,
      focus: 'Brief description of what you worked on',
      achievements: 'List of accomplishments',
      nextSteps: 'What to do next session',
      learnings: 'Key insights or lessons learned',
      notes: 'Additional context or notes'
    };
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    
    // Auto-detect changed files if not specified
    const filesChanged = options.filesChanged || 
      getChangedFiles().join(', ') || 
      'None';
    
    // Generate the session ID if description is provided
    const sessionId = options.description ? 
      generateSessionId(options.description) :
      template.sessionId;

    // Create the session data
    const session: Partial<SessionData> = {
      sessionId,
      timestamp,
      developer: options.developer,
      status: options.status as 'completed' | 'in_progress' | 'blocked',
      focus: options.focus || template.focus,
      achievements: options.achievements || template.achievements,
      blockers: options.blockers,
      nextSteps: options.nextSteps || template.nextSteps,
      filesChanged,
      learnings: options.learnings || template.learnings,
      notes: options.notes || template.notes,
      duration: options.duration
    };

    // Validate the session
    console.log('🔍 Validating session data...');
    const validationResult = validateSession(session);
    
    if (!validationResult.isValid) {
      console.error('❌ Session validation failed:');
      validationResult.errors.forEach(error => {
        console.error(`   ${error}`);
      });
      process.exit(1);
    }

    // Add the session
    addSession(session);
    console.log(`✅ Session added successfully!`);
    console.log(`   Session ID: ${session.sessionId}`);

    // Generate the report
    try {
      const reportScript = path.join(__dirname, 'report-generator.ts');
      execSync(`ts-node --transpile-only ${reportScript}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('⚠️ Warning: Failed to generate report:', error);
    }

    // Automatically commit if requested
    if (options.autoCommit) {
      try {
        console.log('📝 Committing session documentation...');
        execSync('git add sessions/', { stdio: 'inherit' });
        execSync(`git commit -m "docs: Add session documentation for ${session.sessionId}"`, { stdio: 'inherit' });
        console.log('✅ Session documentation committed!');
      } catch (error) {
        console.error('❌ Failed to commit session documentation:', error);
      }
    } else {
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. git add sessions/');
      console.log('   2. git commit -m "docs: Add session documentation"');
    }

  } catch (error) {
    console.error('❌ Error documenting session:', error);
    process.exit(1);
  }
}

// Execute the main function
documentSession();
