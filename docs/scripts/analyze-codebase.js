#!/usr/bin/env node

/**
 * Codebase Context Analysis Script
 * 
 * Analyzes files changed, learnings, and notes to understand codebase evolution
 * Provides insights into architectural changes and development patterns
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
 * Analyze codebase context and evolution
 */
function analyzeCodebaseContext(sessions) {
  const analysis = {
    fileChanges: {
      totalFiles: 0,
      byDirectory: {},
      byExtension: {},
      mostChanged: {},
      recentChanges: []
    },
    learnings: {
      technical: [],
      architectural: [],
      tools: [],
      patterns: []
    },
    evolution: {
      majorChanges: [],
      refactoring: [],
      newFeatures: [],
      bugFixes: []
    },
    insights: {
      keyLearnings: [],
      bestPractices: [],
      antiPatterns: []
    }
  };

  sessions.forEach(session => {
    // Analyze files changed
    if (session.files_changed && session.files_changed !== 'None') {
      const files = parseFilesChanged(session.files_changed);
      analysis.fileChanges.totalFiles += files.length;
      
      files.forEach(file => {
        // Count by directory
        const dir = getDirectory(file);
        analysis.fileChanges.byDirectory[dir] = (analysis.fileChanges.byDirectory[dir] || 0) + 1;
        
        // Count by extension
        const ext = getExtension(file);
        analysis.fileChanges.byExtension[ext] = (analysis.fileChanges.byExtension[ext] || 0) + 1;
        
        // Most changed files
        analysis.fileChanges.mostChanged[file] = (analysis.fileChanges.mostChanged[file] || 0) + 1;
      });

      // Track recent changes
      analysis.fileChanges.recentChanges.push({
        sessionId: session.session_id,
        timestamp: session.timestamp,
        focus: session.focus,
        files: files
      });
    }

    // Analyze learnings
    if (session.learnings && session.learnings !== 'None') {
      const learning = {
        sessionId: session.session_id,
        focus: session.focus,
        content: session.learnings,
        category: categorizeLearning(session.learnings)
      };

      analysis.learnings[learning.category].push(learning);
    }

    // Analyze evolution patterns from achievements and notes
    if (session.achievements && session.status === 'completed') {
      const evolutionType = categorizeEvolution(session.achievements, session.notes);
      analysis.evolution[evolutionType].push({
        sessionId: session.session_id,
        focus: session.focus,
        achievement: session.achievements,
        notes: session.notes
      });
    }

    // Extract insights
    if (session.learnings) {
      const insights = extractInsights(session.learnings);
      insights.forEach(insight => {
        if (!analysis.insights.keyLearnings.some(l => l.content === insight.content)) {
          analysis.insights.keyLearnings.push(insight);
        }
      });
    }
  });

  // Sort recent changes by timestamp
  analysis.fileChanges.recentChanges.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return analysis;
}

/**
 * Parse files changed from session text
 */
function parseFilesChanged(filesText) {
  const files = [];
  const patterns = [
    /([a-zA-Z0-9_\-\/\.]+\.[a-zA-Z]+)/g, // file.ext pattern
    /src\/[a-zA-Z0-9_\-\/\.]+/g,         // src/ paths
    /tests?\/[a-zA-Z0-9_\-\/\.]+/g,      // test paths
    /docs?\/[a-zA-Z0-9_\-\/\.]+/g        // docs paths
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(filesText)) !== null) {
      const file = match[0];
      if (!files.includes(file) && file.includes('.')) {
        files.push(file);
      }
    }
  });

  return files;
}

/**
 * Get directory from file path
 */
function getDirectory(filePath) {
  const parts = filePath.split('/');
  if (parts.length === 1) return 'root';
  return parts.slice(0, -1).join('/');
}

/**
 * Get file extension
 */
function getExtension(filePath) {
  const ext = path.extname(filePath);
  return ext || 'no-extension';
}

/**
 * Categorize learning type
 */
function categorizeLearning(learning) {
  const text = learning.toLowerCase();
  
  if (text.includes('architecture') || text.includes('design') || text.includes('pattern')) {
    return 'architectural';
  }
  if (text.includes('tool') || text.includes('library') || text.includes('framework')) {
    return 'tools';
  }
  if (text.includes('approach') || text.includes('strategy') || text.includes('method')) {
    return 'patterns';
  }
  return 'technical';
}

/**
 * Categorize evolution type
 */
function categorizeEvolution(achievement, notes) {
  const text = (achievement + ' ' + notes).toLowerCase();
  
  if (text.includes('refactor') || text.includes('cleanup') || text.includes('reorganiz')) {
    return 'refactoring';
  }
  if (text.includes('new') || text.includes('implement') || text.includes('create')) {
    return 'newFeatures';
  }
  if (text.includes('fix') || text.includes('bug') || text.includes('error')) {
    return 'bugFixes';
  }
  return 'majorChanges';
}

/**
 * Extract insights from learning text
 */
