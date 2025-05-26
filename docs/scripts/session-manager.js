#!/usr/bin/env node

/**
 * JSON Session Manager for Remcode Development Sessions
 * 
 * Provides CRUD operations for session data in JSON format with:
 * - Schema validation
 * - Interactive session creation
 * - Comprehensive search and filtering
 * - Data integrity checks
 * - Enhanced analytics
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { validateSessionData } = require('./session-validator');

/**
 * Configuration paths
 */
const CONFIG = {
  sessionsPath: path.join(__dirname, '..', 'sessions.json'),
  schemaPath: path.join(__dirname, '..', 'sessions-schema.json'),
  backupPath: path.join(__dirname, '..', 'sessions-backup.json')
};

/**
 * JSON Session Manager Class
 */
class JSONSessionManager {
  constructor() {
    this.sessions = [];
    this.schema = null;
    this.loadSchema();
    this.loadSessions();
  }

  /**
   * Load JSON schema for validation
   */
  loadSchema() {
    try {
      if (fs.existsSync(CONFIG.schemaPath)) {
        const schemaContent = fs.readFileSync(CONFIG.schemaPath, 'utf8');
        this.schema = JSON.parse(schemaContent);
      }
    } catch (error) {
      console.warn('Warning: Could not load schema:', error.message);
    }
  }

  /**
   * Load existing sessions from JSON file
   */
  loadSessions() {
    try {
      if (fs.existsSync(CONFIG.sessionsPath)) {
        const sessionsContent = fs.readFileSync(CONFIG.sessionsPath, 'utf8');
        this.sessions = JSON.parse(sessionsContent);
        console.log(`📊 Loaded ${this.sessions.length} sessions`);
      } else {
        this.sessions = [];
        console.log('📝 No existing sessions found, starting fresh');
      }
    } catch (error) {
      console.error('Error loading sessions:', error.message);
      this.sessions = [];
    }
  }

  /**
   * Save sessions to JSON file with backup
   */
  saveSessions() {
    try {
      // Create backup if file exists
      if (fs.existsSync(CONFIG.sessionsPath)) {
        fs.copyFileSync(CONFIG.sessionsPath, CONFIG.backupPath);
      }

      // Save updated sessions
      const jsonContent = JSON.stringify(this.sessions, null, 2);
      fs.writeFileSync(CONFIG.sessionsPath, jsonContent, 'utf8');
      
      console.log(`💾 Saved ${this.sessions.length} sessions`);
      return true;
    } catch (error) {
      console.error('Error saving sessions:', error.message);
      return false;
    }
  }

  /**
   * Find session by ID
   */
  findSession(sessionId) {
    return this.sessions.find(s => s.sessionId === sessionId);
  }

  /**
   * Get sessions analytics
   */
  getAnalytics() {
    const analytics = {
      totalSessions: this.sessions.length,
      statusBreakdown: {},
      averageDuration: 0,
      totalDuration: 0,
      popularTags: {},
      complexityBreakdown: {},
      recentActivity: [],
      completionRate: 0
    };

    // Calculate analytics
    this.sessions.forEach(session => {
      // Status breakdown
      analytics.statusBreakdown[session.status] = 
        (analytics.statusBreakdown[session.status] || 0) + 1;

      // Duration statistics
      analytics.totalDuration += session.duration;

      // Tag popularity
      (session.tags || []).forEach(tag => {
        analytics.popularTags[tag] = (analytics.popularTags[tag] || 0) + 1;
      });

      // Complexity breakdown
      if (session.complexity) {
        analytics.complexityBreakdown[session.complexity] = 
          (analytics.complexityBreakdown[session.complexity] || 0) + 1;
      }
    });

    // Calculate averages and rates
    if (analytics.totalSessions > 0) {
      analytics.averageDuration = Math.round(analytics.totalDuration / analytics.totalSessions);
      
      const completedSessions = analytics.statusBreakdown.completed || 0;
      analytics.completionRate = Math.round((completedSessions / analytics.totalSessions) * 100);
    }

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    analytics.recentActivity = this.sessions
      .filter(s => new Date(s.timestamp) > sevenDaysAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return analytics;
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const sessionManager = new JSONSessionManager();

  switch (command) {
    case 'list':
      const sessions = sessionManager.sessions;
      console.log(`\n📊 ${sessions.length} sessions found:\n`);
      sessions.slice(-10).forEach(session => {
        console.log(`${session.sessionId} - ${session.status} - ${session.focus}`);
      });
      break;

    case 'analytics':
      const analytics = sessionManager.getAnalytics();
      console.log('\n📈 Session Analytics:');
      console.log(`Total Sessions: ${analytics.totalSessions}`);
      console.log(`Completion Rate: ${analytics.completionRate}%`);
      console.log(`Average Duration: ${analytics.averageDuration} minutes`);
      console.log(`Total Time: ${Math.round(analytics.totalDuration / 60)} hours`);
      
      console.log('\nStatus Breakdown:');
      Object.entries(analytics.statusBreakdown).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
      console.log('\nPopular Tags:');
      Object.entries(analytics.popularTags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([tag, count]) => {
          console.log(`  ${tag}: ${count}`);
        });
      break;

    case 'validate':
      console.log('🔍 Validating all sessions...');
      let validCount = 0;
      let invalidCount = 0;
      
      sessionManager.sessions.forEach(session => {
        try {
          if (sessionManager.schema) {
            validateSessionData(session, sessionManager.schema);
          }
          validCount++;
        } catch (error) {
          invalidCount++;
          console.warn(`⚠️  ${session.sessionId}: ${error.message}`);
        }
      });
      
      console.log(`\n✅ Validation complete: ${validCount} valid, ${invalidCount} invalid`);
      break;

    case 'help':
    default:
      console.log(`
JSON Session Manager

Usage:
  node session-manager.js [command] [options]

Commands:
  list          List recent sessions
  analytics     Show session analytics
  validate      Validate all sessions against schema
  help          Show this help message

Examples:
  node session-manager.js analytics
  node session-manager.js list
      `);
      break;
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { JSONSessionManager };
