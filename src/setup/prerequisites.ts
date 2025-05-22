import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import * as util from 'util';
import { getLogger } from '../utils/logger';

const logger = getLogger('Prerequisites');
const execAsync = util.promisify(child_process.exec);

/**
 * Prerequisite check result
 */
export interface PrerequisiteCheck {
  passed: boolean;
  name: string;
  message: string;
  details?: string;
  critical: boolean;
}

/**
 * Class to check prerequisites for remcode setup
 */
export class Prerequisites {
  private repoPath: string;
  
  /**
   * Constructor
   * @param repoPath Path to the repository
   */
  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
  }

  /**
   * Check all prerequisites
   * @returns Array of prerequisite check results
   */
  async checkAll(): Promise<PrerequisiteCheck[]> {
    logger.info('Checking prerequisites for remcode setup');
    
    try {
      // Execute all checks in parallel
      const checks = [
        this.checkGitRepository(),
        this.checkGitHubRepository(),
        this.checkNodeVersion(),
        this.checkEnvironmentVariables(),
        this.checkCleanWorkingDirectory(),
        this.checkWritePermissions()
      ];

      const results = await Promise.all(checks);
      
      // Log results
      const passed = results.filter(check => check.passed).length;
      const failed = results.length - passed;
      const criticalFailed = results.filter(check => !check.passed && check.critical).length;
      
      logger.info(`Prerequisites check complete: ${passed}/${results.length} passed, ${failed} failed (${criticalFailed} critical)`);
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error checking prerequisites: ${errorMessage}`);
      
      // Return a generic failure if something went wrong
      return [{
        passed: false,
        name: 'prerequisites',
        message: `Error checking prerequisites: ${errorMessage}`,
        critical: true
      }];
    }
  }

  /**
   * Check if Git repository exists
   */
  private async checkGitRepository(): Promise<PrerequisiteCheck> {
    const name = 'git-repository';
    
    try {
      // Check if .git directory exists
      const gitDirExists = fs.existsSync(path.join(this.repoPath, '.git'));
      
      if (!gitDirExists) {
        return {
          passed: false,
          name,
          message: 'Git repository not found',
          details: 'This directory is not a Git repository. Please initialize Git with `git init` first.',
          critical: true
        };
      }
      
      // Verify git command is available
      try {
        await execAsync('git --version', { cwd: this.repoPath });
      } catch (error) {
        return {
          passed: false,
          name,
          message: 'Git command not available',
          details: 'Git is not installed or not in PATH. Please install Git.',
          critical: true
        };
      }
      
      return {
        passed: true,
        name,
        message: 'Git repository found',
        critical: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        passed: false,
        name,
        message: `Error checking Git repository: ${errorMessage}`,
        critical: true
      };
    }
  }

  /**
   * Check if GitHub remote exists
   */
  private async checkGitHubRepository(): Promise<PrerequisiteCheck> {
    const name = 'github-remote';
    
    try {
      // Check if git remote with GitHub URL exists
      try {
        const { stdout: remoteOutput } = await execAsync('git remote -v', { cwd: this.repoPath });
        
        if (!remoteOutput) {
          return {
            passed: false,
            name,
            message: 'No Git remotes found',
            details: 'Add a GitHub remote with `git remote add origin https://github.com/username/repo.git`',
            critical: true
          };
        }
        
        if (!remoteOutput.includes('github.com')) {
          return {
            passed: false,
            name,
            message: 'No GitHub remote found',
            details: 'Add a GitHub remote with `git remote add origin https://github.com/username/repo.git`',
            critical: true
          };
        }
        
        return {
          passed: true,
          name,
          message: 'GitHub repository configured',
          critical: true
        };
      } catch (error) {
        return {
          passed: false,
          name,
          message: 'Failed to check Git remotes',
          details: 'Ensure Git is properly installed and initialized',
          critical: true
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        passed: false,
        name,
        message: `Error checking GitHub repository: ${errorMessage}`,
        critical: true
      };
    }
  }

  /**
   * Check if Node.js version is compatible
   */
  private async checkNodeVersion(): Promise<PrerequisiteCheck> {
    const name = 'node-version';
    const minVersion = 14; // Minimum Node.js version required
    
    try {
      const nodeVersion = process.version;
      const versionNumber = parseInt(nodeVersion.substring(1).split('.')[0], 10);
      
      if (versionNumber < minVersion) {
        return {
          passed: false,
          name,
          message: `Node.js version ${nodeVersion} is not supported`,
          details: `Please upgrade to Node.js v${minVersion} or higher`,
          critical: true
        };
      }
      
      return {
        passed: true,
        name,
        message: `Node.js version ${nodeVersion} is compatible`,
        critical: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        passed: false,
        name,
        message: `Error checking Node.js version: ${errorMessage}`,
        critical: true
      };
    }
  }

  /**
   * Check if required environment variables are set
   */
  private checkEnvironmentVariables(): PrerequisiteCheck {
    const name = 'environment-variables';
    
    try {
      // Check for required environment variables
      const requiredVars = ['GITHUB_TOKEN']; // Add any other required variables
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      // Optional but recommended variables
      const recommendedVars = ['PINECONE_API_KEY', 'HUGGINGFACE_TOKEN'];
      const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        return {
          passed: false,
          name,
          message: `Missing required environment variables: ${missingVars.join(', ')}`,
          details: 'These variables are needed for Remcode to function properly',
          critical: true
        };
      }
      
      if (missingRecommended.length > 0) {
        return {
          passed: true, // Still pass, but with a warning
          name,
          message: `Required environment variables found, but missing recommended: ${missingRecommended.join(', ')}`,
          details: 'These variables are recommended for full functionality',
          critical: false
        };
      }
      
      return {
        passed: true,
        name,
        message: 'All environment variables configured',
        critical: false
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        passed: false,
        name,
        message: `Error checking environment variables: ${errorMessage}`,
        critical: true
      };
    }
  }

  /**
   * Check if working directory is clean
   */
  private async checkCleanWorkingDirectory(): Promise<PrerequisiteCheck> {
    const name = 'clean-working-directory';
    
    try {
      try {
        const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: this.repoPath });
        
        if (statusOutput.trim()) {
          return {
            passed: false,
            name,
            message: 'Working directory has uncommitted changes',
            details: 'Commit or stash your changes before continuing',
            critical: false // Not critical, but recommended
          };
        }
        
        return {
          passed: true,
          name,
          message: 'Working directory is clean',
          critical: false
        };
      } catch (error) {
        return {
          passed: false,
          name,
          message: 'Failed to check working directory status',
          details: 'Ensure Git is properly installed and initialized',
          critical: false
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        passed: false,
        name,
        message: `Error checking working directory: ${errorMessage}`,
        critical: false
      };
    }
  }

  /**
   * Check if we have write permissions in the repository
   */
  private async checkWritePermissions(): Promise<PrerequisiteCheck> {
    const name = 'write-permissions';
    
    try {
      // Try to create and remove a test file
      const testFilePath = path.join(this.repoPath, '.remcode-test');
      
      try {
        // Write test file
        fs.writeFileSync(testFilePath, 'test');
        
        // Check if file was created
        const fileExists = fs.existsSync(testFilePath);
        
        // Clean up
        if (fileExists) {
          fs.unlinkSync(testFilePath);
        }
        
        if (!fileExists) {
          return {
            passed: false,
            name,
            message: 'No write permissions in repository',
            details: 'Ensure you have write permissions to this directory',
            critical: true
          };
        }
        
        return {
          passed: true,
          name,
          message: 'Write permissions verified',
          critical: true
        };
      } catch (error) {
        return {
          passed: false,
          name,
          message: 'No write permissions in repository',
          details: `Failed to create test file: ${error instanceof Error ? error.message : String(error)}`,
          critical: true
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        passed: false,
        name,
        message: `Error checking write permissions: ${errorMessage}`,
        critical: true
      };
    }
  }
}
