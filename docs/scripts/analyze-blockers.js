#!/usr/bin/env node

/**
 * Bugs & Blockers Analysis Script
 * 
 * Analyzes blockers, technical issues, and their resolutions
 * Provides insights into common problems and solutions
 */

const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.join(__dirname, '..', 'SESSIONS.csv');

/**
 * Parse CSV file and return session data
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
 * Analyze blockers and issues
 */
function analyzeBlockers(sessions) {
  const analysis = {
    summary: {
      totalBlockers: 0,
      resolvedBlockers: 0,
      activeBlockers: 0,
      blockedSessions: 0
    },
    blockerCategories: {},
    commonIssues: {},
    resolutionPatterns: {},
    blockerHistory: [],
    testingIssues: []
  };

  sessions.forEach(session => {
    const hasBlockers = session.blockers && 
                       session.blockers !== 'None' && 
                       session.blockers !== 'None - all objectives achieved' &&
                       session.blockers !== 'None - strategy clear' &&
                       session.blockers !== 'None - complete resolution achieved';

    if (hasBlockers) {
      analysis.summary.totalBlockers++;
      
      if (session.status === 'blocked') {
        analysis.summary.blockedSessions++;
        analysis.summary.activeBlockers++;
      } else if (session.status === 'completed') {
        analysis.summary.resolvedBlockers++;
      }

      // Categorize blockers
      const blocker = session.blockers.toLowerCase();
      const category = categorizeBlocker(blocker);
      analysis.blockerCategories[category] = (analysis.blockerCategories[category] || 0) + 1;

      // Track common issues
      const issueKeywords = extractIssueKeywords(blocker);
      issueKeywords.forEach(keyword => {
        analysis.commonIssues[keyword] = (analysis.commonIssues[keyword] || 0) + 1;
      });

      // Track resolution patterns
      if (session.status === 'completed' && session.achievements) {
        const resolution = session.achievements.toLowerCase();
        const resolutionKeywords = extractResolutionKeywords(resolution);
        resolutionKeywords.forEach(keyword => {
          analysis.resolutionPatterns[keyword] = (analysis.resolutionPatterns[keyword] || 0) + 1;
        });
      }

      // Track blocker history
      analysis.blockerHistory.push({
        sessionId: session.session_id,
        timestamp: session.timestamp,
        focus: session.focus,
        blocker: session.blockers,
        status: session.status,
        resolution: session.status === 'completed' ? session.achievements : null
      });

      // Identify testing-related issues
      if (blocker.includes('test') || blocker.includes('error') || blocker.includes('fail')) {
        analysis.testingIssues.push({
          sessionId: session.session_id,
          focus: session.focus,
          issue: session.blockers,
          resolution: session.status === 'completed' ? session.achievements : 'Unresolved'
        });
      }
    }
  });

  return analysis;
}

/**
 * Categorize blocker types
 */
function categorizeBlocker(blocker) {
  const categories = {
    'api': ['api', 'endpoint', 'token', 'authentication', 'rate limit'],
    'build': ['compilation', 'typescript', 'build', 'syntax', 'lint'],
    'integration': ['mcp', 'sse', 'protocol', 'inspector', 'parameter'],
    'testing': ['test', 'validation', 'debugging', 'error handling'],
    'infrastructure': ['github actions', 'npm', 'pipeline', 'deployment'],
    'dependencies': ['library', 'package', 'version', 'compatibility'],
    'configuration': ['config', 'setup', 'environment', 'token']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => blocker.includes(keyword))) {
      return category;
    }
  }
  
  return 'other';
}

/**
 * Extract issue keywords from blocker text
 */
function extractIssueKeywords(blocker) {
  const keywords = [];
  const commonIssues = [
    'timeout', 'connection', 'permission', 'access', 'authentication',
    'compilation', 'syntax', 'error', 'bug', 'crash', 'failure',
    'api', 'endpoint', 'token', 'rate limit', 'quota',
    'dependency', 'version', 'compatibility', 'conflict',
    'test', 'validation', 'debugging', 'integration'
  ];

  commonIssues.forEach(issue => {
    if (blocker.includes(issue)) {
      keywords.push(issue);
    }
  });

  return keywords;
}

/**
 * Extract resolution keywords from achievement text
 */
function extractResolutionKeywords(resolution) {
  const keywords = [];
  const commonResolutions = [
    'fixed', 'resolved', 'implemented', 'completed', 'working',
    'upgraded', 'updated', 'refactored', 'optimized', 'enhanced',
    'configured', 'setup', 'installed', 'deployed', 'validated',
    'debugged', 'tested', 'integrated', 'automated'
  ];

  commonResolutions.forEach(res => {
    if (resolution.includes(res)) {
      keywords.push(res);
    }
  });

  return keywords;
}

