#!/usr/bin/env node

/**
 * Enhanced Session Documentation Tool
 * 
 * Supports new strategy-driven framework with enhanced status options
 */

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');

// Configuration
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
const STRATEGIES_FILE = path.join(__dirname, 'strategies.json');

// Valid statuses
const VALID_STATUSES = [
  'not_planned',    // Task identified but not scheduled
  'planned',        // Scheduled but not started  
  'yet_to_start',   // Ready to begin, dependencies met
  'in_progress',    // Currently being worked on
  'completed',      // Successfully finished
  'blocked',        // Cannot proceed due to dependencies
  'cancelled'       // Deliberately abandoned
];

// Load existing data
function loadData() {
  const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
  const strategies = JSON.parse(fs.readFileSync(STRATEGIES_FILE, 'utf8'));
  return { sessions, strategies };
}

// Validate strategy exists
function validateStrategy(strategyId, strategies) {
  if (!strategies.strategies[strategyId]) {
    console.error(`❌ Invalid strategy: ${strategyId}`);
    console.log('Available strategies:');
    Object.keys(strategies.strategies).forEach(id => {
      const strategy = strategies.strategies[id];
      console.log(`  - ${id}: ${strategy.name}`);
    });
    process.exit(1);
  }
}

// Generate session ID
function generateSessionId(description) {
  const date = new Date().toISOString().split('T')[0];
  const slug = description.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  return `${date}-${slug}`;
}

// Create new session
function createSession(options) {
  const { sessions, strategies } = loadData();
  
  // Validate required fields
  if (!options.description) {
    console.error('❌ Description is required');
    process.exit(1);
  }
  
  if (!options.strategy) {
    console.error('❌ Strategy is required');
    console.log('Available strategies:');
    Object.keys(strategies.strategies).forEach(id => {
      const strategy = strategies.strategies[id];
      console.log(`  - ${id}: ${strategy.name} (${strategy.status})`);
    });
    process.exit(1);
  }
  
  // Validate strategy
  validateStrategy(options.strategy, strategies);
  
  // Validate status
  if (options.status && !VALID_STATUSES.includes(options.status)) {
    console.error(`❌ Invalid status: ${options.status}`);
    console.log('Valid statuses:', VALID_STATUSES.join(', '));
    process.exit(1);
  }
  
  // Generate session
  const sessionId = generateSessionId(options.description);
  const timestamp = new Date().toISOString();
  
  const newSession = {
    sessionId,
    timestamp,
    developer: options.developer || 'harshit-codes',
    status: options.status || 'planned',
    strategy: options.strategy,
    focus: options.focus || `Work on ${options.description}`,
    achievements: options.achievements || 'To be documented upon completion',
    blockers: options.blockers || 'None identified',
    nextSteps: options.nextSteps || 'Continue with planned tasks',
    filesChanged: options.filesChanged || 'To be documented',
    learnings: options.learnings || 'To be documented upon completion',
    notes: options.notes || '',
    estimatedDuration: parseInt(options.estimatedDuration) || null,
    actualDuration: parseInt(options.actualDuration) || null,
    dependencies: options.dependencies ? options.dependencies.split(',') : [],
    tags: options.tags ? options.tags.split(',') : [],
    priority: options.priority || determinePriorityFromStrategy(options.strategy, strategies)
  };
  
  // Add to sessions
  sessions.sessions.push(newSession);
  sessions.metadata.totalSessions = sessions.sessions.length;
  sessions.metadata.lastUpdated = timestamp;
  
  // Save
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  
  console.log('✅ Session created successfully!');
  console.log(`📝 Session ID: ${sessionId}`);
  console.log(`🎯 Strategy: ${options.strategy}`);
  console.log(`📊 Status: ${options.status || 'planned'}`);
  
  return newSession;
}

// Determine priority from strategy
function determinePriorityFromStrategy(strategyId, strategies) {
  const strategy = strategies.strategies[strategyId];
  return strategy.priority || 'medium';
}

