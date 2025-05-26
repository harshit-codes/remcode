#!/usr/bin/env ts-node

/**
 * Session Report Generator
 * 
 * Generates a clean markdown report from sessions.json for CI/CD cycles
 * Replaces the older CSV-based script with a TypeScript implementation
 */

import * as fs from 'fs';
import * as path from 'path';
import { SessionData, SessionsJSON } from './types';

const JSON_PATH = path.join(__dirname, '../../sessions/sessions.json');
const REPORT_PATH = path.join(__dirname, '../../sessions/SESSION_SUMMARY.md');
const METRICS_PATH = path.join(__dirname, '../../sessions/session-metrics.json');

/**
 * Main report generation function
 */
export function generateSessionReport(): void {
  try {
    if (!fs.existsSync(JSON_PATH)) {
      console.error('❌ sessions.json not found');
      process.exit(1);
    }

    // Read and parse sessions
    const sessionsData: SessionsJSON = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    const sessions = sessionsData.sessions;
    
    // Generate report
    const report = generateMarkdownReport(sessions);
    
    // Write report
    fs.writeFileSync(REPORT_PATH, report);
    console.log(`✅ Generated SESSION_SUMMARY.md with ${sessions.length} sessions`);
    
    // Generate simple metrics JSON for badges
    const metrics = {
      total_sessions: sessions.length,
      completed_sessions: sessions.filter(s => s.status === 'completed').length,
      in_progress_sessions: sessions.filter(s => s.status === 'in_progress').length,
      blocked_sessions: sessions.filter(s => s.status === 'blocked').length,
      total_hours: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
      last_updated: new Date().toISOString()
    };
    
    fs.writeFileSync(METRICS_PATH, JSON.stringify(metrics, null, 2));
    console.log(`✅ Generated session-metrics.json`);
  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  }
}

/**
 * Generate markdown report from session data
 */
function generateMarkdownReport(sessions: SessionData[]): string {
  const now = new Date().toISOString().split('T')[0];
  const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const inProgressSessions = sessions.filter(s => s.status === 'in_progress').length;
  const blockedSessions = sessions.filter(s => s.status === 'blocked').length;
  
  // Get recent sessions (last 5)
  const recentSessions = sessions.slice(-5);
  
  // Get current blockers
  const currentBlockers = sessions
    .filter(s => s.status === 'blocked' || (s.blockers !== 'None' && s.blockers !== 'None - all objectives achieved'))
    .slice(-3);

  const report = `# 📊 Development Session Summary

**Generated**: ${now}  
**Total Sessions**: ${sessions.length}  
**Development Time**: ${totalHours.toFixed(1)} hours  

## 🎯 Status Overview

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Completed | ${completedSessions} | ${((completedSessions/sessions.length)*100).toFixed(1)}% |
| 🔄 In Progress | ${inProgressSessions} | ${((inProgressSessions/sessions.length)*100).toFixed(1)}% |
| 🚫 Blocked | ${blockedSessions} | ${((blockedSessions/sessions.length)*100).toFixed(1)}% |

## 📈 Recent Activity
`;
  // Add recent session details
  const sessionDetails = recentSessions.map(session => `### ${session.sessionId}
**Status**: ${getStatusEmoji(session.status)} ${session.status}  
**Focus**: ${session.focus}  
**Achievements**: ${session.achievements}  
**Duration**: ${session.duration}min  
${session.blockers !== 'None' ? `**Blockers**: ${session.blockers}  ` : ''}
**Next Steps**: ${session.nextSteps}  
`).join('\n');

  const blockersSection = currentBlockers.length > 0 ? `## 🚫 Current Blockers

${currentBlockers.map(session => `### ${session.sessionId}
**Blocker**: ${session.blockers}  
**Impact**: ${session.focus}  
**Status**: ${session.status}  
`).join('\n')}` : '## ✅ No Active Blockers';

  const learningsSection = `## 💡 Recent Learnings

${sessions.slice(-3).map(session => `- **${session.sessionId}**: ${session.learnings}`).join('\n')}

---
*This report is automatically generated from sessions.json during CI/CD cycles*
`;

  return report + sessionDetails + '\n\n' + blockersSection + '\n\n' + learningsSection;
}

/**
 * Get emoji for session status
 */
function getStatusEmoji(status: string): string {
  switch(status) {
    case 'completed': return '✅';
    case 'in_progress': return '🔄';
    case 'blocked': return '🚫';
    default: return '❓';
  }
}

// Run the generator if called directly
if (require.main === module) {
  generateSessionReport();
}