/**
 * Generate blockers analysis report
 */
function generateBlockersReport(analysis) {
  const report = [];
  
  report.push('🚫 BLOCKERS & ISSUES ANALYSIS');
  report.push('='.repeat(50));
  report.push('');

  // Summary section
  report.push('📊 BLOCKERS SUMMARY');
  report.push(`• Total Blockers Encountered: ${analysis.summary.totalBlockers}`);
  report.push(`• Resolved Blockers: ${analysis.summary.resolvedBlockers}`);
  report.push(`• Active Blockers: ${analysis.summary.activeBlockers}`);
  report.push(`• Sessions Blocked: ${analysis.summary.blockedSessions}`);
  
  const resolutionRate = analysis.summary.totalBlockers > 0 
    ? ((analysis.summary.resolvedBlockers / analysis.summary.totalBlockers) * 100).toFixed(1)
    : 0;
  report.push(`• Resolution Rate: ${resolutionRate}%`);
  report.push('');

  // Blocker categories
  report.push('🏷️  BLOCKER CATEGORIES');
  const sortedCategories = Object.entries(analysis.blockerCategories)
    .sort((a, b) => b[1] - a[1]);
  
  sortedCategories.forEach(([category, count]) => {
    const percentage = ((count / analysis.summary.totalBlockers) * 100).toFixed(1);
    report.push(`• ${category}: ${count} (${percentage}%)`);
  });
  report.push('');

  // Common issues
  report.push('⚠️  MOST COMMON ISSUES');
  const sortedIssues = Object.entries(analysis.commonIssues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  sortedIssues.forEach(([issue, count]) => {
    report.push(`• ${issue}: ${count} occurrences`);
  });
  report.push('');

  // Resolution patterns
  report.push('✅ COMMON RESOLUTION PATTERNS');
  const sortedResolutions = Object.entries(analysis.resolutionPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  sortedResolutions.forEach(([resolution, count]) => {
    report.push(`• ${resolution}: ${count} times`);
  });
  report.push('');

  // Recent blockers
  report.push('🕒 RECENT BLOCKER HISTORY');
  const recentBlockers = analysis.blockerHistory
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  
  recentBlockers.forEach((blocker, index) => {
    const date = blocker.timestamp.split('T')[0];
    const statusIcon = blocker.status === 'completed' ? '✅' : 
                      blocker.status === 'in_progress' ? '🔄' : '🚫';
    const shortBlocker = blocker.blocker.length > 60 
      ? blocker.blocker.substring(0, 60) + '...'
      : blocker.blocker;
    report.push(`${index + 1}. ${statusIcon} ${shortBlocker} (${date})`);
    if (blocker.resolution) {
      const shortResolution = blocker.resolution.length > 80 
        ? blocker.resolution.substring(0, 80) + '...'
        : blocker.resolution;
      report.push(`   Resolution: ${shortResolution}`);
    }
    report.push('');
  });

  // Testing issues
  if (analysis.testingIssues.length > 0) {
    report.push('🧪 TESTING & VALIDATION ISSUES');
    analysis.testingIssues.slice(0, 5).forEach((issue, index) => {
      const shortIssue = issue.issue.length > 60 
        ? issue.issue.substring(0, 60) + '...'
        : issue.issue;
      report.push(`${index + 1}. ${shortIssue}`);
      if (issue.resolution !== 'Unresolved') {
        const shortRes = issue.resolution.length > 80 
          ? issue.resolution.substring(0, 80) + '...'
          : issue.resolution;
        report.push(`   Fix: ${shortRes}`);
      }
      report.push('');
    });
  }

  return report.join('\n');
}

/**
 * CLI interface
 */
if (require.main === module) {
  try {
    console.log('🔍 Analyzing blockers and issues...\n');
    
    const sessions = parseSessionsCSV();
    if (sessions.length === 0) {
      console.log('No sessions found in SESSIONS.csv');
      process.exit(0);
    }

    const analysis = analyzeBlockers(sessions);
    const report = generateBlockersReport(analysis);
    
    console.log(report);
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'BLOCKERS_ANALYSIS.md');
    const timestamp = new Date().toISOString();
    const fileContent = `# Blockers & Issues Analysis Report\n\nGenerated: ${timestamp}\n\n${report}`;
    
    fs.writeFileSync(reportPath, fileContent);
    console.log(`\n💾 Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  parseSessionsCSV,
  analyzeBlockers,
  generateBlockersReport
};
