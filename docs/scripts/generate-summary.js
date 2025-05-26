#!/usr/bin/env node

/**
 * Session Summary Generator
 * 
 * Master script to run all session analyses and generate comprehensive summary
 */

const fs = require('fs');
const path = require('path');

// Import analysis modules
const { validateExistingFile } = require('./validate-session');
const { parseSessionsCSV, analyzeProgress, generateProgressReport } = require('./analyze-progress');
const { analyzeBlockers, generateBlockersReport } = require('./analyze-blockers');
const { analyzeCodebaseContext, generateCodebaseReport } = require('./analyze-codebase');

/**
 * Generate comprehensive session summary
 */
function generateComprehensiveSummary() {
  console.log('🔍 Generating comprehensive session analysis...\n');

  try {
    const sessions = parseSessionsCSV();
    if (sessions.length === 0) {
      console.log('No sessions found in SESSIONS.csv');
      return;
    }

    console.log(`📊 Analyzing ${sessions.length} sessions...\n`);

    // Run all analyses
    const progressAnalysis = analyzeProgress(sessions);
    const blockersAnalysis = analyzeBlockers(sessions);
    const codebaseAnalysis = analyzeCodebaseContext(sessions);

    // Generate reports
    const progressReport = generateProgressReport(progressAnalysis);
    const blockersReport = generateBlockersReport(blockersAnalysis);
    const codebaseReport = generateCodebaseReport(codebaseAnalysis);

    // Create comprehensive summary
    const summary = createComprehensiveSummary(progressAnalysis, blockersAnalysis, codebaseAnalysis);

    // Save all reports
    const timestamp = new Date().toISOString();
    const reportsDir = path.join(__dirname, '..');

    fs.writeFileSync(path.join(reportsDir, 'PROGRESS_ANALYSIS.md'), 
      `# Progress Analysis Report\n\nGenerated: ${timestamp}\n\n${progressReport}`);
    
    fs.writeFileSync(path.join(reportsDir, 'BLOCKERS_ANALYSIS.md'), 
      `# Blockers & Issues Analysis Report\n\nGenerated: ${timestamp}\n\n${blockersReport}`);
    
    fs.writeFileSync(path.join(reportsDir, 'CODEBASE_ANALYSIS.md'), 
      `# Codebase Context Analysis Report\n\nGenerated: ${timestamp}\n\n${codebaseReport}`);

    fs.writeFileSync(path.join(reportsDir, 'COMPREHENSIVE_SUMMARY.md'), 
      `# Comprehensive Session Summary\n\nGenerated: ${timestamp}\n\n${summary}`);

    console.log('✅ Analysis complete! Generated files:');
    console.log('   📈 PROGRESS_ANALYSIS.md');
    console.log('   🚫 BLOCKERS_ANALYSIS.md');
    console.log('   🏗️  CODEBASE_ANALYSIS.md');
    console.log('   📋 COMPREHENSIVE_SUMMARY.md');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Create executive summary combining all analyses
 */
function createComprehensiveSummary(progressAnalysis, blockersAnalysis, codebaseAnalysis) {
  const summary = [];
  
  summary.push('# 🎯 EXECUTIVE SUMMARY');
  summary.push('');
  
  // High-level metrics
  summary.push('## 📊 Key Metrics');
  summary.push(`• **Total Sessions**: ${progressAnalysis.summary.totalSessions}`);
  summary.push(`• **Total Development Time**: ${progressAnalysis.summary.totalHours.toFixed(1)} hours`);
  summary.push(`• **Completion Rate**: ${progressAnalysis.momentum.completionRate.toFixed(1)}%`);
  summary.push(`• **Files Modified**: ${codebaseAnalysis.fileChanges.totalFiles}`);
  
  const resolutionRate = blockersAnalysis.summary.totalBlockers > 0 
    ? ((blockersAnalysis.summary.resolvedBlockers / blockersAnalysis.summary.totalBlockers) * 100).toFixed(1)
    : 100;
  summary.push(`• **Issue Resolution Rate**: ${resolutionRate}%`);
  summary.push('');

  // Current status
  summary.push('## 🚀 Current Status');
  if (progressAnalysis.momentum.recentFocus.length > 0) {
    const latestSession = progressAnalysis.momentum.recentFocus[0];
    summary.push(`• **Latest Focus**: ${latestSession.focus}`);
    summary.push(`• **Status**: ${latestSession.status === 'completed' ? '✅ Completed' : latestSession.status === 'in_progress' ? '🔄 In Progress' : '🚫 Blocked'}`);
  }
  
  if (blockersAnalysis.summary.activeBlockers > 0) {
    summary.push(`• **Active Blockers**: ${blockersAnalysis.summary.activeBlockers} issues need attention`);
  } else {
    summary.push('• **Active Blockers**: 🎉 No active blockers!');
  }
  summary.push('');

  // Top priorities
  summary.push('## 🎯 Next Priorities');
  progressAnalysis.momentum.upcomingPriorities.slice(0, 3).forEach((priority, index) => {
    const shortPriority = priority.length > 100 ? priority.substring(0, 100) + '...' : priority;
    summary.push(`${index + 1}. ${shortPriority}`);
  });
  summary.push('');

  // Key achievements
  summary.push('## 🏆 Recent Achievements');
  const recentAchievements = progressAnalysis.achievements
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);
  
  recentAchievements.forEach((achievement, index) => {
    const shortAchievement = achievement.achievements.length > 100 
      ? achievement.achievements.substring(0, 100) + '...'
      : achievement.achievements;
    summary.push(`${index + 1}. ${shortAchievement}`);
  });
  summary.push('');

  // Technical insights
  summary.push('## 🧠 Key Technical Insights');
  const technicalLearnings = codebaseAnalysis.learnings.technical.slice(-3).reverse();
  technicalLearnings.forEach((learning, index) => {
    const shortContent = learning.content.length > 100 
      ? learning.content.substring(0, 100) + '...'
      : learning.content;
    summary.push(`${index + 1}. ${shortContent}`);
  });
  summary.push('');

  // Most active areas
  summary.push('## 📁 Most Active Code Areas');
  const sortedDirs = Object.entries(codebaseAnalysis.fileChanges.byDirectory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  sortedDirs.forEach(([dir, count]) => {
    summary.push(`• **${dir}**: ${count} changes`);
  });
  summary.push('');

  return summary.join('\n');
}

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'validate':
      console.log('🔍 Validating SESSIONS.csv...\n');
      const validation = validateExistingFile();
      if (validation.success) {
        console.log('✅ CSV validation passed!');
        console.log(`📊 Total entries: ${validation.totalEntries}`);
        if (validation.totalWarnings > 0) {
          console.log(`⚠️  Warnings: ${validation.totalWarnings}`);
        }
      } else {
        console.log('❌ CSV validation failed!');
        console.log(`Error: ${validation.error}`);
        process.exit(1);
      }
      break;

    case 'progress':
      try {
        const sessions = parseSessionsCSV();
        const analysis = analyzeProgress(sessions);
        const report = generateProgressReport(analysis);
        console.log(report);
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'blockers':
      try {
        const sessions = parseSessionsCSV();
        const analysis = analyzeBlockers(sessions);
        const report = generateBlockersReport(analysis);
        console.log(report);
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'codebase':
      try {
        const sessions = parseSessionsCSV();
        const analysis = analyzeCodebaseContext(sessions);
        const report = generateCodebaseReport(analysis);
        console.log(report);
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'all':
    default:
      generateComprehensiveSummary();
      break;
  }
}

module.exports = {
  generateComprehensiveSummary,
  createComprehensiveSummary
};
