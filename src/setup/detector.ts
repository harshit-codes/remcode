import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as child_process from 'child_process';
import { getLogger } from '../utils/logger';

const logger = getLogger('SetupDetector');
const execAsync = util.promisify(child_process.exec);

/**
 * Possible reasons for setup requirements
 */
export enum SetupReason {
  SETUP_COMPLETE = 'Setup complete',
  NO_GIT_REPO = 'No Git repository detected',
  NO_GITHUB_REPO = 'No GitHub repository detected',
  NO_REMCODE_FILE = 'No .remcode configuration file found',
  NO_WORKFLOW = 'No GitHub Actions workflow found',
  INVALID_CONFIG = 'Invalid .remcode configuration file',
  NO_REQUIRED_SECRETS = 'Missing required GitHub secrets',
  NEEDS_UPDATE = 'Remcode configuration needs to be updated'
}

/**
 * Git remote information
 */
export interface GitRemoteInfo {
  exists: boolean;
  url: string;
  owner?: string;
  repo?: string;
  isGitHub: boolean;
  defaultBranch?: string;
}

/**
 * Detailed setup status information
 */
export interface SetupStatus {
  needsSetup: boolean;
  hasRemcodeFile: boolean;
  hasGitRepo: boolean;
  hasGitHubRepo: boolean;
  hasWorkflow: boolean;
  hasRequiredSecrets: boolean;
  hasValidConfig: boolean;
  reason: SetupReason;
  gitInfo?: GitRemoteInfo;
  configVersion?: string;
  workflowVersion?: string;
  remcodeVersion?: string;
  detectionTimestamp: string;
}

/**
 * Class to detect repository setup requirements for Remcode
 */
export class SetupDetector {
  private repoPath: string;

