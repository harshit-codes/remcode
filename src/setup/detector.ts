import * as fs from 'fs';
import * as path from 'path';
import { getLogger } from '../utils/logger';

const logger = getLogger('SetupDetector');

export interface SetupStatus {
  needsSetup: boolean;
  hasRemcodeFile: boolean;
  hasGitRepo: boolean;
  hasGitHubRepo: boolean;
  hasWorkflow: boolean;
  reason?: string;
}

export class SetupDetector {
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
  }

  async detectSetupNeeds(): Promise<SetupStatus> {
    logger.info('Detecting setup requirements');
    
    const hasGitRepo = this.hasGitRepository();
    const hasRemcodeFile = this.hasRemcodeFile();
    const hasWorkflow = this.hasGitHubWorkflow();
    const hasGitHubRepo = await this.hasGitHubRepository();

    const needsSetup = !hasRemcodeFile || !hasWorkflow || !hasGitHubRepo;

    return {
      needsSetup,
      hasRemcodeFile,
      hasGitRepo,
      hasGitHubRepo,
      hasWorkflow,
      reason: this.getSetupReason(hasRemcodeFile, hasWorkflow, hasGitHubRepo)
    };
  }

  private hasGitRepository(): boolean {
    return fs.existsSync(path.join(this.repoPath, '.git'));
  }

  private hasRemcodeFile(): boolean {
    return fs.existsSync(path.join(this.repoPath, '.remcode'));
  }

  private hasGitHubWorkflow(): boolean {
    const workflowPath = path.join(this.repoPath, '.github', 'workflows', 'remcode.yml');
    return fs.existsSync(workflowPath);
  }

  private async hasGitHubRepository(): Promise<boolean> {
    // Stub implementation - check if git remote exists
    try {
      const { execSync } = require('child_process');
      const remoteUrl = execSync('git remote get-url origin', { 
        cwd: this.repoPath,
        encoding: 'utf8'
      }).trim();
      return remoteUrl.includes('github.com');
    } catch (error) {
      return false;
    }
  }

  private getSetupReason(hasRemcodeFile: boolean, hasWorkflow: boolean, hasGitHubRepo: boolean): string {
    if (!hasGitHubRepo) return 'No GitHub repository detected';
    if (!hasRemcodeFile) return 'No .remcode configuration file found';
    if (!hasWorkflow) return 'No GitHub Actions workflow found';
    return 'Setup complete';
  }
}
