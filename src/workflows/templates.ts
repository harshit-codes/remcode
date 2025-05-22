import { getLogger } from '../utils/logger';

const logger = getLogger('WorkflowTemplates');

/**
 * Workflow template types
 */
export enum WorkflowType {
  REMCODE_BASIC = 'remcode_basic',
  REMCODE_SCHEDULED = 'remcode_scheduled',
  REMCODE_ADVANCED = 'remcode_advanced',
  REMCODE_WITH_CACHE = 'remcode_with_cache',
  REMCODE_WITH_NOTIFICATIONS = 'remcode_with_notifications',
  CUSTOM = 'custom'
}

/**
 * Workflow schedule configuration
 */
export interface WorkflowScheduleConfig {
  enabled: boolean;
  cron: string;
  branches?: string[];
}

/**
 * Workflow notification configuration
 */
export interface WorkflowNotificationConfig {
  slack?: {
    enabled: boolean;
    webhook?: string;
    channel?: string;
  };
  email?: {
    enabled: boolean;
    recipients?: string[];
  };
}

/**
 * Workflow environment configuration
 */
export interface WorkflowEnvironmentConfig {
  nodeVersion: string;
  useCache: boolean;
  runnerOS: 'ubuntu-latest' | 'windows-latest' | 'macos-latest';
  npmVersion?: string;
  extraPackages?: string[];
}

/**
 * Workflow template options
 */
export interface WorkflowTemplateOptions {
  repoName: string;
  branches?: string[];
  schedule?: WorkflowScheduleConfig;
  notifications?: WorkflowNotificationConfig;
  environment?: WorkflowEnvironmentConfig;
  secrets?: Record<string, string>;
  parameters?: Record<string, any>;
  version?: string;
  customTemplate?: string;
}

/**
 * Class for managing workflow templates
 */
export class WorkflowTemplates {
  private readonly defaultNodeVersion = '18';
  private readonly defaultRunnerOS = 'ubuntu-latest';
  private readonly defaultVersion = '0.2.0';
  
  /**
   * Get a workflow template based on type and options
   * @param type Workflow template type
   * @param options Template options
   * @returns Generated workflow template
   */
  getWorkflowTemplate(type: WorkflowType, options: WorkflowTemplateOptions): string {
    logger.info(`Generating workflow template of type: ${type}`);
    
    switch (type) {
      case WorkflowType.REMCODE_BASIC:
        return this.getRemcodeWorkflowTemplate(options);
      case WorkflowType.REMCODE_SCHEDULED:
        return this.getRemcodeScheduledWorkflowTemplate(options);
      case WorkflowType.REMCODE_ADVANCED:
        return this.getRemcodeAdvancedWorkflowTemplate(options);
      case WorkflowType.REMCODE_WITH_CACHE:
        return this.getRemcodeCachedWorkflowTemplate(options);
      case WorkflowType.REMCODE_WITH_NOTIFICATIONS:
        return this.getRemcodeWithNotificationsTemplate(options);
      case WorkflowType.CUSTOM:
        if (!options.customTemplate) {
          throw new Error('Custom template requires a customTemplate property in options');
        }
        return options.customTemplate;
      default:
        return this.getRemcodeWorkflowTemplate(options);
    }
  }

  /**
   * Get basic Remcode workflow template
   */
  getRemcodeWorkflowTemplate(options: WorkflowTemplateOptions): string {
    const {
      repoName,
      branches = ['main', 'master', 'develop'],
      environment = {
        nodeVersion: this.defaultNodeVersion,
        useCache: true,
        runnerOS: this.defaultRunnerOS
      },
      version = this.defaultVersion
    } = options;
    
    return `# Remcode workflow version: ${version}
# Generated: ${new Date().toISOString()}
name: Remcode Processing

on:
  push:
    branches: [ ${branches.join(', ')} ]
  workflow_dispatch:
    inputs:
      force_full_reprocess:
        description: 'Force full reprocessing'
        type: boolean
        default: false

jobs:
  process:
    runs-on: ${environment.runnerOS}
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '${environment.nodeVersion}'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Process with Remcode
      run: npx remcode@latest process
      env:
        PINECONE_API_KEY: \${{ secrets.PINECONE_API_KEY }}
        HUGGINGFACE_TOKEN: \${{ secrets.HUGGINGFACE_TOKEN }}
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        REPO_NAME: ${repoName}
`;
  }