  /**
   * Constructor
   * @param repoPath Path to the repository to analyze
   */
  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
    logger.debug(`SetupDetector initialized for path: ${repoPath}`);
  }

  /**
   * Detect all setup requirements
   */
  async detectSetupNeeds(): Promise<SetupStatus> {
    logger.info('Detecting setup requirements');
    
    try {
      // Basic checks
      const hasGitRepo = this.hasGitRepository();
      const hasRemcodeFile = this.hasRemcodeFile();
      const hasWorkflow = this.hasGitHubWorkflow();
      
      // Advanced checks
      const gitInfo = hasGitRepo ? await this.getGitRemoteInfo() : undefined;
      const hasGitHubRepo = !!gitInfo?.isGitHub;
      const hasValidConfig = hasRemcodeFile ? this.validateRemcodeConfig() : false;
      const hasRequiredSecrets = hasGitHubRepo ? await this.checkRequiredSecrets(gitInfo) : false;
      
      // Version information
      const configVersion = hasValidConfig ? this.getConfigVersion() : undefined;
      const workflowVersion = hasWorkflow ? await this.getWorkflowVersion() : undefined;
      
      // Determine setup needs
      const needsSetup = !hasGitRepo || !hasGitHubRepo || !hasRemcodeFile || !hasWorkflow || !hasValidConfig || !hasRequiredSecrets;
      const reason = this.getSetupReason(hasGitRepo, hasGitHubRepo, hasRemcodeFile, hasWorkflow, hasValidConfig, hasRequiredSecrets);

      return {
        needsSetup,
        hasRemcodeFile,
        hasGitRepo,
        hasGitHubRepo,
        hasWorkflow,
        hasRequiredSecrets,
        hasValidConfig,
        reason,
        gitInfo,
        configVersion,
        workflowVersion,
        remcodeVersion: this.getRemcodeVersion(),
        detectionTimestamp: new Date().toISOString()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error detecting setup requirements: ${errorMessage}`);
      throw new Error(`Failed to detect setup requirements: ${errorMessage}`);
    }
  }

  /**
   * Check if directory is a Git repository
   */
  private hasGitRepository(): boolean {
    try {
      return fs.existsSync(path.join(this.repoPath, '.git'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Error checking for Git repository: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Check if .remcode configuration file exists
   */
  private hasRemcodeFile(): boolean {
    try {
      return fs.existsSync(path.join(this.repoPath, '.remcode'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Error checking for .remcode file: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Check if GitHub workflow file exists
   */
  private hasGitHubWorkflow(): boolean {
    try {
      const workflowPath = path.join(this.repoPath, '.github', 'workflows', 'remcode.yml');
      return fs.existsSync(workflowPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Error checking for GitHub workflow: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get Git remote information
   */
  private async getGitRemoteInfo(): Promise<GitRemoteInfo> {
    try {
      // Check if git remote exists
      const { stdout: remoteUrl } = await execAsync('git remote get-url origin', { 
        cwd: this.repoPath
      });
      
      if (!remoteUrl) {
        return { exists: false, url: '', isGitHub: false };
      }
      
      const trimmedUrl = remoteUrl.trim();
      const isGitHub = trimmedUrl.includes('github.com');
      
      // Parse owner and repo from URL
      let owner, repo;
      
      if (isGitHub) {
        // Handle HTTPS and SSH formats
        // https://github.com/owner/repo.git or git@github.com:owner/repo.git
        const httpsMatch = trimmedUrl.match(/github\.com[\/:]([\w.-]+)\/([\w.-]+)(?:\.git)?$/);
        
        if (httpsMatch) {
          [, owner, repo] = httpsMatch;
          // Remove .git suffix if present
          repo = repo.replace(/\.git$/, '');
        }
        
        // Get default branch
        const { stdout: branchOutput } = await execAsync('git symbolic-ref refs/remotes/origin/HEAD --short', {
          cwd: this.repoPath
        }).catch(() => ({ stdout: 'origin/main' })); // Default to origin/main if command fails
        
        const defaultBranch = branchOutput.trim().replace('origin/', '');
        
        return {
          exists: true,
          url: trimmedUrl,
          owner,
          repo,
          isGitHub,
          defaultBranch
        };
      }
      
      return { exists: true, url: trimmedUrl, isGitHub: false };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Error getting Git remote info: ${errorMessage}`);
      return { exists: false, url: '', isGitHub: false };
    }
  }

  /**
   * Validate .remcode configuration file
   */
  private validateRemcodeConfig(): boolean {
    try {
      const configPath = path.join(this.repoPath, '.remcode');
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      // Basic validation
      return !!config.version && 
             !!config.repository && 
             !!config.repository.owner && 
             !!config.repository.name;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Error validating .remcode config: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get .remcode configuration version
   */
  private getConfigVersion(): string | undefined {
    try {
      const configPath = path.join(this.repoPath, '.remcode');
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);
      return config.version;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Get GitHub workflow version
   */
  private async getWorkflowVersion(): Promise<string | undefined> {
    try {
      const workflowPath = path.join(this.repoPath, '.github', 'workflows', 'remcode.yml');
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');
      
      // Look for version comment in workflow file
      const versionMatch = workflowContent.match(/# Remcode workflow version: (\S+)/);
      return versionMatch ? versionMatch[1] : '0.1.0'; // Default to 0.1.0 if not found
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Get current remcode version
   */
  private getRemcodeVersion(): string {
    try {
      // Try to get version from package.json
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version || '0.1.0';
      }
      return '0.1.0'; // Default version
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.debug(`Error getting remcode version: ${errorMessage}`);
      return '0.1.0';
    }
  }

  /**
   * Check if required GitHub secrets are set
   */
  private async checkRequiredSecrets(gitInfo?: GitRemoteInfo): Promise<boolean> {
    // This would typically use GitHub API to check if secrets exist
    // For now, we'll return true as a stub implementation
    // TODO: Implement actual GitHub API check for secrets
    return true;
  }

  /**
   * Determine the reason for setup requirements
   */
  private getSetupReason(
    hasGitRepo: boolean, 
    hasGitHubRepo: boolean, 
    hasRemcodeFile: boolean, 
    hasWorkflow: boolean, 
    hasValidConfig: boolean, 
    hasRequiredSecrets: boolean
  ): SetupReason {
    if (!hasGitRepo) return SetupReason.NO_GIT_REPO;
    if (!hasGitHubRepo) return SetupReason.NO_GITHUB_REPO;
    if (!hasRemcodeFile) return SetupReason.NO_REMCODE_FILE;
    if (hasRemcodeFile && !hasValidConfig) return SetupReason.INVALID_CONFIG;
    if (!hasWorkflow) return SetupReason.NO_WORKFLOW;
    if (!hasRequiredSecrets) return SetupReason.NO_REQUIRED_SECRETS;
    
    return SetupReason.SETUP_COMPLETE;
  }
}
