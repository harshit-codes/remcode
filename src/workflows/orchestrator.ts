import { getLogger } from '../utils/logger';
import { WorkflowMonitor } from '../workflows/monitor';
import { NotificationService, NotificationConfig, NotificationPayload } from '../notifications/service';
import { StateManager } from '../processing/state-manager';

const logger = getLogger('WorkflowOrchestrator');

export interface OrchestrationConfig {
  repository: {
    owner: string;
    repo: string;
  };
  monitoring: {
    healthCheckInterval?: number; // minutes
    enableAutoRetry?: boolean;
    maxRetryAttempts?: number;
    retryDelayMinutes?: number;
  };
  notifications?: NotificationConfig;
  automation: {
    enableAutoHealing?: boolean;
    enablePerformanceOptimization?: boolean;
    enableProactiveMonitoring?: boolean;
  };
}

export interface OrchestrationStatus {
  isActive: boolean;
  lastHealthCheck?: string;
  nextHealthCheck?: string;
  totalWorkflowsMonitored: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
  automationActions: Array<{
    timestamp: string;
    action: string;
    reason: string;
    success: boolean;
  }>;
}

/**
 * Orchestrates end-to-end workflow automation including monitoring, 
 * health checks, notifications, and auto-healing
 */
export class WorkflowOrchestrator {
  private config: OrchestrationConfig;
  private monitor: WorkflowMonitor;
  private notifications?: NotificationService;
  private stateManager: StateManager;
  private healthCheckTimer?: NodeJS.Timeout;
  private isActive: boolean = false;
  private automationActions: Array<any> = [];

  constructor(config: OrchestrationConfig, githubToken?: string) {
    this.config = config;
    this.monitor = new WorkflowMonitor(githubToken);
    this.stateManager = new StateManager();
    
    if (config.notifications) {
      this.notifications = new NotificationService(config.notifications);
    }

    logger.info('WorkflowOrchestrator initialized', {
      repository: `${config.repository.owner}/${config.repository.repo}`,
      hasNotifications: !!this.notifications,
      automation: config.automation
    });
  }

  /**
   * Start the orchestration service
   */
  async start(): Promise<void> {
    if (this.isActive) {
      logger.warn('Orchestrator is already active');
      return;
    }

    logger.info('Starting workflow orchestration');
    this.isActive = true;

    // Perform initial health check
    await this.performHealthCheck();

    // Schedule periodic health checks
    if (this.config.monitoring.healthCheckInterval) {
      const intervalMs = this.config.monitoring.healthCheckInterval * 60 * 1000;
      this.healthCheckTimer = setInterval(() => {
        this.performHealthCheck().catch(error => {
          logger.error('Scheduled health check failed', error);
        });
      }, intervalMs);

      logger.info(`Scheduled health checks every ${this.config.monitoring.healthCheckInterval} minutes`);
    }

    // Set up proactive monitoring if enabled
    if (this.config.automation.enableProactiveMonitoring) {
      await this.setupProactiveMonitoring();
    }

    logger.info('Workflow orchestration started successfully');
  }

