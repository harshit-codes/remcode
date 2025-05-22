import { getLogger } from '../utils/logger';

const logger = getLogger('ChangeDetector');

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  previousPath?: string;
}

export class ChangeDetector {
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
  }

  async getChangedFiles(fromCommit: string, toCommit: string = 'HEAD'): Promise<FileChange[]> {
    logger.info(`Detecting changes from ${fromCommit} to ${toCommit}`);
    
    // Stub implementation - would use git diff to get changed files
    return [
      { path: 'src/example.ts', status: 'modified' },
      { path: 'src/new-file.ts', status: 'added' }
    ];
  }

  async hasChanges(fromCommit: string, toCommit: string = 'HEAD'): Promise<boolean> {
    const changes = await this.getChangedFiles(fromCommit, toCommit);
    return changes.length > 0;
  }

  async filterCodeFiles(changes: FileChange[]): Promise<FileChange[]> {
    // Filter for code files only
    const codeExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.cpp', '.c', '.go', '.rs'];
    return changes.filter(change => 
      codeExtensions.some(ext => change.path.endsWith(ext))
    );
  }
}
