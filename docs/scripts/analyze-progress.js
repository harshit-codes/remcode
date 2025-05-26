#!/usr/bin/env node

/**
 * Progress Analysis Script
 * 
 * Analyzes session progress focusing on focus areas, achievements, and next steps
 * Provides insights into development momentum and priorities
 */

const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.join(__dirname, '..', 'SESSIONS.csv');

/**
 * Parse CSV file and return session data
 * @returns {Array} Array of session objects
 */
function parseSessionsCSV() {
  if (!fs.existsSync(SESSIONS_FILE)) {
    throw new Error('SESSIONS.csv not found');
  }

  const content = fs.readFileSync(SESSIONS_FILE, 'utf8');
  const lines = content.trim().split('\n');
  
  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split(',');
  const sessions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      const session = {};
      headers.forEach((header, index) => {
        session[header] = values[index] || '';
      });
      sessions.push(session);
    } catch (error) {
      console.warn(`Warning: Failed to parse line ${i + 1}: ${error.message}`);
    }
  }

  return sessions;
}

/**
 * Parse CSV line handling quotes properly
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Analyze progress patterns and momentum
 * @param {Array} sessions - Array of session objects
 * @returns {Object} Progress analysis results
 */
function analyzeProgress(sessions) {
  const analysis = {
    summary: {
      totalSessions: sessions.length,
      totalHours: sessions.reduce((sum, s) => sum + (parseInt(s.duration_mins) || 0), 0) / 60,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      inProgressSessions: sessions.filter(s => s.status === 'in_progress').length,
      blockedSessions: sessions.filter(s => s.status === 'blocked').length
    },
    focusAreas: {},
    achievements: [],
    momentum: {
      recentFocus: [],
      upcomingPriorities: [],
      completionRate: 0
    },
    timeDistribution: {}
  };

  // Analyze focus areas
  sessions.forEach(session => {
    if (session.focus) {
      const focus = session.focus.toLowerCase();
      analysis.focusAreas[focus] = (analysis.focusAreas[focus] || 0) + 1;
    }
  });

  // Extract achievements
  sessions.forEach(session => {
    if (session.achievements && session.achievements !== 'None' && session.status === 'completed') {
      analysis.achievements.push({
        sessionId: session.session_id,
        timestamp: session.timestamp,
        focus: session.focus,
        achievements: session.achievements,
        duration: parseInt(session.duration_mins) || 0
      });
    }
  });

  // Analyze momentum (recent sessions)
  const recentSessions = sessions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  analysis.momentum.recentFocus = recentSessions.map(s => ({
    focus: s.focus,
    status: s.status,
    timestamp: s.timestamp
  }));

  // Extract next steps from recent sessions
  const nextStepsSet = new Set();
  recentSessions.forEach(session => {
    if (session.next_steps && session.next_steps !== 'None') {
      nextStepsSet.add(session.next_steps);
    }
  });
  analysis.momentum.upcomingPriorities = Array.from(nextStepsSet);

  // Calculate completion rate
  analysis.momentum.completionRate = analysis.summary.totalSessions > 0 
    ? (analysis.summary.completedSessions / analysis.summary.totalSessions) * 100 
    : 0;

  // Time distribution by focus area
  sessions.forEach(session => {
    if (session.focus) {
      const focus = session.focus;
      const duration = parseInt(session.duration_mins) || 0;
      analysis.timeDistribution[focus] = (analysis.timeDistribution[focus] || 0) + duration;
    }
  });

  return analysis;
}

/**
 * Generate progress report
 * @param {Object} analysis - Progress analysis results
 * @returns {string} Formatted progress report
 */
function generateProgressReport(analysis) {
  const report = [];
  
  report.push('📊 SESSION PROGRESS ANALYSIS');
  report.push('='.repeat(50));
  report.push('');

  // Summary section
  report.push('📈 SUMMARY METRICS');
  report.push(`• Total Sessions: ${analysis.summary.totalSessions}`);
  report.push(`• Total Time: ${analysis.summary.totalHours.toFixed(1)} hours`);
  report.push(`• Completion Rate: ${analysis.momentum.completionRate.toFixed(1)}%`);
  report.push(`• Status Distribution:`);
  report.push(`  - Completed: ${analysis.summary.completedSessions}`);
  report.push(`  - In Progress: ${analysis.summary.inProgressSessions}`);
  report.push(`  - Blocked: ${analysis.summary.blockedSessions}`);
  report.push('');

  // Recent focus
  report.push('🎯 RECENT FOCUS AREAS');
  analysis.momentum.recentFocus.forEach((item, index) => {
    const statusIcon = item.status === 'completed' ? '✅' : 
                      item.status === 'in_progress' ? '🔄' : '🚫';
    const date = item.timestamp.split('T')[0];
    report.push(`${index + 1}. ${statusIcon} ${item.focus} (${date})`);
  });
  report.push('');

  // Top achievements
  report.push('🏆 RECENT ACHIEVEMENTS');
  const recentAchievements = analysis.achievements
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  
  recentAchievements.forEach((achievement, index) => {
    const date = achievement.timestamp.split('T')[0];
    const shortAchievement = achievement.achievements.length > 80 
      ? achievement.achievements.substring(0, 80) + '...'
      : achievement.achievements;
    report.push(`${index + 1}. ${shortAchievement} (${date})`);
  });
  report.push('');

  // Next priorities
  report.push('🚀 UPCOMING PRIORITIES');
  analysis.momentum.upcomingPriorities.slice(0, 5).forEach((priority, index) => {
    const shortPriority = priority.length > 80 
      ? priority.substring(0, 80) + '...'
      : priority;
    report.push(`${index + 1}. ${shortPriority}`);
  });
  report.push('');

  // Time distribution
  report.push('⏱️  TIME DISTRIBUTION BY FOCUS');
  const sortedFocus = Object.entries(analysis.timeDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  sortedFocus.forEach(([focus, minutes]) => {
    const hours = (minutes / 60).toFixed(1);
    const shortFocus = focus.length > 40 ? focus.substring(0, 40) + '...' : focus;
    report.push(`• ${shortFocus}: ${hours}h`);
  });

  return report.join('\n');
}

/**
 * CLI interface
 */
if (require.main === module) {
  try {
    console.log('🔍 Analyzing session progress...\n');
    
    const sessions = parseSessionsCSV();
    if (sessions.length === 0) {
      console.log('No sessions found in SESSIONS.csv');
      process.exit(0);
    }

    const analysis = analyzeProgress(sessions);
    const report = generateProgressReport(analysis);
    
    console.log(report);
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'PROGRESS_ANALYSIS.md');
    const timestamp = new Date().toISOString();
    const fileContent = `# Progress Analysis Report\n\nGenerated: ${timestamp}\n\n${report}`;
    
    fs.writeFileSync(reportPath, fileContent);
    console.log(`\n💾 Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  parseSessionsCSV,
  analyzeProgress,
  generateProgressReport
};
