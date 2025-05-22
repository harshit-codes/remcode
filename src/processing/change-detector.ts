import { getLogger } from '../utils/logger';
import { FileChange } from './types';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const logger = getLogger('ChangeDetector');

export class ChangeDetector {
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = path.resolve(repoPath);
    logger.debug(`Initialized ChangeDetector with repo path: ${this.repoPath}`);
    
    // Verify this is a git repository
    if (!this.isGitRepository()) {
      throw new Error(`Directory is not a git repository: ${this.repoPath}`);
    }
  }

  /**
   * Check if the directory is a git repository
   */
  private isGitRepository(): boolean {
    try {
      execSync('git rev-parse --is-inside-work-tree', { cwd: this.repoPath, stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the current HEAD commit hash
   */
  public getCurrentCommit(): string {
    try {
      return execSync('git rev-parse HEAD', { cwd: this.repoPath }).toString().trim();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to get current commit: ${errorMsg}`);
      throw new Error(`Failed to get current commit: ${errorMsg}`);
    }
  }

  /**
   * Check if a commit exists in the repository
   */
  public commitExists(commit: string): boolean {
    try {
      execSync(`git cat-file -e ${commit}^{commit}`, { cwd: this.repoPath, stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of changed files between two commits
   */
  async getChangedFiles(fromCommit: string, toCommit: string = 'HEAD'): Promise<FileChange[]> {
    logger.info(`Detecting changes from ${fromCommit} to ${toCommit}`);
    
    // Verify commits exist
    if (!this.commitExists(fromCommit)) {
      throw new Error(`From commit does not exist: ${fromCommit}`);
    }
    
    if (!this.commitExists(toCommit)) {
      throw new Error(`To commit does not exist: ${toCommit}`);
    }
    
    try {
      // Get diff with name status and renamed detection
      const diffCommand = `git diff --name-status -M ${fromCommit} ${toCommit}`;
      logger.debug(`Executing: ${diffCommand}`);
      
      const diffOutput = execSync(diffCommand, { cwd: this.repoPath }).toString().trim();
      
      if (!diffOutput) {
        logger.info('No changes detected between commits');
        return [];
      }
      
      // Parse git diff output
      const changes: FileChange[] = [];
      const lines = diffOutput.split('\n');
      
      for (const line of lines) {
        // Format is: STATUS\tFILE_PATH (or STATUS\tOLD_PATH\tNEW_PATH for renames)
        const parts = line.split('\t');
        const status = parts[0].trim();
        
        // Skip submodule changes
        if (status.startsWith('S')) continue;
        
        if (status.startsWith('A')) {
          // Added file
          changes.push(this.enrichFileInfo({
            status: 'added',
            path: parts[1]
          }));
        } else if (status.startsWith('M') || status.startsWith('T')) {
          // Modified file (T = type changed but content still modified)
          changes.push(this.enrichFileInfo({
            status: 'modified',
            path: parts[1]
          }));
        } else if (status.startsWith('D')) {
          // Deleted file
          changes.push({
            status: 'deleted',
            path: parts[1],
            extension: path.extname(parts[1])
          });
        } else if (status.startsWith('R')) {
          // Renamed file
          changes.push(this.enrichFileInfo({
            status: 'renamed',
            previousPath: parts[1],
            path: parts[2]
          }));
        }
      }
      
      logger.info(`Detected ${changes.length} changed files`);
      return changes;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to get changed files: ${errorMsg}`);
      throw new Error(`Failed to get changed files: ${errorMsg}`);
    }
  }

  /**
   * Add additional file information
   */
  private enrichFileInfo(change: FileChange): FileChange {
    // Skip enrichment for deleted files
    if (change.status === 'deleted') {
      return change;
    }
    
    const filePath = path.join(this.repoPath, change.path);
    change.extension = path.extname(change.path);
    
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        change.size = stats.size;
      }
    } catch (error) {
      logger.warn(`Couldn't get file stats for ${filePath}`);
    }
    
    return change;
  }

  /**
   * Check if there are any changes between two commits
   */
  async hasChanges(fromCommit: string, toCommit: string = 'HEAD'): Promise<boolean> {
    try {
      // Using --quiet option to just check if changes exist
      const result = execSync(`git diff --quiet ${fromCommit} ${toCommit} || echo "has_changes"`, { 
        cwd: this.repoPath 
      }).toString().trim();
      
      return result === 'has_changes';
    } catch (error) {
      // Git diff returns exit code 1 if there are changes
      return true;
    }
  }

  /**
   * Get a list of modified lines for a specific file
   */
  async getModifiedLines(filePath: string, fromCommit: string, toCommit: string = 'HEAD'): Promise<number[]> {
    try {
      // Use git diff to get line-by-line changes for the file
      const diffCommand = `git diff -U0 ${fromCommit} ${toCommit} -- "${filePath}"`;
      const diffOutput = execSync(diffCommand, { cwd: this.repoPath }).toString();
      
      if (!diffOutput) {
        return [];
      }
      
      // Parse diff output to extract line numbers
      const modifiedLines: number[] = [];
      const lines = diffOutput.split('\n');
      let currentLine = 0;
      
      for (const line of lines) {
        // Look for hunk headers @@ -a,b +c,d @@
        if (line.startsWith('@@')) {
          const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
          if (match) {
            // New file content starts at line number match[3]
            currentLine = parseInt(match[3], 10);
            continue;
          }
        }
        
        // Added or modified lines start with +
        if (line.startsWith('+') && !line.startsWith('+++')) {
          modifiedLines.push(currentLine);
        }
        
        // Increment current line for added and context lines, not for removed lines
        if (line.startsWith('+') || !line.startsWith('-')) {
          currentLine++;
        }
      }
      
      return modifiedLines;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to get modified lines for ${filePath}: ${errorMsg}`);
      return [];
    }
  }

  /**
   * Filter for only code files
   */
  async filterCodeFiles(changes: FileChange[]): Promise<FileChange[]> {
    // Expanded list of code file extensions
    const codeExtensions = [
      // TypeScript/JavaScript
      '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
      // Python
      '.py', '.pyi', '.pyx', '.pxd',
      // Java and JVM
      '.java', '.kt', '.groovy', '.scala',
      // C-family
      '.c', '.cpp', '.h', '.hpp', '.cc', '.cxx',
      // C#
      '.cs',
      // Go
      '.go',
      // Rust
      '.rs',
      // Swift
      '.swift',
      // Web
      '.html', '.htm', '.css', '.scss', '.sass', '.less',
      // PHP
      '.php',
      // Ruby
      '.rb',
      // Shell
      '.sh', '.bash', '.zsh',
      // Misc
      '.hs', '.fs', '.fsx', '.pl', '.r'
    ];
    
    logger.info(`Filtering ${changes.length} changes for code files`);
    
    const filteredChanges = changes.filter(change => {
      const extension = path.extname(change.path).toLowerCase();
      return codeExtensions.includes(extension);
    });
    
    logger.info(`Found ${filteredChanges.length} code file changes`);
    return filteredChanges;
  }
  
  /**
   * Get list of ignored files and directories from .gitignore
   */
  async getIgnoredPaths(): Promise<string[]> {
    const gitignorePath = path.join(this.repoPath, '.gitignore');
    
    if (!fs.existsSync(gitignorePath)) {
      return [];
    }
    
    try {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      return gitignoreContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    } catch (error) {
      logger.warn(`Failed to read .gitignore: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
}
