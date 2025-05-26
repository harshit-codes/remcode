#!/usr/bin/env node

/**
 * Simple Session Report Generator
 * 
 * Generates a clean markdown report from SESSIONS.csv for CI/CD cycles
 * Replaces complex analytics with simple, readable summaries
 */

const fs = require('fs');
const path = require('path');

function generateSessionReport() {
    const csvPath = path.join(__dirname, 'SESSIONS.csv');
    
    if (!fs.existsSync(csvPath)) {
        console.error('❌ SESSIONS.csv not found');
        process.exit(1);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Parse sessions
    const sessions = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const session = {};
        headers.forEach((header, index) => {
            session[header] = values[index] || '';
        });
        return session;
    });

    // Generate report
    const report = generateMarkdownReport(sessions);
    
    // Write report
    const reportPath = path.join(__dirname, 'SESSION_SUMMARY.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`✅ Generated SESSION_SUMMARY.md with ${sessions.length} sessions`);
    
    // Generate simple metrics JSON for badges
    const metrics = {
        total_sessions: sessions.length,
        completed_sessions: sessions.filter(s => s.status === 'completed').length,
        in_progress_sessions: sessions.filter(s => s.status === 'in_progress').length,
        blocked_sessions: sessions.filter(s => s.status === 'blocked').length,
        total_hours: sessions.reduce((sum, s) => sum + (parseInt(s.duration_mins) || 0), 0) / 60,
        last_updated: new Date().toISOString()
    };
    
    fs.writeFileSync(path.join(__dirname, 'session-metrics.json'), JSON.stringify(metrics, null, 2));
    console.log(`✅ Generated session-metrics.json`);
}
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"' && (i === 0 || line[i-1] === ',')) {
            inQuotes = true;
        } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
            inQuotes = false;
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

function generateMarkdownReport(sessions) {
    const now = new Date().toISOString().split('T')[0];
    const totalHours = sessions.reduce((sum, s) => sum + (parseInt(s.duration_mins) || 0), 0) / 60;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const inProgressSessions = sessions.filter(s => s.status === 'in_progress').length;
    const blockedSessions = sessions.filter(s => s.status === 'blocked').length;
    
    // Get recent sessions (last 5)
    const recentSessions = sessions.slice(-5);
    
    // Get current blockers
    const currentBlockers = sessions
        .filter(s => s.status === 'blocked' || s.blockers !== 'None' && s.blockers !== 'None - all objectives achieved')
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
    const sessionDetails = recentSessions.map(session => `### ${session.session_id}
**Status**: ${getStatusEmoji(session.status)} ${session.status}  
**Focus**: ${session.focus}  
**Achievements**: ${session.achievements}  
**Duration**: ${session.duration_mins}min  
${session.blockers !== 'None' ? `**Blockers**: ${session.blockers}  ` : ''}
**Next Steps**: ${session.next_steps}  
`).join('\n');

    const blockersSection = currentBlockers.length > 0 ? `## 🚫 Current Blockers

${currentBlockers.map(session => `### ${session.session_id}
**Blocker**: ${session.blockers}  
**Impact**: ${session.focus}  
**Status**: ${session.status}  
`).join('\n')}` : '## ✅ No Active Blockers';

    const learningsSection = `## 💡 Recent Learnings

${sessions.slice(-3).map(session => `- **${session.session_id}**: ${session.learnings}`).join('\n')}

---
*This report is automatically generated from SESSIONS.csv during CI/CD cycles*
`;

    return report + sessionDetails + '\n\n' + blockersSection + '\n\n' + learningsSection;
}

function getStatusEmoji(status) {
    switch(status) {
        case 'completed': return '✅';
        case 'in_progress': return '🔄';
        case 'blocked': return '🚫';
        default: return '❓';
    }
}

if (require.main === module) {
    generateSessionReport();
}

module.exports = { generateSessionReport };
