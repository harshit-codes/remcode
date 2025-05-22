import { getLogger } from '../utils/logger';
import { FileChange } from './change-detector';

const logger = getLogger('FileAnalyzer');

export interface FileAnalysis {
  path: string;
  category: 'priority' | 'normal' | 'test' | 'config' | 'ignore';
  language: string;
  complexity: 'low' | 'medium' | 'high';
  size: number;
  chunkingStrategy: string;
}

export class FileAnalyzer {
  async analyzeChangedFiles(changes: FileChange[]): Promise<FileAnalysis[]> {
    logger.info(`Analyzing ${changes.length} changed files`);
    
    // Stub implementation - analyze each changed file
    return changes
      .filter(change => change.status !== 'deleted')
      .map(change => ({
        path: change.path,
        category: this.categorizeFile(change.path),
        language: this.detectLanguage(change.path),
        complexity: 'medium' as const,
        size: 1000,
        chunkingStrategy: 'function_level'
      }));
  }

  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'ts': 'typescript', 'js': 'javascript', 'py': 'python'
    };
    return langMap[ext || ''] || 'unknown';
  }

  private categorizeFile(filePath: string): FileAnalysis['category'] {
    if (filePath.includes('test')) return 'test';
    if (filePath.includes('config')) return 'config';
    if (filePath.includes('index')) return 'priority';
    return 'normal';
  }
}
