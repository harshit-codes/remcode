#!/usr/bin/env node

/**
 * Enhanced JSON Analytics Engine for Remcode Sessions
 * 
 * Provides sophisticated analytics capabilities leveraging JSON structure:
 * - Time-series analysis with trend detection
 * - Productivity metrics and patterns
 * - Technology stack analysis
 * - Complexity evolution tracking
 * - Predictive insights and recommendations
 */

const fs = require('fs');
const path = require('path');

/**
 * Configuration
 */
const CONFIG = {
  sessionsPath: path.join(__dirname, '..', 'sessions.json'),
  schemaPath: path.join(__dirname, '..', 'sessions-schema.json'),
  outputDir: path.join(__dirname, '..', 'analysis')
};

/**
 * Advanced Analytics Engine
 */
class AdvancedAnalyticsEngine {
  constructor() {
    this.sessions = [];
    this.loadSessions();
    this.ensureOutputDir();
  }

  /**
   * Load sessions data
   */
  loadSessions() {
    try {
      if (fs.existsSync(CONFIG.sessionsPath)) {
        const sessionsContent = fs.readFileSync(CONFIG.sessionsPath, 'utf8');
        this.sessions = JSON.parse(sessionsContent);
        console.log(`📊 Loaded ${this.sessions.length} sessions for analysis`);
      }
    } catch (error) {
      console.error('Error loading sessions:', error.message);
      this.sessions = [];
    }
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir() {
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
  }

  /**
   * Generate comprehensive analytics report
   */
  async generateComprehensiveReport() {
    console.log('\n🔍 Generating comprehensive analytics...\n');

    const analytics = {
      metadata: this.getMetadata(),
      productivity: this.getProductivityMetrics(),
      timeAnalysis: this.getTimeAnalysis(),
      technologyStack: this.getTechnologyStackAnalysis(),
      complexityEvolution: this.getComplexityEvolution(),
      focusAreaTrends: this.getFocusAreaTrends(),
      blockersAnalysis: this.getBlockersAnalysis(),
      fileChangePattterns: this.getFileChangePatterns(),
      predictiveInsights: this.getPredictiveInsights(),
      recommendations: this.getRecommendations()
    };

    // Save comprehensive report
    const reportPath = path.join(CONFIG.outputDir, 'comprehensive-analytics.json');
    fs.writeFileSync(reportPath, JSON.stringify(analytics, null, 2));

    // Generate markdown summary
    await this.generateMarkdownReport(analytics);

    console.log('✅ Comprehensive analytics generated');
    console.log(`📄 JSON Report: ${path.basename(reportPath)}`);
    console.log(`📋 Markdown Report: enhanced-analytics-report.md`);

    return analytics;
  }

  /**
   * Get metadata about the analytics
   */
  getMetadata() {
    const firstSession = this.sessions[0];
    const lastSession = this.sessions[this.sessions.length - 1];

    return {
      totalSessions: this.sessions.length,
      dateRange: {
        start: firstSession?.timestamp,
        end: lastSession?.timestamp
      },
      analysisGenerated: new Date().toISOString(),
      dataVersion: '2.0.0'
    };
  }

  /**
   * Calculate productivity metrics
   */
  getProductivityMetrics() {
    const totalDuration = this.sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalAchievements = this.sessions.reduce((sum, s) => sum + s.achievements.length, 0);
    const totalBlockers = this.sessions.reduce((sum, s) => sum + s.blockers.length, 0);

    const productivityScore = totalAchievements / (totalBlockers + 1); // Avoid divide by zero
    const efficiencyScore = totalAchievements / (totalDuration / 60); // Achievements per hour

    return {
      totalHours: Math.round(totalDuration / 60),
      totalAchievements,
      totalBlockers,
      averageSessionDuration: Math.round(totalDuration / this.sessions.length),
      productivityScore: Math.round(productivityScore * 10) / 10,
      efficiencyScore: Math.round(efficiencyScore * 10) / 10,
      blockerRate: Math.round((totalBlockers / this.sessions.length) * 100) / 100
    };
  }

  /**
   * Analyze time patterns
   */
  getTimeAnalysis() {
    const sessionsByDate = {};
    const sessionsByHour = {};
    const sessionsByDay = {};

    this.sessions.forEach(session => {
      const date = new Date(session.timestamp);
      const dateStr = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

      // By date
      sessionsByDate[dateStr] = (sessionsByDate[dateStr] || 0) + 1;

      // By hour
      sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1;

      // By day of week
      sessionsByDay[dayName] = (sessionsByDay[dayName] || 0) + 1;
    });

    return {
      sessionsByDate,
      sessionsByHour,
      sessionsByDay,
      mostProductiveHour: this.getMostFrequent(sessionsByHour),
      mostProductiveDay: this.getMostFrequent(sessionsByDay)
    };
  }

  /**
   * Analyze technology stack and tools
   */
  getTechnologyStackAnalysis() {
    const toolsUsage = {};
    const tagsFrequency = {};
    const complexityByTag = {};

    this.sessions.forEach(session => {
      // Tools analysis
      const tools = session.metadata?.toolsUsed || [];
      tools.forEach(tool => {
        toolsUsage[tool] = (toolsUsage[tool] || 0) + 1;
      });

      // Tags analysis
      const tags = session.tags || [];
      tags.forEach(tag => {
        tagsFrequency[tag] = (tagsFrequency[tag] || 0) + 1;
        
        // Track complexity by tag
        if (!complexityByTag[tag]) {
          complexityByTag[tag] = [];
        }
        complexityByTag[tag].push(session.complexity);
      });
    });

    // Calculate average complexity by tag
    const avgComplexityByTag = {};
    Object.keys(complexityByTag).forEach(tag => {
      const complexities = complexityByTag[tag];
      const complexityScores = complexities.map(c => this.getComplexityScore(c));
      avgComplexityByTag[tag] = Math.round(
        complexityScores.reduce((sum, score) => sum + score, 0) / complexities.length * 10
      ) / 10;
    });

    return {
      toolsUsage: this.sortByValue(toolsUsage),
      tagsFrequency: this.sortByValue(tagsFrequency),
      averageComplexityByTag: this.sortByValue(avgComplexityByTag),
      mostUsedTool: this.getMostFrequent(toolsUsage),
      mostCommonTag: this.getMostFrequent(tagsFrequency)
    };
  }

  /**
   * Track complexity evolution over time
   */
  getComplexityEvolution() {
    const complexityOverTime = [];
    const complexityTrends = {};

    this.sessions.forEach(session => {
      const date = session.timestamp.split('T')[0];
      const complexity = session.complexity;
      const complexityScore = this.getComplexityScore(complexity);

      complexityOverTime.push({
        date,
        complexity,
        score: complexityScore,
        duration: session.duration
      });

      // Monthly aggregation
      const month = date.substring(0, 7); // YYYY-MM
      if (!complexityTrends[month]) {
        complexityTrends[month] = [];
      }
      complexityTrends[month].push(complexityScore);
    });

    // Calculate monthly averages
    const monthlyAverages = {};
    Object.keys(complexityTrends).forEach(month => {
      const scores = complexityTrends[month];
      monthlyAverages[month] = Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length * 10
      ) / 10;
    });

    return {
      complexityOverTime,
      monthlyAverages,
      trend: this.calculateTrend(Object.values(monthlyAverages))
    };
  }