  /**
   * Get scheduled Remcode workflow template
   */
  getRemcodeScheduledWorkflowTemplate(options: WorkflowTemplateOptions): string {
    const {
      repoName,
      branches = ['main', 'master', 'develop'],
      schedule = {
        enabled: true,
        cron: '0 0 * * 0',  // Weekly on Sunday at midnight
        branches: ['main']
      },
      environment = {
        nodeVersion: this.defaultNodeVersion,
        useCache: true,
        runnerOS: this.defaultRunnerOS
      },
      version = this.defaultVersion
    } = options;
    
    let template = `# Remcode workflow version: ${version}
# Generated: ${new Date().toISOString()}
name: Remcode Scheduled Processing

on:
  push:
    branches: [ ${branches.join(', ')} ]
`;
    
    // Add schedule if enabled
    if (schedule.enabled) {
      template += `  schedule:
    - cron: '${schedule.cron}'${schedule.branches ? `
      branches: [ ${schedule.branches.join(', ')} ]` : ''}
`;
    }
    
    template += `  workflow_dispatch:
    inputs:
      force_full_reprocess:
        description: 'Force full reprocessing'
        type: boolean
        default: false

jobs:
  process:
    runs-on: ${environment.runnerOS}
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '${environment.nodeVersion}'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Process with Remcode
      run: npx remcode@latest process
      env:
        PINECONE_API_KEY: \${{ secrets.PINECONE_API_KEY }}
        HUGGINGFACE_TOKEN: \${{ secrets.HUGGINGFACE_TOKEN }}
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        REPO_NAME: ${repoName}
`;
    
    return template;
  }

  /**
   * Get advanced Remcode workflow template with detailed steps and logs
   */
  getRemcodeAdvancedWorkflowTemplate(options: WorkflowTemplateOptions): string {
    const {
      repoName,
      branches = ['main', 'master', 'develop'],
      environment = {
        nodeVersion: this.defaultNodeVersion,
        useCache: true,
        runnerOS: this.defaultRunnerOS
      },
      version = this.defaultVersion
    } = options;
    
    return `# Remcode workflow version: ${version}
# Generated: ${new Date().toISOString()}
name: Remcode Advanced Processing

on:
  push:
    branches: [ ${branches.join(', ')} ]
  workflow_dispatch:
    inputs:
      force_full_reprocess:
        description: 'Force full reprocessing'
        type: boolean
        default: false
      debug_mode:
        description: 'Enable debug mode'
        type: boolean
        default: false
      embedding_model:
        description: 'Embedding model to use'
        type: string
        default: 'microsoft/graphcodebert-base'
        required: false

jobs:
  process:
    runs-on: ${environment.runnerOS}
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '${environment.nodeVersion}'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Analyze repository
      id: analyze
      run: npx remcode@latest analyze --output-json
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

    - name: Process with Remcode
      id: process
      run: |
        DEBUG_FLAG=""
        if [ "\${{ github.event.inputs.debug_mode }}" == "true" ]; then
          DEBUG_FLAG="--debug"
        fi

        FORCE_FLAG=""
        if [ "\${{ github.event.inputs.force_full_reprocess }}" == "true" ]; then
          FORCE_FLAG="--force"
        fi

        EMBEDDING_MODEL="\${{ github.event.inputs.embedding_model }}"
        if [ -z "$EMBEDDING_MODEL" ]; then
          EMBEDDING_MODEL="microsoft/graphcodebert-base"
        fi

        npx remcode@latest process $DEBUG_FLAG $FORCE_FLAG --embedding-model="$EMBEDDING_MODEL" --metrics
      env:
        PINECONE_API_KEY: \${{ secrets.PINECONE_API_KEY }}
        HUGGINGFACE_TOKEN: \${{ secrets.HUGGINGFACE_TOKEN }}
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        REPO_NAME: ${repoName}

    - name: Upload metrics
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: remcode-metrics
        path: .remcode-metrics.json
        retention-days: 90

    - name: Generate processing report
      if: always()
      run: npx remcode@latest report
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
  }

  /**
   * Get Remcode workflow template with caching
   */
  getRemcodeCachedWorkflowTemplate(options: WorkflowTemplateOptions): string {
    const {
      repoName,
      branches = ['main', 'master', 'develop'],
      environment = {
        nodeVersion: this.defaultNodeVersion,
        useCache: true,
        runnerOS: this.defaultRunnerOS
      },
      version = this.defaultVersion
    } = options;
    
    return `# Remcode workflow version: ${version}
# Generated: ${new Date().toISOString()}
name: Remcode Processing with Cache

on:
  push:
    branches: [ ${branches.join(', ')} ]
  workflow_dispatch:
    inputs:
      force_full_reprocess:
        description: 'Force full reprocessing'
        type: boolean
        default: false

jobs:
  prepare:
    runs-on: ${environment.runnerOS}
    outputs:
      cache_key: \${{ steps.cache_key.outputs.key }}
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Generate cache key
      id: cache_key
      run: echo "key=remcode-\${{ github.repository }}-\${{ hashFiles('**/*.{js,ts,jsx,tsx,md,json}') }}" >> $GITHUB_OUTPUT

  process:
    needs: prepare
    runs-on: ${environment.runnerOS}
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '${environment.nodeVersion}'
        cache: 'npm'

    - name: Restore cache
      uses: actions/cache@v3
      with:
        path: |
          .remcode-cache
          .remcode-temp
        key: \${{ needs.prepare.outputs.cache_key }}

    - name: Install dependencies
      run: npm ci

    - name: Process with Remcode
      run: npx remcode@latest process --cache
      env:
        PINECONE_API_KEY: \${{ secrets.PINECONE_API_KEY }}
        HUGGINGFACE_TOKEN: \${{ secrets.HUGGINGFACE_TOKEN }}
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        REPO_NAME: ${repoName}

    - name: Upload metrics
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: remcode-metrics
        path: .remcode-metrics.json
        retention-days: 90
`;
  }

  /**
   * Get Remcode workflow template with notifications
   */
  getRemcodeWithNotificationsTemplate(options: WorkflowTemplateOptions): string {
    const {
      repoName,
      branches = ['main', 'master', 'develop'],
      notifications = {
        slack: { enabled: true }
      },
      environment = {
        nodeVersion: this.defaultNodeVersion,
        useCache: true,
        runnerOS: this.defaultRunnerOS
      },
      version = this.defaultVersion
    } = options;
    
    let template = `# Remcode workflow version: ${version}
# Generated: ${new Date().toISOString()}
name: Remcode Processing with Notifications

on:
  push:
    branches: [ ${branches.join(', ')} ]
  workflow_dispatch:
    inputs:
      force_full_reprocess:
        description: 'Force full reprocessing'
        type: boolean
        default: false

jobs:
  process:
    runs-on: ${environment.runnerOS}
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '${environment.nodeVersion}'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Process with Remcode
      id: process
      run: npx remcode@latest process --metrics
      env:
        PINECONE_API_KEY: \${{ secrets.PINECONE_API_KEY }}
        HUGGINGFACE_TOKEN: \${{ secrets.HUGGINGFACE_TOKEN }}
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        REPO_NAME: ${repoName}
`;
    
    // Add Slack notification if enabled
    if (notifications.slack?.enabled) {
      template += `
    - name: Notify Slack on success
      if: success()
      uses: slackapi/slack-github-action@v1.24.0
      with:
        payload: |
          {
            "blocks": [
              {
                "type": "header",
                "text": {
                  "type": "plain_text",
                  "text": "✅ Remcode Processing Successful",
                  "emoji": true
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Repository:* ${repoName}\n*Branch:* \${{ github.ref_name }}\n*Commit:* \${{ github.sha }}\n*Workflow:* \${{ github.workflow }}"
                }
              },
              {
                "type": "actions",
                "elements": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "View Workflow",
                      "emoji": true
                    },
                    "url": "\${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}"
                  }
                ]
              }
            ]
          }
      env:
        SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}
        SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK

    - name: Notify Slack on failure
      if: failure()
      uses: slackapi/slack-github-action@v1.24.0
      with:
        payload: |
          {
            "blocks": [
              {
                "type": "header",
                "text": {
                  "type": "plain_text",
                  "text": "❌ Remcode Processing Failed",
                  "emoji": true
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Repository:* ${repoName}\n*Branch:* \${{ github.ref_name }}\n*Commit:* \${{ github.sha }}\n*Workflow:* \${{ github.workflow }}"
                }
              },
              {
                "type": "actions",
                "elements": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "View Workflow",
                      "emoji": true
                    },
                    "url": "\${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}"
                  }
                ]
              }
            ]
          }
      env:
        SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}
        SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
