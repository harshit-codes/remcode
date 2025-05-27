#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Session IDs to remove (completed ones that are now superseded)
const sessionsToRemove = [
  '2025-05-27-eliminate-installation-choice-paralysis',
  '2025-05-27-zero-local-configuration-mcp-only', 
  '2025-05-27-smart-context-aware-command-routing',
  '2025-05-27-copy-paste-mcp-configuration-blocks',
  '2025-05-27-streamlined-api-key-acquisition',
  '2025-05-27-graceful-token-degradation',
  '2025-05-27-single-page-documentation',
  '2025-05-27-auto-port-detection-management',
  '2025-05-27-testing-strategy-phase1-foundation',
  '2025-05-27-testing-strategy-phase2-coverage', 
  '2025-05-27-testing-strategy-phase3-optimization'
];

const sessionsFile = path.join(__dirname, '../sessions/sessions.json');

// Read current sessions
const sessionsData = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));

// Filter out sessions to remove
const filteredSessions = sessionsData.sessions.filter(session => 
  !sessionsToRemove.includes(session.sessionId)
);

// Update metadata
const updatedData = {
  ...sessionsData,
  sessions: filteredSessions,
  metadata: {
    ...sessionsData.metadata,
    totalSessions: filteredSessions.length,
    cleanedAt: new Date().toISOString(),
    removedSessions: sessionsToRemove.length
  }
};

// Write cleaned sessions
fs.writeFileSync(sessionsFile, JSON.stringify(updatedData, null, 2));

console.log(`✅ Cleaned sessions.json:`);
console.log(`   - Removed ${sessionsToRemove.length} obsolete sessions`);
console.log(`   - Remaining sessions: ${filteredSessions.length}`);
console.log(`   - Sessions removed: ${sessionsToRemove.join(', ')}`);