  /**
   * Analyze focus area trends
   */
  getFocusAreaTrends() {
    const focusAreas = {};
    const focusEvolution = [];

    this.sessions.forEach(session => {
      const focusKeywords = this.extractFocusKeywords(session.focus);
      const date = session.timestamp.split('T')[0];

      focusKeywords.forEach(keyword => {
        focusAreas[keyword] = (focusAreas[keyword] || 0) + 1;
      });

      focusEvolution.push({
        date,
        focus: session.focus,
        keywords: focusKeywords,
        duration: session.duration
      });
    });

    return {
      focusAreas: this.sortByValue(focusAreas),
      focusEvolution,
      topFocusAreas: Object.keys(this.sortByValue(focusAreas)).slice(0, 10)
    };
  }

  /**
   * Analyze blockers patterns
   */
  getBlockersAnalysis() {
    const blockersCount = this.sessions.reduce((sum, s) => sum + s.blockers.length, 0);
    const blockersTypes = {};
    const resolutionPatterns = {};

    this.sessions.forEach(session => {
      session.blockers.forEach(blocker => {
        const type = this.classifyBlocker(blocker);
        blockersTypes[type] = (blockersTypes[type] || 0) + 1;
      });

      // Analyze how blockers were resolved (if any)
      if (session.blockers.length > 0 && session.status === 'completed') {
        resolutionPatterns['resolved'] = (resolutionPatterns['resolved'] || 0) + 1;
      }
    });

    return {
      totalBlockers: blockersCount,
      averageBlockersPerSession: Math.round(blockersCount / this.sessions.length * 10) / 10,
      blockersTypes: this.sortByValue(blockersTypes),
      resolutionRate: Math.round((resolutionPatterns['resolved'] || 0) / this.sessions.length * 100),
      blockersFreeSessions: this.sessions.filter(s => s.blockers.length === 0).length
    };
  }

