import * as fs from 'fs';
import * as path from 'path';
import { getLogger } from '../utils/logger';

const logger = getLogger('WorkflowGenerator');

/**
 * Workflow template options
 */
export interface WorkflowTemplateOptions {
  repoName: string;
  owner?: string;
  branches?: string[];
  embeddingModel?: string;
  nodeVersion?: string;
  cronSchedule?: string;
  customSecrets?: Record<string, string>;
  includeSchedule?: boolean;
  workflowVersion?: string;
}

/**
 * GitHub Actions workflow template types
 */
export enum WorkflowTemplateType {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  ENTERPRISE = 'enterprise'
}

/**
 * Workflow generation result
 */
export interface WorkflowGenerationResult {
  success: boolean;
  filePath?: string;
  error?: string;
  workflowContent?: string;
  workflowVersion: string;
}

/**
 * Class for generating GitHub Actions workflows for Remcode
 */
export class WorkflowGenerator {
  private repoPath: string;
  private readonly currentVersion: string = '0.2.0';

  /**
   * Constructor
   * @param repoPath Path to the repository
   */
  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
  }

  /**
   * Generate a GitHub Actions workflow for Remcode
   * @param options Workflow template options
   * @param templateType Type of workflow template to generate
   * @returns Workflow generation result
   */
  async generateWorkflow(
    options: WorkflowTemplateOptions, 
    templateType: WorkflowTemplateType = WorkflowTemplateType.BASIC
  ): Promise<WorkflowGenerationResult> {
    logger.info(`Generating GitHub Actions workflow using ${templateType} template`);
    
    try {
      // Create .github/workflows directory if it doesn't exist
      const workflowsDir = path.join(this.repoPath, '.github', 'workflows');
      await this.ensureDirectoryExists(workflowsDir);
      
      // Generate workflow content based on template type
      const workflowContent = this.generateWorkflowContent(options, templateType);
      
      // Write workflow to file
      const workflowPath = path.join(workflowsDir, 'remcode.yml');
      fs.writeFileSync(workflowPath, workflowContent, 'utf8');
      
      logger.info(`Workflow generated successfully at ${workflowPath}`);
      
      return {
        success: true,
        filePath: workflowPath,
        workflowContent,
        workflowVersion: this.currentVersion
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to generate workflow: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        workflowVersion: this.currentVersion
      };
    }
  }

  /**
   * Ensure directory exists, creating it if necessary
   * @param dir Directory path
   */
  private async ensureDirectoryExists(dir: string): Promise<void> {
    try {
      // Create directory recursively if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.debug(`Created directory: ${dir}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create directory ${dir}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Generate workflow content based on template type and options
   * @param options Workflow template options
   * @param templateType Type of workflow template
   * @returns Workflow content as string
   */
  private generateWorkflowContent(
    options: WorkflowTemplateOptions,
    templateType: WorkflowTemplateType
  ): string {
    // Default values
    const {
      repoName,
      owner = 'unknown',
      branches = ['main', 'master', 'develop'],
      nodeVersion = '18',
      embeddingModel = 'microsoft/graphcodebert-base',
      cronSchedule = '0 0 * * 1', // Weekly on Monday at midnight
      includeSchedule = true,
      customSecrets = {}
    } = options;
    
    // Version comment
    const versionComment = `# Remcode workflow version: ${this.currentVersion}\n# Generated on: ${new Date().toISOString()}\n`;
    
    // Base workflow content
    let workflowContent = `${versionComment}name: Remcode Code Indexing\n\n`;
    
    // Add triggers
    workflowContent += 'on:\n';
    workflowContent += '  push:\n';
    workflowContent += `    branches: [ ${branches.join(', ')} ]\n`;
    
    // Add schedule if enabled
    if (includeSchedule) {
      workflowContent += '  schedule:\n';
      workflowContent += `    - cron: '${cronSchedule}'\n`;
    }
    
    // Add manual trigger
    workflowContent += '  workflow_dispatch:\n';
    workflowContent += '\n';
    
    // Add jobs section based on template type
    switch (templateType) {
      case WorkflowTemplateType.ENTERPRISE:
        workflowContent += this.generateEnterpriseWorkflow(repoName, nodeVersion, embeddingModel, customSecrets);
        break;
      case WorkflowTemplateType.ADVANCED:
        workflowContent += this.generateAdvancedWorkflow(repoName, nodeVersion, embeddingModel, customSecrets);
        break;
      case WorkflowTemplateType.BASIC:
      default:
        workflowContent += this.generateBasicWorkflow(repoName, nodeVersion, embeddingModel, customSecrets);
        break;
    }
    
    return workflowContent;
  }

  /**
   * Generate a basic workflow for Remcode
   */
  private generateBasicWorkflow(
    repoName: string,
    nodeVersion: string,
    embeddingModel: string,
    customSecrets: Record<string, string>
  ): string {
    let content = 'jobs:\n';
    content += '  process:\n';
    content += '    runs-on: ubuntu-latest\n';
    content += '    steps:\n';
    content += '    - uses: actions/checkout@v4\n';
    content += '      with:\n';
    content += '        fetch-depth: 0\n';
    content += '    - name: Setup Node.js\n';
    content += '      uses: actions/setup-node@v4\n';
    content += '      with:\n';
    content += `        node-version: '${nodeVersion}'\n`;
    content += '    - name: Process with Remcode\n';
    content += '      run: npx remcode process\n';
    content += '      env:\n';
    content += '        PINECONE_API_KEY: ${{ secrets.PINECONE_API_KEY }}\n';
    content += '        HUGGINGFACE_TOKEN: ${{ secrets.HUGGINGFACE_TOKEN }}\n';
    content += `        EMBEDDING_MODEL: ${embeddingModel}\n`;
    
    // Add custom secrets if provided
    Object.entries(customSecrets).forEach(([key, value]) => {
      content += `        ${key}: ${value}\n`;
    });
    
    return content;
  }

  /**
   * Generate an advanced workflow with caching and metrics
   */
  private generateAdvancedWorkflow(
    repoName: string,
    nodeVersion: string,
    embeddingModel: string,
    customSecrets: Record<string, string>
  ): string {
    let content = 'jobs:\n';
    content += '  process:\n';
    content += '    runs-on: ubuntu-latest\n';
    content += '    steps:\n';
    content += '    - uses: actions/checkout@v4\n';
    content += '      with:\n';
    content += '        fetch-depth: 0\n';
    content += '    - name: Setup Node.js\n';
    content += '      uses: actions/setup-node@v4\n';
    content += '      with:\n';
    content += `        node-version: '${nodeVersion}'\n`;
    content += '        cache: "npm"\n';
    content += '    - name: Install Dependencies\n';
    content += '      run: npm ci\n';
    content += '    - name: Process with Remcode\n';
    content += '      id: remcode\n';
    content += '      run: npx remcode process --detailed-output --metrics\n';
    content += '      env:\n';
    content += '        PINECONE_API_KEY: ${{ secrets.PINECONE_API_KEY }}\n';
    content += '        HUGGINGFACE_TOKEN: ${{ secrets.HUGGINGFACE_TOKEN }}\n';
    content += `        EMBEDDING_MODEL: ${embeddingModel}\n`;
    
    // Add custom secrets if provided
    Object.entries(customSecrets).forEach(([key, value]) => {
      content += `        ${key}: ${value}\n`;
    });
    
    // Add post-processing steps
    content += '    - name: Upload Processing Metrics\n';
    content += '      if: always()\n';
    content += '      uses: actions/upload-artifact@v3\n';
    content += '      with:\n';
    content += `        name: remcode-metrics-${repoName}\n`;
    content += '        path: .remcode-metrics.json\n';
    content += '        retention-days: 90\n';
    
    return content;
  }

  /**
   * Generate an enterprise workflow with multiple jobs and notifications
   */
  private generateEnterpriseWorkflow(
    repoName: string,
    nodeVersion: string,
    embeddingModel: string,
    customSecrets: Record<string, string>
  ): string {
    let content = 'jobs:\n';
    
    // Preparation job
    content += '  prepare:\n';
    content += '    runs-on: ubuntu-latest\n';
    content += '    outputs:\n';
    content += '      cache_key: ${{ steps.cache_key.outputs.key }}\n';
    content += '    steps:\n';
    content += '    - uses: actions/checkout@v4\n';
    content += '      with:\n';
    content += '        fetch-depth: 0\n';
    content += '    - name: Generate cache key\n';
    content += '      id: cache_key\n';
    content += '      run: echo "key=remcode-${{ github.repository }}-${{ hashFiles(\'**/*.{js,ts,jsx,tsx,md,json}\') }}" >> $GITHUB_OUTPUT\n';
    
    // Processing job
    content += '  process:\n';
    content += '    needs: prepare\n';
    content += '    runs-on: ubuntu-latest\n';
    content += '    steps:\n';
    content += '    - uses: actions/checkout@v4\n';
    content += '      with:\n';
    content += '        fetch-depth: 0\n';
    content += '    - name: Setup Node.js\n';
    content += '      uses: actions/setup-node@v4\n';
    content += '      with:\n';
    content += `        node-version: '${nodeVersion}'\n`;
    content += '        cache: "npm"\n';
    content += '    - name: Restore cache\n';
    content += '      uses: actions/cache@v3\n';
    content += '      with:\n';
    content += '        path: |\n';
    content += '          .remcode-cache\n';
    content += '          .remcode-temp\n';
    content += '        key: ${{ needs.prepare.outputs.cache_key }}\n';
    content += '    - name: Install Dependencies\n';
    content += '      run: npm ci\n';
    content += '    - name: Process with Remcode\n';
    content += '      id: remcode\n';
    content += '      run: npx remcode process --detailed-output --metrics --cache\n';
    content += '      env:\n';
    content += '        PINECONE_API_KEY: ${{ secrets.PINECONE_API_KEY }}\n';
    content += '        HUGGINGFACE_TOKEN: ${{ secrets.HUGGINGFACE_TOKEN }}\n';
    content += `        EMBEDDING_MODEL: ${embeddingModel}\n`;
    
    // Add custom secrets if provided
    Object.entries(customSecrets).forEach(([key, value]) => {
      content += `        ${key}: ${value}\n`;
    });
    
    // Add post-processing steps
    content += '    - name: Upload Processing Metrics\n';
    content += '      if: always()\n';
    content += '      uses: actions/upload-artifact@v3\n';
    content += '      with:\n';
    content += `        name: remcode-metrics-${repoName}\n`;
    content += '        path: .remcode-metrics.json\n';
    content += '        retention-days: 90\n';
    
    // Notification job
    content += '  notify:\n';
    content += '    needs: process\n';
    content += '    if: always()\n';
    content += '    runs-on: ubuntu-latest\n';
    content += '    steps:\n';
    content += '    - name: Send Notification\n';
    content += '      if: always()\n';
    content += '      uses: slackapi/slack-github-action@v1.24.0\n';
    content += '      with:\n';
    content += '        payload: |\n';
    content += '          {\n';
    content += `            "repository": "${repoName}",\n`;
    content += '            "status": "${{ needs.process.result }}",\n';
    content += '            "run_id": "${{ github.run_id }}",\n';
    content += '            "run_number": "${{ github.run_number }}"\n';
    content += '          }\n';
    content += '      env:\n';
    content += '        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}\n';
    content += '        SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK\n';
    
    return content;
  }
}