function extractInsights(learning) {
  const insights = [];
  const text = learning.toLowerCase();
  
  // Look for best practices
  if (text.includes('best practice') || text.includes('better approach')) {
    insights.push({ type: 'bestPractices', content: learning });
  }
  
  // Look for anti-patterns
  if (text.includes('avoid') || text.includes('don\'t') || text.includes('wrong approach')) {
    insights.push({ type: 'antiPatterns', content: learning });
  }
  
  // Default to key learning
  if (insights.length === 0) {
    insights.push({ type: 'keyLearnings', content: learning });
  }
  
  return insights;
}

/**
 * Generate codebase context report
 */
function generateCodebaseReport(analysis) {
  const report = [];
  
  report.push('🏗️  CODEBASE CONTEXT ANALYSIS');
  report.push('='.repeat(50));
  report.push('');

  // File changes summary
  report.push('📁 FILE CHANGES OVERVIEW');
  report.push(`• Total Files Modified: ${analysis.fileChanges.totalFiles}`);
  report.push('');

  // Most active directories
  report.push('📂 MOST ACTIVE DIRECTORIES');
  const sortedDirs = Object.entries(analysis.fileChanges.byDirectory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  sortedDirs.forEach(([dir, count]) => {
    report.push(`• ${dir}: ${count} changes`);
  });
  report.push('');

  // File types
  report.push('📄 FILE TYPES MODIFIED');
  const sortedExts = Object.entries(analysis.fileChanges.byExtension)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  sortedExts.forEach(([ext, count]) => {
    report.push(`• ${ext}: ${count} files`);
  });
  report.push('');

  // Most changed files
  report.push('🔥 MOST FREQUENTLY CHANGED FILES');
  const sortedFiles = Object.entries(analysis.fileChanges.mostChanged)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  sortedFiles.forEach(([file, count]) => {
    report.push(`• ${file}: ${count} times`);
  });
  report.push('');

  // Recent technical learnings
  report.push('🧠 KEY TECHNICAL LEARNINGS');
  const recentTechnical = analysis.learnings.technical
    .slice(-5)
    .reverse();
  
  recentTechnical.forEach((learning, index) => {
    const shortContent = learning.content.length > 80 
      ? learning.content.substring(0, 80) + '...'
      : learning.content;
    report.push(`${index + 1}. ${shortContent}`);
    report.push(`   Context: ${learning.focus}`);
    report.push('');
  });

  // Architectural insights
  if (analysis.learnings.architectural.length > 0) {
    report.push('🏛️  ARCHITECTURAL INSIGHTS');
    analysis.learnings.architectural.slice(-3).reverse().forEach((learning, index) => {
      const shortContent = learning.content.length > 80 
        ? learning.content.substring(0, 80) + '...'
        : learning.content;
      report.push(`${index + 1}. ${shortContent}`);
    });
    report.push('');
  }

  // Tools and libraries
  if (analysis.learnings.tools.length > 0) {
    report.push('🛠️  TOOLS & LIBRARIES');
    analysis.learnings.tools.slice(-3).reverse().forEach((learning, index) => {
      const shortContent = learning.content.length > 80 
        ? learning.content.substring(0, 80) + '...'
        : learning.content;
      report.push(`${index + 1}. ${shortContent}`);
    });
    report.push('');
  }

  // Evolution patterns
  report.push('📈 CODEBASE EVOLUTION');
  report.push(`• New Features: ${analysis.evolution.newFeatures.length}`);
  report.push(`• Refactoring Sessions: ${analysis.evolution.refactoring.length}`);
  report.push(`• Bug Fixes: ${analysis.evolution.bugFixes.length}`);
  report.push(`• Major Changes: ${analysis.evolution.majorChanges.length}`);
  report.push('');

  // Recent major changes
  if (analysis.evolution.majorChanges.length > 0) {
    report.push('🚀 RECENT MAJOR CHANGES');
    analysis.evolution.majorChanges.slice(-3).reverse().forEach((change, index) => {
      const shortAchievement = change.achievement.length > 80 
        ? change.achievement.substring(0, 80) + '...'
        : change.achievement;
      report.push(`${index + 1}. ${shortAchievement}`);
      report.push(`   Focus: ${change.focus}`);
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
    console.log('🔍 Analyzing codebase context...\n');
    
    const sessions = parseSessionsCSV();
    if (sessions.length === 0) {
      console.log('No sessions found in SESSIONS.csv');
      process.exit(0);
    }

    const analysis = analyzeCodebaseContext(sessions);
    const report = generateCodebaseReport(analysis);
    
    console.log(report);
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'CODEBASE_ANALYSIS.md');
    const timestamp = new Date().toISOString();
    const fileContent = `# Codebase Context Analysis Report\n\nGenerated: ${timestamp}\n\n${report}`;
    
    fs.writeFileSync(reportPath, fileContent);
    console.log(`\n💾 Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  parseSessionsCSV,
  analyzeCodebaseContext,
  generateCodebaseReport
};