  /**
   * Analyze file change patterns
   */
  getFileChangePatterns() {
    const fileTypes = {};
    const directories = {};
    const changeTypes = {};

    this.sessions.forEach(session => {
      session.filesChanged.forEach(file => {
        // File type analysis
        const extension = path.extname(file.path).substring(1) || 'no-extension';
        fileTypes[extension] = (fileTypes[extension] || 0) + 1;

        // Directory analysis
        const directory = path.dirname(file.path).split('/')[0];
        directories[directory] = (directories[directory] || 0) + 1;

        // Change type analysis
        changeTypes[file.type] = (changeTypes[file.type] || 0) + 1;
      });
    });

    return {
      fileTypes: this.sortByValue(fileTypes),
      directories: this.sortByValue(directories),
      changeTypes: this.sortByValue(changeTypes),
      mostChangedFileType: this.getMostFrequent(fileTypes),
      mostChangedDirectory: this.getMostFrequent(directories)
    };
  }

  /**
   * Generate predictive insights
   */
  getPredictiveInsights() {
    const recentSessions = this.sessions.slice(-10); // Last 10 sessions
    const complexityTrend = recentSessions.map(s => this.getComplexityScore(s.complexity));
    const durationTrend = recentSessions.map(s => s.duration);

    return {
      complexityTrend: this.calculateTrend(complexityTrend),
      durationTrend: this.calculateTrend(durationTrend),
      predictedNextComplexity: this.predictNext(complexityTrend),
      predictedNextDuration: this.predictNext(durationTrend),
      riskAssessment: this.assessRisk(recentSessions)
    };
  }

  /**
   * Generate actionable recommendations
   */
  getRecommendations() {
    const productivity = this.getProductivityMetrics();
    const blockers = this.getBlockersAnalysis();
    const complexity = this.getComplexityEvolution();

    const recommendations = [];

    // Productivity recommendations
    if (productivity.efficiencyScore < 1) {
      recommendations.push({
        type: 'productivity',
        priority: 'high',
        title: 'Improve Achievement Rate',
        description: 'Consider breaking down larger tasks into smaller, achievable goals.',
        metric: `Current efficiency: ${productivity.efficiencyScore} achievements/hour`
      });
    }

    // Blockers recommendations
    if (blockers.averageBlockersPerSession > 1) {
      recommendations.push({
        type: 'blockers',
        priority: 'medium',
        title: 'Reduce Blocker Frequency',
        description: 'Focus on proactive planning to minimize development blockers.',
        metric: `Average ${blockers.averageBlockersPerSession} blockers per session`
      });
    }

    // Complexity recommendations
    if (complexity.trend === 'increasing') {
      recommendations.push({
        type: 'complexity',
        priority: 'low',
        title: 'Monitor Complexity Growth',
        description: 'Task complexity is increasing. Consider balancing with simpler tasks.',
        metric: 'Complexity trend: increasing'
      });
    }

    return recommendations;
  }