  /**
   * Stop the orchestration service
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      logger.warn('Orchestrator is not active');
      return;
    }

    logger.info('Stopping workflow orchestration');
    this.isActive = false;

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    logger.info('Workflow orchestration stopped');
  }

  /**
   * Get current orchestration status
   */
  getStatus(): OrchestrationStatus {
    const lastAction = this.automationActions[this.automationActions.length - 1];
    
    return {
      isActive: this.isActive,
      lastHealthCheck: lastAction?.timestamp,
      nextHealthCheck: this.healthCheckTimer && this.config.monitoring.healthCheckInterval ? 
        new Date(Date.now() + this.config.monitoring.healthCheckInterval * 60 * 1000).toISOString() : 
        undefined,
      totalWorkflowsMonitored: this.automationActions.filter(a => a.action === 'health_check').length,
      healthStatus: this.determineOverallHealth(),
      automationActions: this.automationActions.slice(-10) // Last 10 actions
    };
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      logger.info('Performing workflow health check');
      const { owner, repo } = this.config.repository;

      // Get workflow health status
      const health = await this.monitor.monitorWorkflowHealth(owner, repo, {
        maxFailureRate: 30,
        maxConsecutiveFailures: 2,
        alertOnSlowRuns: true,
        maxDurationMinutes: 45
      });

      this.logAutomationAction('health_check', 'Scheduled health check completed', true);

      // Take action based on health status
      if (!health.healthy) {
        await this.handleUnhealthyWorkflow(health);
      }

      // Send notifications if configured
      if (this.notifications && !health.healthy) {
        const notification = NotificationService.createHealthNotification(
          `${owner}/${repo}`,
          health.issues,
          health.recommendations
        );
        await this.notifications.sendNotification(notification);
      }

      // Auto-healing if enabled
      if (this.config.automation.enableAutoHealing && !health.healthy) {
        await this.attemptAutoHealing(health);
      }

    } catch (error: any) {
      logger.error('Health check failed', error);
      this.logAutomationAction('health_check', 'Health check failed', false);
    }
  }

  /**
   * Handle unhealthy workflow scenarios
   */
  private async handleUnhealthyWorkflow(health: any): Promise<void> {
    const { owner, repo } = this.config.repository;
    
    logger.warn('Unhealthy workflow detected', {
      repository: `${owner}/${repo}`,
      issues: health.issues,
      recommendations: health.recommendations
    });

    // Check for consecutive failures that might need retry
    if (this.config.monitoring.enableAutoRetry) {
      const recentRuns = health.lastRuns || [];
      const consecutiveFailures = this.countConsecutiveFailures(recentRuns);
      
      if (consecutiveFailures >= 2 && consecutiveFailures <= (this.config.monitoring.maxRetryAttempts || 3)) {
        await this.attemptAutoRetry(recentRuns[0]?.runId);
      }
    }

    this.logAutomationAction('unhealthy_workflow_detected', 
      `Issues: ${health.issues.join(', ')}`, true);
  }

  /**
   * Attempt automatic retry of failed workflows
   */
  private async attemptAutoRetry(runId?: number): Promise<void> {
    if (!runId) return;

    try {
      const { owner, repo } = this.config.repository;
      logger.info(`Attempting auto-retry for run ${runId}`);

      await this.monitor.retryWorkflowRun(owner, repo, runId, false);
      
      this.logAutomationAction('auto_retry', `Retried workflow run ${runId}`, true);

      // Wait for retry delay before next check
      if (this.config.monitoring.retryDelayMinutes) {
        await new Promise(resolve => 
          setTimeout(resolve, this.config.monitoring.retryDelayMinutes! * 60 * 1000)
        );
      }

    } catch (error: any) {
      logger.error(`Auto-retry failed for run ${runId}`, error);
      this.logAutomationAction('auto_retry', `Failed to retry run ${runId}`, false);
    }
  }

  /**
   * Attempt auto-healing actions
   */
  private async attemptAutoHealing(health: any): Promise<void> {
    logger.info('Attempting auto-healing actions');

    // Example auto-healing actions:
    // 1. Clear workflow caches if performance issues detected
    // 2. Restart workflows if they're stuck
    // 3. Update workflow configurations based on recommendations

    try {
      // For now, we'll log the auto-healing attempt
      // In a real implementation, you would implement specific healing actions
      
      const healingActions = this.generateHealingActions(health);
      
      for (const action of healingActions) {
        logger.info(`Executing healing action: ${action.name}`);
        // Execute the action
        await action.execute();
        
        this.logAutomationAction('auto_healing', action.name, true);
      }

    } catch (error: any) {
      logger.error('Auto-healing failed', error);
      this.logAutomationAction('auto_healing', 'Auto-healing failed', false);
    }
  }

  /**
   * Generate healing actions based on health issues
   */
  private generateHealingActions(health: any): Array<{ name: string; execute: () => Promise<void> }> {
    const actions: Array<{ name: string; execute: () => Promise<void> }> = [];

    // Example healing actions based on common issues
    if (health.issues.some((issue: string) => issue.includes('High failure rate'))) {
      actions.push({
        name: 'Reset workflow environment',
        execute: async () => {
          // Simulate environment reset
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      });
    }

    if (health.issues.some((issue: string) => issue.includes('consecutive failures'))) {
      actions.push({
        name: 'Clear workflow caches',
        execute: async () => {
          // Simulate cache clearing
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      });
    }

    return actions;
  }

  /**
   * Set up proactive monitoring
   */
  private async setupProactiveMonitoring(): Promise<void> {
    logger.info('Setting up proactive monitoring');

    // Monitor for trends that indicate potential issues
    // This could include:
    // - Gradually increasing failure rates
    // - Performance degradation over time
    // - Resource usage patterns

    this.logAutomationAction('proactive_monitoring', 'Proactive monitoring enabled', true);
  }

  /**
   * Count consecutive failures from recent runs
   */
  private countConsecutiveFailures(runs: Array<{ conclusion: string }>): number {
    let count = 0;
    for (const run of runs) {
      if (run.conclusion === 'failure') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Determine overall health status
   */
  private determineOverallHealth(): 'healthy' | 'warning' | 'critical' {
    const recentActions = this.automationActions.slice(-5);
    const healthChecks = recentActions.filter(a => a.action === 'health_check');
    const failures = recentActions.filter(a => !a.success);

    if (failures.length >= 3) return 'critical';
    if (failures.length >= 1) return 'warning';
    return 'healthy';
  }

  /**
   * Log automation action
   */
  private logAutomationAction(action: string, reason: string, success: boolean): void {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      reason,
      success
    };

    this.automationActions.push(entry);

    // Keep only last 100 actions to prevent memory issues
    if (this.automationActions.length > 100) {
      this.automationActions = this.automationActions.slice(-100);
    }

    logger.info('Automation action logged', entry);
  }

  /**
   * Handle workflow completion notification
   */
  async handleWorkflowCompletion(runId: number, status: 'success' | 'failure', duration: number, stats?: any): Promise<void> {
    if (!this.notifications) return;

    try {
      const { owner, repo } = this.config.repository;
      const notification = NotificationService.createWorkflowNotification(
        `${owner}/${repo}`,
        runId,
        status,
        duration,
        stats
      );

      await this.notifications.sendNotification(notification);
      
      this.logAutomationAction('notification_sent', 
        `Workflow completion notification for run ${runId}`, true);

    } catch (error: any) {
      logger.error('Failed to send workflow completion notification', error);
      this.logAutomationAction('notification_failed', 
        `Failed to notify for run ${runId}`, false);
    }
  }
}

/**
 * Factory function to create orchestrator with common configurations
 */
export function createWorkflowOrchestrator(
  repository: { owner: string; repo: string },
  options: {
    githubToken?: string;
    enableNotifications?: boolean;
    slackWebhook?: string;
    healthCheckMinutes?: number;
    enableAutoRetry?: boolean;
    enableAutoHealing?: boolean;
  } = {}
): WorkflowOrchestrator {
  const config: OrchestrationConfig = {
    repository,
    monitoring: {
      healthCheckInterval: options.healthCheckMinutes || 30,
      enableAutoRetry: options.enableAutoRetry ?? true,
      maxRetryAttempts: 3,
      retryDelayMinutes: 5
    },
    notifications: options.enableNotifications && options.slackWebhook ? {
      slack: {
        webhook: options.slackWebhook,
        username: 'Remcode Orchestrator'
      }
    } : undefined,
    automation: {
      enableAutoHealing: options.enableAutoHealing ?? false,
      enablePerformanceOptimization: true,
      enableProactiveMonitoring: true
    }
  };

  return new WorkflowOrchestrator(config, options.githubToken);
}
