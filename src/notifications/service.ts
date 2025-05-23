import { getLogger } from '../utils/logger';

const logger = getLogger('NotificationService');

export interface NotificationConfig {
  slack?: {
    webhook: string;
    channel?: string;
    username?: string;
  };
  email?: {
    enabled: boolean;
    recipients: string[];
    smtpConfig?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
  };
  github?: {
    createIssue: boolean;
    assignees?: string[];
    labels?: string[];
  };
}

export interface NotificationPayload {
  type: 'success' | 'failure' | 'warning' | 'info';
  title: string;
  message: string;
  repository: string;
  runId?: number;
  url?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig = {}) {
    this.config = config;
    logger.info('NotificationService initialized', { 
      slack: !!config.slack,
      email: !!config.email,
      github: !!config.github
    });
  }

  /**
   * Send notification via all configured channels
   */
  async sendNotification(payload: NotificationPayload): Promise<{
    success: boolean;
    results: Record<string, { success: boolean; error?: string }>;
  }> {
    logger.info('Sending notification', { 
      type: payload.type, 
      title: payload.title,
      repository: payload.repository
    });

    const results: Record<string, { success: boolean; error?: string }> = {};
    let overallSuccess = true;

    // Send Slack notification
    if (this.config.slack) {
      try {
        await this.sendSlackNotification(payload);
        results.slack = { success: true };
        logger.info('Slack notification sent successfully');
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Failed to send Slack notification', error);
        results.slack = { success: false, error: errorMessage };
        overallSuccess = false;
      }
    }

    // Send email notification
    if (this.config.email?.enabled) {
      try {
        await this.sendEmailNotification(payload);
        results.email = { success: true };
        logger.info('Email notification sent successfully');
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Failed to send email notification', error);
        results.email = { success: false, error: errorMessage };
        overallSuccess = false;
      }
    }

    // Create GitHub issue for critical failures
    if (this.config.github?.createIssue && payload.type === 'failure') {
      try {
        await this.createGitHubIssue(payload);
        results.github = { success: true };
        logger.info('GitHub issue created successfully');
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Failed to create GitHub issue', error);
        results.github = { success: false, error: errorMessage };
        overallSuccess = false;
      }
    }

    return { success: overallSuccess, results };
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(payload: NotificationPayload): Promise<void> {
    if (!this.config.slack?.webhook) {
      throw new Error('Slack webhook URL not configured');
    }

    const color = this.getSlackColor(payload.type);
    const emoji = this.getSlackEmoji(payload.type);

    const slackPayload = {
      channel: this.config.slack.channel,
      username: this.config.slack.username || 'Remcode Bot',
      attachments: [
        {
          color,
          title: `${emoji} ${payload.title}`,
          text: payload.message,
          fields: [
            {
              title: 'Repository',
              value: payload.repository,
              short: true
            },
            ...(payload.runId ? [{
              title: 'Run ID',
              value: payload.runId.toString(),
              short: true
            }] : []),
            ...(payload.url ? [{
              title: 'View Details',
              value: `<${payload.url}|Open in GitHub>`,
              short: true
            }] : [])
          ],
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    const response = await fetch(this.config.slack.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload)
    });

    if (!response.ok) {
      throw new Error(`Slack API responded with status ${response.status}`);
    }
  }

  /**
   * Send email notification (placeholder implementation)
   */
  private async sendEmailNotification(payload: NotificationPayload): Promise<void> {
    // For now, this is a placeholder. In a real implementation, you would:
    // 1. Use a service like SendGrid, SES, or SMTP
    // 2. Generate HTML email templates
    // 3. Handle email delivery and retries
    
    logger.info('Email notification would be sent', {
      recipients: this.config.email?.recipients,
      subject: payload.title,
      type: payload.type
    });

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Create GitHub issue for critical failures
   */
  private async createGitHubIssue(payload: NotificationPayload): Promise<void> {
    // For now, this is a placeholder. In a real implementation, you would:
    // 1. Use GitHub API to create issues
    // 2. Include workflow logs and error details
    // 3. Assign appropriate labels and assignees
    
    logger.info('GitHub issue would be created', {
      repository: payload.repository,
      title: payload.title,
      assignees: this.config.github?.assignees,
      labels: this.config.github?.labels
    });

    // Simulate issue creation
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Get Slack color based on notification type
   */
  private getSlackColor(type: NotificationPayload['type']): string {
    switch (type) {
      case 'success': return 'good';
      case 'failure': return 'danger';
      case 'warning': return 'warning';
      case 'info': return '#36a64f';
      default: return '#36a64f';
    }
  }

  /**
   * Get Slack emoji based on notification type
   */
  private getSlackEmoji(type: NotificationPayload['type']): string {
    switch (type) {
      case 'success': return '✅';
      case 'failure': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  }

  /**
   * Create notification for workflow completion
   */
  static createWorkflowNotification(
    repository: string,
    runId: number,
    status: 'success' | 'failure',
    duration: number,
    stats?: any
  ): NotificationPayload {
    const type = status === 'success' ? 'success' : 'failure';
    const title = status === 'success' 
      ? `✅ Remcode Processing Completed`
      : `❌ Remcode Processing Failed`;

    let message = `Repository: ${repository}\n`;
    message += `Duration: ${Math.round(duration / 60)} minutes\n`;
    
    if (stats && status === 'success') {
      message += `Files processed: ${stats.totalFiles || 'N/A'}\n`;
      message += `Embeddings created: ${stats.totalEmbeddings || 'N/A'}\n`;
    }

    return {
      type,
      title,
      message,
      repository,
      runId,
      url: `https://github.com/${repository}/actions/runs/${runId}`
    };
  }

  /**
   * Create notification for workflow health issues
   */
  static createHealthNotification(
    repository: string,
    issues: string[],
    recommendations: string[]
  ): NotificationPayload {
    const title = `⚠️ Workflow Health Alert`;
    
    let message = `Repository: ${repository}\n\n`;
    message += `Issues detected:\n${issues.map(issue => `• ${issue}`).join('\n')}\n\n`;
    
    if (recommendations.length > 0) {
      message += `Recommendations:\n${recommendations.map(rec => `• ${rec}`).join('\n')}`;
    }

    return {
      type: 'warning',
      title,
      message,
      repository,
      metadata: { issues, recommendations }
    };
  }
}

/**
 * Default notification configurations for common scenarios
 */
export const defaultNotificationConfigs = {
  /**
   * Basic Slack-only configuration
   */
  slackOnly: (webhookUrl: string, channel?: string): NotificationConfig => ({
    slack: {
      webhook: webhookUrl,
      channel,
      username: 'Remcode Bot'
    }
  }),

  /**
   * Comprehensive notification configuration
   */
  comprehensive: (config: {
    slackWebhook?: string;
    emailRecipients?: string[];
    createGitHubIssues?: boolean;
  }): NotificationConfig => ({
    slack: config.slackWebhook ? {
      webhook: config.slackWebhook,
      username: 'Remcode Bot'
    } : undefined,
    email: config.emailRecipients ? {
      enabled: true,
      recipients: config.emailRecipients
    } : undefined,
    github: config.createGitHubIssues ? {
      createIssue: true,
      labels: ['remcode', 'workflow-failure', 'automated']
    } : undefined
  })
};
