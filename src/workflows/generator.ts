import * as fs from 'fs';
import * as path from 'path';
import { getLogger } from '../utils/logger';
import { WorkflowTemplates } from './templates';

const logger = getLogger('WorkflowGenerator');

export class WorkflowGenerator {
  private templates: WorkflowTemplates;
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.templates = new WorkflowTemplates();
    this.repoPath = repoPath;
  }

  async generateRemcodeWorkflow(repoName: string): Promise<void> {
    logger.info(`Generating Remcode workflow for repository: ${repoName}`);
    
    const workflowContent = this.templates.getRemcodeWorkflowTemplate(repoName);
    const workflowPath = path.join(this.repoPath, '.github', 'workflows', 'remcode.yml');
    
    await this.ensureWorkflowDirectory();
    fs.writeFileSync(workflowPath, workflowContent);
    
    logger.info(`Workflow generated at: ${workflowPath}`);
  }

  async generateCustomWorkflow(name: string, options: any): Promise<void> {
    logger.info(`Generating custom workflow: ${name}`);
    
    const workflowContent = this.templates.getCustomWorkflowTemplate(options);
    const workflowPath = path.join(this.repoPath, '.github', 'workflows', `${name}.yml`);
    
    await this.ensureWorkflowDirectory();
    fs.writeFileSync(workflowPath, workflowContent);
  }

  private async ensureWorkflowDirectory(): Promise<void> {
    const workflowDir = path.join(this.repoPath, '.github', 'workflows');
    if (!fs.existsSync(workflowDir)) {
      fs.mkdirSync(workflowDir, { recursive: true });
    }
  }
}
