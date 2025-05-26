#!/usr/bin/env node

/**
 * GitHub Actions JSON Integration Updater
 * 
 * Updates existing GitHub Actions workflows to support JSON format:
 * - Updates session validation workflows
 * - Enhances analytics automation
 * - Adds JSON-specific quality checks
 * - Maintains backward compatibility with CSV
 */

const fs = require('fs');
const path = require('path');

/**
 * Configuration
 */
const CONFIG = {
  workflowsDir: path.join(__dirname, '..', '..', '.github', 'workflows'),
  outputDir: path.join(__dirname, '..', 'github-actions-updates')
};

/**
 * GitHub Actions JSON Integration Updater
 */
class GitHubActionsUpdater {
  constructor() {
    this.ensureOutputDir();
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
   * Update all workflows for JSON support
   */
  async updateAllWorkflows() {
    console.log('🔧 Updating GitHub Actions workflows for JSON support...\n');

    const updates = [
      await this.createEnhancedSessionValidation(),
      await this.createJSONAnalyticsWorkflow(),
      await this.updateExistingWorkflows(),
      await this.createMigrationWorkflow()
    ];

    console.log('\n✅ All GitHub Actions workflows updated for JSON support');
    return updates;
  }

  /**
   * Create enhanced session validation workflow
   */
  async createEnhancedSessionValidation() {
    console.log('📝 Creating enhanced session validation workflow...');

    const workflow = `name: Enhanced Session Data Validation

on:
  push:
    paths:
      - 'docs/sessions.json'
      - 'docs/SESSIONS.csv'
      - 'docs/sessions-schema.json'
  pull_request:
    paths:
      - 'docs/sessions.json'
      - 'docs/SESSIONS.csv'
      - 'docs/sessions-schema.json'

jobs:
  validate-session-data:
    runs-on: ubuntu-latest
    name: Validate Session Data Quality
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'docs/package.json'
          
      - name: Install Dependencies
        run: |
          cd docs
          npm install
          
      - name: Validate JSON Schema
        run: |
          cd docs
          npm run json:validate
          
      - name: Validate CSV Format (Legacy)
        run: |
          cd docs
          npm run validate
          
      - name: Generate Analytics
        run: |
          cd docs
          npm run json:analytics
          
      - name: Check Data Consistency
        run: |
          cd docs
          node scripts/data-consistency-check.js
          
      - name: Generate Quality Report
        run: |
          cd docs
          node scripts/advanced-analytics.js report
          
      - name: Upload Analytics Reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: session-analytics-reports
          path: |
            docs/analysis/
            docs/migration.log
          retention-days: 30
          
      - name: Comment PR with Analytics
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = require('path');
            
            try {
              const analyticsPath = path.join('docs', 'analysis', 'enhanced-analytics-report.md');
              if (fs.existsSync(analyticsPath)) {
                const analytics = fs.readFileSync(analyticsPath, 'utf8');
                
                await github.rest.issues.createComment({
                  issue_number: context.issue.number,
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  body: \`## 📊 Session Analytics Update
                  
\${analytics.substring(0, 2000)}...

[View Full Report in Artifacts](\${context.payload.pull_request.html_url}/checks)
                  \`
                });
              }
            } catch (error) {
              console.log('Could not post analytics comment:', error.message);
            }
`;

    const workflowPath = path.join(CONFIG.outputDir, 'enhanced-session-validation.yml');
    fs.writeFileSync(workflowPath, workflow);

    console.log(`✅ Created: ${path.basename(workflowPath)}`);
    return workflowPath;
  }

  /**
   * Create JSON analytics automation workflow
   */
  async createJSONAnalyticsWorkflow() {
    console.log('📊 Creating JSON analytics automation workflow...');

    const workflow = `name: JSON Session Analytics Automation

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:
    inputs:
      analytics_type:
        description: 'Type of analytics to generate'
        required: false
        default: 'comprehensive'
        type: choice
        options:
          - comprehensive
          - productivity
          - trends
          - predictive

jobs:
  generate-analytics:
    runs-on: ubuntu-latest
    name: Generate JSON Session Analytics
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'docs/package.json'
          
      - name: Install Dependencies
        run: |
          cd docs
          npm install
          
      - name: Generate Comprehensive Analytics
        run: |
          cd docs
          node scripts/advanced-analytics.js report
          
      - name: Generate Productivity Insights
        run: |
          cd docs
          npm run json:analytics > analysis/productivity-summary.txt
          
      - name: Check for Anomalies
        run: |
          cd docs
          node scripts/anomaly-detection.js
          
      - name: Update README Badges
        run: |
          cd docs
          node scripts/update-readme-badges.js
          
      - name: Commit Analytics Updates
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          
          if [ -n "$(git diff --name-only)" ]; then
            git add docs/analysis/
            git add docs/README.md
            git commit -m "chore: update session analytics [automated]
            
            📊 Analytics Update:
            - Generated comprehensive analytics report
            - Updated productivity metrics
            - Checked for data anomalies
            - Updated documentation badges
            
            Generated by: JSON Session Analytics Automation"
            git push
          else
            echo "No changes to commit"
          fi
          
      - name: Create Issue for Anomalies
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Session Analytics Anomaly Detected',
              body: \`## Analytics Anomaly Alert
              
              The automated session analytics detected an anomaly in the data.
              
              **Timestamp**: \${new Date().toISOString()}
              **Workflow**: \${context.workflow}
              **Run ID**: \${context.runId}
              
              Please review the analytics reports and investigate:
              1. Check recent session entries for data quality issues
              2. Verify JSON schema compliance
              3. Review analytics logs for specific errors
              
              [View Workflow Run](\${context.payload.repository.html_url}/actions/runs/\${context.runId})
              \`,
              labels: ['analytics', 'automation', 'investigation-needed']
            });
`;

    const workflowPath = path.join(CONFIG.outputDir, 'json-analytics-automation.yml');
    fs.writeFileSync(workflowPath, workflow);

    console.log(`✅ Created: ${path.basename(workflowPath)}`);
    return workflowPath;
  }

  /**
   * Update existing workflows for JSON compatibility
   */
  async updateExistingWorkflows() {
    console.log('🔄 Updating existing workflows for JSON compatibility...');

    const updates = [];

    // Check if workflows directory exists
    if (!fs.existsSync(CONFIG.workflowsDir)) {
      console.log('ℹ️  No existing workflows directory found');
      return updates;
    }

    // Read existing workflow files
    const workflowFiles = fs.readdirSync(CONFIG.workflowsDir)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

    for (const file of workflowFiles) {
      const filePath = path.join(CONFIG.workflowsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check if workflow needs JSON updates
      if (this.needsJSONUpdate(content)) {
        const updatedContent = this.addJSONSupport(content);
        const outputPath = path.join(CONFIG.outputDir, `updated-${file}`);
        fs.writeFileSync(outputPath, updatedContent);
        updates.push(outputPath);
        console.log(`📝 Updated: ${file}`);
      }
    }

    if (updates.length === 0) {
      console.log('ℹ️  No existing workflows needed JSON updates');
    }

    return updates;
  }

  /**
   * Create migration workflow for ongoing CSV to JSON updates
   */
  async createMigrationWorkflow() {
    console.log('🔄 Creating migration monitoring workflow...');

    const workflow = `name: CSV to JSON Migration Monitor

on:
  push:
    paths:
      - 'docs/SESSIONS.csv'
  workflow_dispatch:

jobs:
  monitor-migration:
    runs-on: ubuntu-latest
    name: Monitor and Sync CSV to JSON
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'docs/package.json'
          
      - name: Install Dependencies
        run: |
          cd docs
          npm install
          
      - name: Check Migration Status
        id: migration_check
        run: |
          cd docs
          
          # Count entries in both formats
          CSV_COUNT=$(tail -n +2 SESSIONS.csv | wc -l)
          JSON_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('sessions.json')).length)")
          
          echo "csv_count=$CSV_COUNT" >> $GITHUB_OUTPUT
          echo "json_count=$JSON_COUNT" >> $GITHUB_OUTPUT
          
          if [ "$CSV_COUNT" -gt "$JSON_COUNT" ]; then
            echo "needs_migration=true" >> $GITHUB_OUTPUT
            echo "⚠️  CSV has more entries than JSON ($CSV_COUNT vs $JSON_COUNT)"
          else
            echo "needs_migration=false" >> $GITHUB_OUTPUT
            echo "✅ JSON is up to date ($JSON_COUNT entries)"
          fi
          
      - name: Run Incremental Migration
        if: steps.migration_check.outputs.needs_migration == 'true'
        run: |
          cd docs
          node scripts/incremental-migration.js
          
      - name: Validate Migrated Data
        if: steps.migration_check.outputs.needs_migration == 'true'
        run: |
          cd docs
          npm run json:validate
          
      - name: Commit Migration Updates
        if: steps.migration_check.outputs.needs_migration == 'true'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          
          if [ -n "$(git diff --name-only)" ]; then
            git add docs/sessions.json
            git add docs/migration.log
            git commit -m "chore: sync CSV to JSON migration [automated]
            
            📊 Migration Sync:
            - CSV entries: \${{ steps.migration_check.outputs.csv_count }}
            - JSON entries: \${{ steps.migration_check.outputs.json_count }}
            - Added new entries to JSON format
            - Validated data integrity
            
            Generated by: CSV to JSON Migration Monitor"
            git push
          fi
          
      - name: Generate Migration Report
        run: |
          cd docs
          echo "# Migration Status Report" > analysis/migration-status.md
          echo "" >> analysis/migration-status.md
          echo "**Date**: $(date)" >> analysis/migration-status.md
          echo "**CSV Entries**: \${{ steps.migration_check.outputs.csv_count }}" >> analysis/migration-status.md
          echo "**JSON Entries**: \${{ steps.migration_check.outputs.json_count }}" >> analysis/migration-status.md
          echo "**Migration Needed**: \${{ steps.migration_check.outputs.needs_migration }}" >> analysis/migration-status.md
          echo "" >> analysis/migration-status.md
          
          if [ -f migration.log ]; then
            echo "## Latest Migration Log" >> analysis/migration-status.md
            echo '\\\`\\\`\\\`json' >> analysis/migration-status.md
            cat migration.log >> analysis/migration-status.md
            echo '\\\`\\\`\\\`' >> analysis/migration-status.md
          fi
`;

    const workflowPath = path.join(CONFIG.outputDir, 'migration-monitor.yml');
    fs.writeFileSync(workflowPath, workflow);

    console.log(`✅ Created: ${path.basename(workflowPath)}`);
    return workflowPath;
  }

  /**
   * Check if workflow needs JSON updates
   */
  needsJSONUpdate(content) {
    const indicators = [
      'SESSIONS.csv',
      'session-tracking',
      'validate-session',
      'npm run validate',
      'docs/analysis'
    ];

    return indicators.some(indicator => content.includes(indicator));
  }

  /**
   * Add JSON support to existing workflow
   */
  addJSONSupport(content) {
    let updated = content;

    // Add JSON validation step after CSV validation
    if (updated.includes('npm run validate')) {
      updated = updated.replace(
        'npm run validate',
        `npm run validate
          
      - name: Validate JSON Schema
        run: |
          cd docs
          npm run json:validate`
      );
    }

    // Add JSON analytics generation
    if (updated.includes('session-tracking') || updated.includes('analysis')) {
      updated = updated.replace(
        /- name: Generate.*Analysis/,
        `- name: Generate Enhanced JSON Analytics
        run: |
          cd docs
          node scripts/advanced-analytics.js report
          
      - name: Generate Legacy Analysis`
      );
    }

    return updated;
  }

  /**
   * Generate summary of all updates
   */
  generateUpdateSummary() {
    console.log('\n📋 GitHub Actions JSON Integration Summary\n');

    const outputFiles = fs.readdirSync(CONFIG.outputDir);
    
    console.log('✅ Created/Updated Workflows:');
    outputFiles.forEach(file => {
      console.log(`   - ${file}`);
    });

    console.log('\n🔧 Manual Integration Steps:');
    console.log('   1. Review generated workflow files in docs/github-actions-updates/');
    console.log('   2. Copy relevant workflows to .github/workflows/');
    console.log('   3. Test workflows with sample commits');
    console.log('   4. Update any custom workflows for JSON compatibility');

    console.log('\n📊 Enhanced Capabilities:');
    console.log('   ✅ JSON Schema validation');
    console.log('   ✅ Advanced analytics automation');
    console.log('   ✅ Migration monitoring');
    console.log('   ✅ Anomaly detection');
    console.log('   ✅ Automated reporting');
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'update';

  const updater = new GitHubActionsUpdater();

  switch (command) {
    case 'update':
    case 'all':
      await updater.updateAllWorkflows();
      updater.generateUpdateSummary();
      break;

    case 'validation':
      await updater.createEnhancedSessionValidation();
      break;

    case 'analytics':
      await updater.createJSONAnalyticsWorkflow();
      break;

    case 'migration':
      await updater.createMigrationWorkflow();
      break;

    case 'help':
      console.log(`
GitHub Actions JSON Integration Updater

Usage:
  node github-actions-updater.js [command]

Commands:
  update/all     Update all workflows for JSON support (default)
  validation     Create enhanced validation workflow
  analytics      Create JSON analytics automation
  migration      Create migration monitoring workflow
  help           Show this help message

Examples:
  node github-actions-updater.js update
      `);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "node github-actions-updater.js help" for usage information');
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

module.exports = { GitHubActionsUpdater };
