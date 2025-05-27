#!/usr/bin/env node

/**
 * Session Migration Tool - Add Strategy Framework
 * 
 * Migrates existing sessions to include strategy links and new status options
 */

const fs = require('fs');
const path = require('path');

// Read existing sessions
const sessionsPath = path.join(__dirname, 'sessions.json');
const strategiesPath = path.join(__dirname, 'strategies.json');

console.log('🔄 Migrating sessions to strategy-driven framework...');

// Load existing data
const sessionsData = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
const strategiesData = JSON.parse(fs.readFileSync(strategiesPath, 'utf8'));

// Define strategy assignment logic
function assignStrategy(session) {
  const sessionDate = new Date(session.timestamp);
  const llmOptimizationStart = new Date('2025-05-27T19:00:00Z');
  
  // Sessions after LLM optimization start get assigned to LLM strategy
  if (sessionDate >= llmOptimizationStart) {
    return 'llm-optimization-strategy';
  }
  
  // All older sessions get historic strategy
  return 'historic-strategy';
}

// Enhanced session statuses
const validStatuses = [
  'not_planned',    // Task identified but not scheduled
  'planned',        // Scheduled but not started
  'yet_to_start',   // Ready to begin, dependencies met
  'in_progress',    // Currently being worked on
  'completed',      // Successfully finished
  'blocked',        // Cannot proceed due to dependencies
  'cancelled'       // Deliberately abandoned
];

// Migrate sessions
const migratedSessions = sessionsData.sessions.map(session => {
  const strategy = assignStrategy(session);
  
  // Map old statuses to new schema
  let newStatus = session.status;
  if (newStatus === 'in_progress') {
    // Keep as is - still valid
  } else if (newStatus === 'completed') {
    // Keep as is - still valid
  } else if (newStatus === 'blocked') {
    // Keep as is - still valid
  } else {
    // Default to completed for older sessions
    newStatus = 'completed';
  }
  
  return {
    ...session,
    status: newStatus,
    strategy: strategy,
    // Add new optional fields
    estimatedDuration: session.duration || null,
    actualDuration: session.duration || null,
    dependencies: [],
    tags: extractTags(session),
    priority: determinePriority(session, strategy)
  };
});

// Extract tags from session content
function extractTags(session) {
  const tags = [];
  const content = `${session.focus} ${session.achievements} ${session.learnings}`.toLowerCase();
  
  if (content.includes('documentation') || content.includes('jsdoc')) tags.push('documentation');
  if (content.includes('testing') || content.includes('test')) tags.push('testing');
  if (content.includes('mcp') || content.includes('model context')) tags.push('mcp');
  if (content.includes('optimization') || content.includes('performance')) tags.push('optimization');
  if (content.includes('validation') || content.includes('validation')) tags.push('validation');
  if (content.includes('infrastructure') || content.includes('setup')) tags.push('infrastructure');
  if (content.includes('refactor') || content.includes('architecture')) tags.push('refactoring');
  
  return tags;
}

// Determine priority based on strategy and content
function determinePriority(session, strategy) {
  if (strategy === 'llm-optimization-strategy') {
    return 'high';
  } else if (strategy === 'historic-strategy') {
    return 'low';
  }
  return 'medium';
}

// Create new schema with metadata
const newSessionsData = {
  version: "2.0.0",
  schemaUpdated: new Date().toISOString(),
  migratedFrom: "1.0.0", 
  validStatuses: validStatuses,
  sessions: migratedSessions,
  metadata: {
    ...sessionsData.metadata,
    totalSessions: migratedSessions.length,
    strategiesCount: Object.keys(strategiesData.strategies).length,
    lastMigration: new Date().toISOString()
  }
};

// Write migrated sessions
fs.writeFileSync(sessionsPath, JSON.stringify(newSessionsData, null, 2));

console.log('✅ Session migration completed!');
console.log(`📊 Migrated ${migratedSessions.length} sessions`);
console.log(`🎯 Linked to ${Object.keys(strategiesData.strategies).length} strategies`);
console.log(`📈 Enhanced with tags, priorities, and dependencies`);

// Generate migration summary
const migrationSummary = {
  timestamp: new Date().toISOString(),
  totalSessions: migratedSessions.length,
  strategiesLinked: Object.keys(strategiesData.strategies).length,
  statusDistribution: migratedSessions.reduce((acc, session) => {
    acc[session.status] = (acc[session.status] || 0) + 1;
    return acc;
  }, {}),
  strategyDistribution: migratedSessions.reduce((acc, session) => {
    acc[session.strategy] = (acc[session.strategy] || 0) + 1;
    return acc;
  }, {}),
  newFeatures: [
    'Strategy linking for all sessions',
    'Enhanced status options (7 total)',
    'Tag extraction from content',
    'Priority assignment based on strategy',
    'Dependencies tracking framework',
    'Estimated vs actual duration tracking'
  ]
};

fs.writeFileSync(
  path.join(__dirname, 'migration-summary.json'),
  JSON.stringify(migrationSummary, null, 2)
);

console.log('📋 Migration summary saved to migration-summary.json');
