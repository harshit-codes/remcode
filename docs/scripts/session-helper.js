#!/usr/bin/env node

/**
 * Session Helper Utility
 * 
 * Easy-to-use utility for adding and managing session entries
 */

const fs = require('fs');
const path = require('path');
const { addSession, validateEntry } = require('./validate-session');

/**
 * Generate session ID from focus and date
 */
function generateSessionId(focus, date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const focusSlug = focus.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  return `${dateStr}-${focusSlug}`;
}

/**
 * Generate ISO timestamp
 */
function generateTimestamp(date = new Date()) {
  return date.toISOString();
}

/**
 * Quick session entry for common scenarios
 */
function quickSession(options) {
  const {
    focus,
    achievements,
    blockers = 'None',
    nextSteps,
    filesChanged = '',
    learnings = '',
    notes = '',
    duration = 60,
    status = 'completed',
    developer = 'harshit-codes'
  } = options;

  if (!focus || !achievements || !nextSteps) {
    throw new Error('Required fields: focus, achievements, nextSteps');
  }

  const session = {
    session_id: generateSessionId(focus),
    timestamp: generateTimestamp(),
    developer,
    status,
    focus,
    achievements,
    blockers,
    next_steps: nextSteps,
    files_changed: filesChanged,
    learnings,
    notes,
    duration_mins: duration
  };

  return addSession(session);
}

/**
 * Interactive session builder
 */
async function interactiveSession() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (question) => new Promise(resolve => rl.question(question, resolve));

  try {
    console.log('📝 Interactive Session Entry\n');
    
    const focus = await ask('🎯 What was your main focus? ');
    const achievements = await ask('🏆 What did you achieve? ');
    const blockers = await ask('🚫 Any blockers? (or press Enter for None) ') || 'None';
    const nextSteps = await ask('🚀 What are the next steps? ');
    const filesChanged = await ask('📁 Files changed? (optional) ') || '';
    const learnings = await ask('🧠 Key learnings? (optional) ') || '';
    const notes = await ask('📝 Additional notes? (optional) ') || '';
    const duration = parseInt(await ask('⏱️  Duration in minutes? (default 60) ') || '60');
    const status = await ask('📊 Status? (completed/in_progress/blocked, default: completed) ') || 'completed';

    const result = quickSession({
      focus,
      achievements,
      blockers,
      nextSteps,
      filesChanged,
      learnings,
      notes,
      duration,
      status
    });

    if (result.success) {
      console.log('\n✅ Session added successfully!');
      if (result.warnings?.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(w => console.log(`  - ${w}`));
      }
    } else {
      console.log('\n❌ Failed to add session:');
      result.errors?.forEach(e => console.log(`  - ${e}`));
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    rl.close();
  }
}

/**
 * Update current session progress (for long sessions)
 */
function updateCurrentSession(sessionId, updates) {
  // For now, add as new entry with progress update
  // TODO: Implement in-place updates
  const progressSession = {
    session_id: `${sessionId}-progress`,
    timestamp: generateTimestamp(),
    developer: 'harshit-codes',
    status: 'in_progress',
    focus: `Progress Update: ${updates.focus || 'Continuing work'}`,
    achievements: updates.achievements || 'Work in progress',
    blockers: updates.blockers || 'None',
    next_steps: updates.nextSteps || 'Continue current work',
    files_changed: updates.filesChanged || '',
    learnings: updates.learnings || '',
    notes: updates.notes || 'Progress checkpoint',
    duration_mins: updates.duration || 30
  };

  return addSession(progressSession);
}

/**
 * Common session templates
 */
const templates = {
  bugfix: (description, files) => ({
    focus: `Bug Fix: ${description}`,
    achievements: `Fixed ${description}`,
    nextSteps: 'Test fix and monitor for related issues',
    filesChanged: files,
    learnings: 'Bug fix approach and prevention strategies',
    duration: 45
  }),

  feature: (featureName, implementation) => ({
    focus: `Feature Implementation: ${featureName}`,
    achievements: implementation,
    nextSteps: 'Test new feature and update documentation',
    learnings: 'Feature development patterns and best practices',
    duration: 90
  }),

  refactor: (area, improvements) => ({
    focus: `Code Refactoring: ${area}`,
    achievements: improvements,
    nextSteps: 'Validate refactoring with tests and code review',
    learnings: 'Refactoring strategies and code quality improvements',
    duration: 75
  }),

  research: (topic, findings) => ({
    focus: `Research: ${topic}`,
    achievements: findings,
    nextSteps: 'Apply research findings to implementation',
    learnings: `Research insights on ${topic}`,
    duration: 60
  }),

  testing: (scope, results) => ({
    focus: `Testing: ${scope}`,
    achievements: results,
    nextSteps: 'Address test findings and improve coverage',
    learnings: 'Testing strategies and quality assurance practices',
    duration: 45
  })
};

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'interactive':
    case 'add':
      interactiveSession();
      break;

    case 'quick':
      if (args.length < 4) {
        console.log('Usage: node session-helper.js quick "focus" "achievements" "next_steps" [duration]');
        process.exit(1);
      }
      
      try {
        const result = quickSession({
          focus: args[1],
          achievements: args[2],
          nextSteps: args[3],
          duration: parseInt(args[4]) || 60
        });

        if (result.success) {
          console.log('✅ Session added successfully!');
        } else {
          console.log('❌ Failed to add session:');
          result.errors?.forEach(e => console.log(`  - ${e}`));
        }
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'template':
      const templateName = args[1];
      if (!templates[templateName]) {
        console.log('Available templates:');
        Object.keys(templates).forEach(t => console.log(`  - ${t}`));
        process.exit(1);
      }

      console.log(`Template: ${templateName}`);
      console.log('Required parameters depend on template type.');
      console.log('Use interactive mode for guided template usage.');
      break;

    case 'progress':
      if (args.length < 3) {
        console.log('Usage: node session-helper.js progress "session-id" "achievements"');
        process.exit(1);
      }

      try {
        const result = updateCurrentSession(args[1], {
          achievements: args[2],
          duration: parseInt(args[3]) || 30
        });

        if (result.success) {
          console.log('✅ Progress update added!');
        } else {
          console.log('❌ Failed to add progress update:');
          result.errors?.forEach(e => console.log(`  - ${e}`));
        }
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
      break;

    default:
      console.log('Session Helper Utility\n');
      console.log('Usage:');
      console.log('  node session-helper.js interactive     # Interactive session entry');
      console.log('  node session-helper.js quick "..." "..." "..."  # Quick entry');
      console.log('  node session-helper.js template [name] # Show available templates');
      console.log('  node session-helper.js progress "id" "achievements"  # Progress update');
      console.log('\nTemplates available:', Object.keys(templates).join(', '));
  }
}

module.exports = {
  quickSession,
  interactiveSession,
  updateCurrentSession,
  generateSessionId,
  generateTimestamp,
  templates
};
