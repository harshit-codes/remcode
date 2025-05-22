import * as fs from 'fs';
import * as path from 'path';
import { getLogger } from '../utils/logger';
import { WorkflowTemplates, WorkflowType, WorkflowTemplateOptions } from './templates';

const logger = getLogger('WorkflowGenerator');

/**
 * Result of workflow generation
 */
export interface WorkflowGenerationResult {
  success: boolean;
  filePath?: string;
  error?: string;
  workflowContent?: string;
}

/**
 * Class for generating GitHub Actions workflows
 */
export class WorkflowGenerator {
  private templates: WorkflowTemplates;
  private repoPath: string;

  /**
   * Constructor
   * @param repoPath Path to the repository
   */
  constructor(repoPath: string = process.cwd()) {
    this.templates = new WorkflowTemplates();
    this.repoPath = repoPath;
  }

  /**
   * Generate a standard Remcode workflow for code analysis and vectorization
   * @param repoName Repository name
   * @param options Additional workflow options
   * @returns Workflow generation result
   */
  async generateRemcodeWorkflow(
    repoName: string,
    options: Partial<WorkflowTemplateOptions> = {}
  ): Promise<WorkflowGenerationResult> {
    logger.info(`Generating Remcode workflow for repository: ${repoName}`);
    
    try {
      const templateOptions: WorkflowTemplateOptions = {
        repoName,
        ...options
      };
      
      const workflowContent = this.templates.getWorkflowTemplate(
        WorkflowType.REMCODE_BASIC,
        templateOptions
      );
      
      const workflowPath = path.join(this.repoPath, '.github', 'workflows', 'remcode.yml');
      
      await this.ensureWorkflowDirectory();
      fs.writeFileSync(workflowPath, workflowContent, 'utf8');
      
      logger.info(`Workflow generated at: ${workflowPath}`);
      
      return {
        success: true,
        filePath: workflowPath,
        workflowContent
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to generate Remcode workflow: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate a scheduled Remcode workflow for periodic processing
   * @param repoName Repository name
   * @param schedule Schedule configuration (cron expression)
   * @param options Additional workflow options
   * @returns Workflow generation result
   */
  async generateScheduledWorkflow(
    repoName: string,
    schedule: string = '0 0 * * 0', // Weekly on Sunday
    options: Partial<WorkflowTemplateOptions> = {}
  ): Promise<WorkflowGenerationResult> {
    logger.info(`Generating scheduled Remcode workflow for ${repoName} with schedule: ${schedule}`);
    
    try {
      const templateOptions: WorkflowTemplateOptions = {
        repoName,
        schedule: {
          enabled: true,
          cron: schedule,
          branches: ['main']
        },
        ...options
      };
      
      const workflowContent = this.templates.getWorkflowTemplate(
        WorkflowType.REMCODE_SCHEDULED,
        templateOptions
      );
      
      const workflowPath = path.join(this.repoPath, '.github', 'workflows', 'remcode-scheduled.yml');
      
      await this.ensureWorkflowDirectory();
      fs.writeFileSync(workflowPath, workflowContent, 'utf8');
      
      logger.info(`Scheduled workflow generated at: ${workflowPath}`);
      
      return {
        success: true,
        filePath: workflowPath,
        workflowContent
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to generate scheduled workflow: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate an advanced Remcode workflow with detailed steps
   * @param repoName Repository name
   * @param options Additional workflow options
   * @returns Workflow generation result
   */
  async generateAdvancedWorkflow(
    repoName: string,
    options: Partial<WorkflowTemplateOptions> = {}
  ): Promise<WorkflowGenerationResult> {
    logger.info(`Generating advanced Remcode workflow for repository: ${repoName}`);
    
    try {
      const templateOptions: WorkflowTemplateOptions = {
        repoName,
        ...options
      };
      
      const workflowContent = this.templates.getWorkflowTemplate(
        WorkflowType.REMCODE_ADVANCED,
        templateOptions
      );
      
      const workflowPath = path.join(this.repoPath, '.github', 'workflows', 'remcode-advanced.yml');
      
      await this.ensureWorkflowDirectory();
      fs.writeFileSync(workflowPath, workflowContent, 'utf8');
      
      logger.info(`Advanced workflow generated at: ${workflowPath}`);
      
      return {
        success: true,
        filePath: workflowPath,
        workflowContent
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to generate advanced workflow: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate a custom workflow with specified options
   * @param name Workflow name (filename without extension)
   * @param type Workflow template type
   * @param options Template options
   * @returns Workflow generation result
   */
  async generateCustomWorkflow(
    name: string,
    type: WorkflowType = WorkflowType.CUSTOM,
    options: WorkflowTemplateOptions
  ): Promise<WorkflowGenerationResult> {
    logger.info(`Generating custom workflow: ${name} using template type: ${type}`);
    
    try {
      const workflowContent = this.templates.getWorkflowTemplate(type, options);
      const workflowPath = path.join(this.repoPath, '.github', 'workflows', `${name}.yml`);
      
      await this.ensureWorkflowDirectory();
      fs.writeFileSync(workflowPath, workflowContent, 'utf8');
      
      logger.info(`Custom workflow generated at: ${workflowPath}`);
      
      return {
        success: true,
        filePath: workflowPath,
        workflowContent
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to generate custom workflow: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate all common Remcode workflows
   * @param repoName Repository name
   * @param options Additional template options
   * @returns Map of workflow names to generation results
   */
  async generateAllWorkflows(
    repoName: string,
    options: Partial<WorkflowTemplateOptions> = {}
  ): Promise<Map<string, WorkflowGenerationResult>> {
    logger.info(`Generating all Remcode workflows for repository: ${repoName}`);
    
    const results = new Map<string, WorkflowGenerationResult>();
    
    // Generate basic workflow
    results.set('basic', await this.generateRemcodeWorkflow(repoName, options));
    
    // Generate scheduled workflow
    results.set('scheduled', await this.generateScheduledWorkflow(repoName, undefined, options));
    
    // Generate advanced workflow
    results.set('advanced', await this.generateAdvancedWorkflow(repoName, options));
    
    // Generate workflow with cache
    results.set('cached', await this.generateCustomWorkflow(
      'remcode-cached',
      WorkflowType.REMCODE_WITH_CACHE,
      { repoName, ...options }
    ));
    
    // Generate workflow with notifications
    results.set('notifications', await this.generateCustomWorkflow(
      'remcode-notifications',
      WorkflowType.REMCODE_WITH_NOTIFICATIONS,
      { repoName, ...options }
    ));
    
    // Count successes
    const successCount = [...results.values()].filter(r => r.success).length;
    logger.info(`Generated ${successCount}/${results.size} workflows successfully`);
    
    return results;
  }

  /**
   * Update an existing workflow
   * @param workflowPath Path to the workflow file
   * @param type Workflow template type
   * @param options Template options
   * @returns Workflow generation result
   */
  async updateWorkflow(
    workflowPath: string,
    type: WorkflowType,
    options: WorkflowTemplateOptions
  ): Promise<WorkflowGenerationResult> {
    logger.info(`Updating workflow at: ${workflowPath}`);
    
    try {
      if (!fs.existsSync(workflowPath)) {
        throw new Error(`Workflow file not found: ${workflowPath}`);
      }
      
      const workflowContent = this.templates.getWorkflowTemplate(type, options);
      fs.writeFileSync(workflowPath, workflowContent, 'utf8');
      
      logger.info(`Workflow updated at: ${workflowPath}`);
      
      return {
        success: true,
        filePath: workflowPath,
        workflowContent
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to update workflow: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Ensure .github/workflows directory exists
   * @returns Path to workflows directory
   */
  private async ensureWorkflowDirectory(): Promise<string> {
    const workflowDir = path.join(this.repoPath, '.github', 'workflows');
    
    try {
      if (!fs.existsSync(workflowDir)) {
        fs.mkdirSync(workflowDir, { recursive: true });
        logger.debug(`Created workflows directory: ${workflowDir}`);
      }
      return workflowDir;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create workflows directory: ${errorMessage}`);
      throw new Error(`Failed to create workflows directory: ${errorMessage}`);
    }
  }
}