`;
    }
    
    // Add email notification if enabled
    if (notifications.email?.enabled) {
      template += `
    - name: Send email notification
      if: always()
      uses: dawidd6/action-send-mail@v3
      with:
        server_address: \${{ secrets.MAIL_SERVER }}
        server_port: \${{ secrets.MAIL_PORT }}
        username: \${{ secrets.MAIL_USERNAME }}
        password: \${{ secrets.MAIL_PASSWORD }}
        subject: Remcode Processing \${{ job.status }} - ${repoName}
        to: ${notifications.email.recipients?.join(', ') || '\${{ secrets.MAIL_RECIPIENT }}'}
        from: Remcode Workflows
        body: |
          Remcode Processing \${{ job.status }}
          
          Repository: ${repoName}
          Branch: \${{ github.ref_name }}
          Commit: \${{ github.sha }}
          Workflow: \${{ github.workflow }}
          
          View the workflow run: \${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}
`;
    }
    
    return template;
  }

  /**
   * Get a custom workflow template using options
   */
  getCustomWorkflowTemplate(options: WorkflowTemplateOptions): string {
    logger.info('Generating custom workflow template');
    
    if (options.customTemplate) {
      return options.customTemplate;
    }
    
    // If no custom template is provided, use the basic template
    return this.getRemcodeWorkflowTemplate(options);
  }
}