// List sessions by strategy
function listSessionsByStrategy(strategyId) {
  const { sessions, strategies } = loadData();
  
  if (strategyId && !strategies.strategies[strategyId]) {
    console.error(`❌ Strategy not found: ${strategyId}`);
    return;
  }
  
  const filteredSessions = strategyId 
    ? sessions.sessions.filter(s => s.strategy === strategyId)
    : sessions.sessions;
    
  console.log(`📋 Sessions${strategyId ? ` for strategy: ${strategyId}` : ''}`);
  console.log('='.repeat(50));
  
  // Group by status
  const byStatus = filteredSessions.reduce((acc, session) => {
    if (!acc[session.status]) acc[session.status] = [];
    acc[session.status].push(session);
    return acc;
  }, {});
  
  VALID_STATUSES.forEach(status => {
    if (byStatus[status] && byStatus[status].length > 0) {
      console.log(`\n${status.toUpperCase()} (${byStatus[status].length}):`);
      byStatus[status].forEach(session => {
        console.log(`  - ${session.sessionId}`);
        console.log(`    Focus: ${session.focus}`);
        if (session.estimatedDuration) {
          console.log(`    Duration: ${session.estimatedDuration}min`);
        }
      });
    }
  });
}

// CLI Interface
const program = new Command();

program
  .name('session-manager')
  .description('Enhanced session management with strategy framework')
  .version('2.0.0');

program
  .command('create')
  .description('Create a new session')
  .requiredOption('-d, --description <description>', 'Session description')
  .requiredOption('-s, --strategy <strategy>', 'Strategy ID')
  .option('--status <status>', 'Session status', 'planned')
  .option('--focus <focus>', 'Session focus')
  .option('--achievements <achievements>', 'Expected achievements')
  .option('--blockers <blockers>', 'Known blockers')
  .option('--next-steps <nextSteps>', 'Next steps')
  .option('--files-changed <filesChanged>', 'Files to be changed')
  .option('--learnings <learnings>', 'Expected learnings')
  .option('--notes <notes>', 'Additional notes')
  .option('--estimated-duration <minutes>', 'Estimated duration in minutes')
  .option('--dependencies <deps>', 'Comma-separated dependencies')
  .option('--tags <tags>', 'Comma-separated tags')
  .option('--priority <priority>', 'Priority level')
  .option('--developer <developer>', 'Developer name', 'harshit-codes')
  .action(createSession);

program
  .command('list')
  .description('List sessions')
  .option('-s, --strategy <strategy>', 'Filter by strategy')
  .action((options) => listSessionsByStrategy(options.strategy));

program
  .command('strategies')
  .description('List available strategies')
  .action(() => {
    const { strategies } = loadData();
    console.log('🎯 Available Strategies:');
    console.log('='.repeat(50));
    Object.entries(strategies.strategies).forEach(([id, strategy]) => {
      console.log(`\n📋 ${id}`);
      console.log(`   Name: ${strategy.name}`);
      console.log(`   Status: ${strategy.status}`);
      console.log(`   Priority: ${strategy.priority}`);
      console.log(`   Timeline: ${strategy.timeline}`);
      if (strategy.phases) {
        console.log(`   Phases: ${strategy.phases.length}`);
      }
    });
  });

program
  .command('validate')
  .description('Validate all sessions have required strategy links')
  .action(() => {
    const { sessions } = loadData();
    console.log('🔍 Validating session-strategy links...');
    
    const missingStrategy = sessions.sessions.filter(s => !s.strategy);
    const invalidStatus = sessions.sessions.filter(s => !VALID_STATUSES.includes(s.status));
    
    if (missingStrategy.length > 0) {
      console.log(`❌ ${missingStrategy.length} sessions missing strategy:`);
      missingStrategy.forEach(s => console.log(`  - ${s.sessionId}`));
    } else {
      console.log('✅ All sessions have strategy links');
    }
    
    if (invalidStatus.length > 0) {
      console.log(`❌ ${invalidStatus.length} sessions have invalid status:`);
      invalidStatus.forEach(s => console.log(`  - ${s.sessionId}: ${s.status}`));
    } else {
      console.log('✅ All sessions have valid status');
    }
  });

// Run CLI
if (require.main === module) {
  program.parse();
}

module.exports = {
  createSession,
  listSessionsByStrategy,
  validateStrategy,
  VALID_STATUSES
};