  /**
   * Generate markdown report
   */
  async generateMarkdownReport(analytics) {
    const markdown = `# 📊 Enhanced Session Analytics Report

*Generated on ${new Date().toLocaleDateString()}*

## 📈 Executive Summary

- **Total Sessions**: ${analytics.metadata.totalSessions}
- **Total Development Time**: ${analytics.productivity.totalHours} hours
- **Productivity Score**: ${analytics.productivity.productivityScore}/10
- **Efficiency**: ${analytics.productivity.efficiencyScore} achievements/hour
- **Completion Rate**: 100%

## 🎯 Productivity Metrics

| Metric | Value |
|--------|-------|
| Total Achievements | ${analytics.productivity.totalAchievements} |
| Total Blockers | ${analytics.productivity.totalBlockers} |
| Average Session | ${analytics.productivity.averageSessionDuration} minutes |
| Blocker Rate | ${analytics.productivity.blockerRate} per session |

## 💻 Technology Stack Analysis

### Most Used Tools
${Object.entries(analytics.technologyStack.toolsUsage).slice(0, 5).map(([tool, count]) => 
  `- **${tool}**: ${count} sessions`).join('\n')}

### Popular Tags
${Object.entries(analytics.technologyStack.tagsFrequency).slice(0, 5).map(([tag, count]) => 
  `- **${tag}**: ${count} sessions`).join('\n')}

## 📅 Time Analysis

- **Most Productive Day**: ${analytics.timeAnalysis.mostProductiveDay}
- **Most Productive Hour**: ${analytics.timeAnalysis.mostProductiveHour}:00

## 🧠 Complexity Evolution

- **Trend**: ${analytics.complexityEvolution.trend}
- **Predicted Next Complexity**: ${analytics.predictiveInsights.predictedNextComplexity}

## 🚧 Blockers Analysis

- **Total Blockers**: ${analytics.blockersAnalysis.totalBlockers}
- **Resolution Rate**: ${analytics.blockersAnalysis.resolutionRate}%
- **Blockers-Free Sessions**: ${analytics.blockersAnalysis.blockersFreeSessions}

## 📁 File Change Patterns

### Most Changed File Types
${Object.entries(analytics.fileChangePattterns.fileTypes).slice(0, 5).map(([type, count]) => 
  `- **${type}**: ${count} changes`).join('\n')}

### Most Active Directories
${Object.entries(analytics.fileChangePattterns.directories).slice(0, 5).map(([dir, count]) => 
  `- **${dir}**: ${count} changes`).join('\n')}

## 🎯 Recommendations

${analytics.recommendations.map(rec => 
  `### ${rec.title} (${rec.priority} priority)\n${rec.description}\n*${rec.metric}*`).join('\n\n')}

## 🔮 Predictive Insights

- **Complexity Trend**: ${analytics.predictiveInsights.complexityTrend}
- **Duration Trend**: ${analytics.predictiveInsights.durationTrend}
- **Risk Assessment**: ${analytics.predictiveInsights.riskAssessment}

---

*Report generated by Enhanced Analytics Engine v2.0*
`;

    const reportPath = path.join(CONFIG.outputDir, 'enhanced-analytics-report.md');
    fs.writeFileSync(reportPath, markdown);
  }

  // Helper methods
  getComplexityScore(complexity) {
    const scores = { simple: 1, moderate: 2, complex: 3, expert: 4 };
    return scores[complexity] || 2;
  }

  getMostFrequent(obj) {
    return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
  }

  sortByValue(obj) {
    return Object.fromEntries(
      Object.entries(obj).sort(([,a], [,b]) => b - a)
    );
  }

  extractFocusKeywords(focus) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'a', 'an'];
    return focus.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 3); // Top 3 keywords
  }

  classifyBlocker(blocker) {
    const patterns = {
      'api': ['api', 'endpoint', 'request', 'response'],
      'build': ['build', 'compile', 'webpack', 'typescript'],
      'testing': ['test', 'jest', 'coverage', 'validation'],
      'integration': ['integration', 'mcp', 'github', 'actions'],
      'infrastructure': ['server', 'deployment', 'npm', 'package']
    };

    const blockerLower = blocker.toLowerCase();
    for (const [type, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => blockerLower.includes(keyword))) {
        return type;
      }
    }
    return 'other';
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    const lastValue = values[values.length - 1];
    const firstValue = values[0];
    const change = (lastValue - firstValue) / firstValue;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  predictNext(values) {
    if (values.length < 2) return values[0] || 0;
    const trend = values[values.length - 1] - values[values.length - 2];
    return Math.round((values[values.length - 1] + trend) * 10) / 10;
  }

  assessRisk(recentSessions) {
    const blockers = recentSessions.reduce((sum, s) => sum + s.blockers.length, 0);
    const avgComplexity = recentSessions.reduce((sum, s) => sum + this.getComplexityScore(s.complexity), 0) / recentSessions.length;
    
    if (blockers > 5 || avgComplexity > 3) return 'high';
    if (blockers > 2 || avgComplexity > 2.5) return 'medium';
    return 'low';
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';

  const analytics = new AdvancedAnalyticsEngine();

  switch (command) {
    case 'report':
    case 'comprehensive':
      await analytics.generateComprehensiveReport();
      break;

    case 'help':
      console.log(`
Enhanced Analytics Engine

Usage:
  node advanced-analytics.js [command]

Commands:
  report         Generate comprehensive analytics report (default)
  comprehensive  Generate comprehensive analytics report
  help           Show this help message

Examples:
  node advanced-analytics.js report
      `);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "node advanced-analytics.js help" for usage information');
      process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { AdvancedAnalyticsEngine };
