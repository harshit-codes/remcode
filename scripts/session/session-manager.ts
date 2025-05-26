#!/usr/bin/env ts-node

/**
 * Session Manager - Add new sessions with validation
 * 
 * Utility to safely add new session entries to the JSON file
 */

import * as fs from 'fs';
import * as path from 'path';
import { SessionData, SessionsJSON } from './types';
import { validateSession } from './validator';

const JSON_PATH = path.join(__dirname, '../../sessions/sessions.json');

/**
 * Add a new session to the JSON file
 */
export function addSession(newSession: Partial<SessionData>): boolean {
  try {
    // 1. Validate the new session
    console.log('🔍 Validating new session...');
    const validation = validateSession(newSession);
    
    if (!validation.isValid) {
      console.error('\n❌ Session validation failed:');
      validation.errors.forEach(error => console.error(`   ${error}`));
      return false;
    }

    if (validation.warnings.length > 0) {
      console.warn('\n⚠️  Session warnings:');
      validation.warnings.forEach(warning => console.warn(`   ${warning}`));
    }

    // 2. Read existing sessions
    let existingData: SessionsJSON;
    if (fs.existsSync(JSON_PATH)) {
      existingData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
    } else {
      // Create new file structure
      existingData = {
        sessions: [],
        metadata: {
          version: '1.0.0',
          migratedFrom: 'manual',
          migratedAt: new Date().toISOString(),
          totalSessions: 0
        }
      };
    }

    // 3. Check for duplicate session ID
    const duplicateSession = existingData.sessions.find(
      session => session.sessionId === newSession.sessionId
    );
    
    if (duplicateSession) {
      console.error(`❌ Session ID already exists: ${newSession.sessionId}`);
      return false;
    }

    // 4. Add new session
    existingData.sessions.push(newSession as SessionData);
    existingData.metadata.totalSessions = existingData.sessions.length;
    existingData.metadata.migratedAt = new Date().toISOString();

    // 5. Write back to file
    fs.writeFileSync(JSON_PATH, JSON.stringify(existingData, null, 2));
    
    console.log('✅ Session added successfully!');
    console.log(`   Session ID: ${newSession.sessionId}`);
    console.log(`   Total sessions: ${existingData.sessions.length}`);
    
    return true;

  } catch (error: any) {
    console.error('❌ Failed to add session:', error.message);
    return false;
  }
}

/**
 * Generate a session template for easy copy/paste
 */
export function generateSessionTemplate(): SessionData {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timestampStr = now.toISOString(); // Full ISO timestamp

  return {
    sessionId: `${dateStr}-your-session-description`,
    timestamp: timestampStr,
    developer: 'harshit-codes',
    status: 'completed',
    focus: 'Brief description of what you worked on',
    achievements: 'List of accomplishments separated by commas',
    blockers: 'Any blockers encountered (use "None" if no blockers)',
    nextSteps: 'What to do next session',
    filesChanged: 'List of files modified (use "None" if no files)',
    learnings: 'Key insights or lessons learned',
    notes: 'Additional context or notes',
    duration: 60
  };
}

/**
 * Add a session from a JSON file
 */
export function addSessionFromFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const sessionData = JSON.parse(fileContent);
    
    return addSession(sessionData);
  } catch (error: any) {
    console.error(`❌ Error adding session from file: ${error.message}`);
    return false;
  }
}

// Run as CLI if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--template')) {
    // Output template in formatted JSON
    console.log(JSON.stringify(generateSessionTemplate(), null, 2));
  } else if (args.includes('--add-session') && args.length > 1) {
    // Get the file path (next argument after --add-session)
    const addSessionIndex = args.indexOf('--add-session');
    const filePath = args[addSessionIndex + 1];
    
    if (!filePath) {
      console.error('❌ No file path provided for --add-session');
      console.log('Usage: ts-node session-manager.ts --add-session <path-to-json-file>');
      process.exit(1);
    }
    
    const success = addSessionFromFile(filePath);
    process.exit(success ? 0 : 1);
  } else {
    console.log('Usage: ts-node session-manager.ts [--template | --add-session <path-to-json-file>]');
  }
}
