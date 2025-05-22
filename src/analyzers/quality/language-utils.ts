import * as path from 'path';
import { getLogger } from '../../utils/logger';

const logger = getLogger('LanguageUtils');

/**
 * Utility class for language-specific operations
 */
export class LanguageUtils {
  /**
   * Mapping of file extensions to programming languages
   */
  private static languageExtensions: Record<string, string[]> = {
    javascript: ['.js', '.jsx'],
    typescript: ['.ts', '.tsx'],
    python: ['.py'],
    java: ['.java'],
    csharp: ['.cs'],
    ruby: ['.rb'],
    php: ['.php'],
    go: ['.go'],
    rust: ['.rs'],
    swift: ['.swift'],
    kotlin: ['.kt'],
    html: ['.html', '.htm'],
    css: ['.css', '.scss', '.sass', '.less'],
    json: ['.json'],
    markdown: ['.md', '.markdown']
  };

  /**
   * Determines the programming language of a file based on its extension
   * @param filePath Path to the file
   * @returns The detected language or 'unknown' if not recognized
   */
  public static detectLanguage(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    for (const [language, extensions] of Object.entries(this.languageExtensions)) {
      if (extensions.includes(extension)) {
        return language;
      }
    }
    
    return 'unknown';
  }

  /**
   * Checks if the file is a source code file (not data, config, etc.)
   * @param filePath Path to the file
   * @returns True if it's a source code file
   */
  public static isSourceCodeFile(filePath: string): boolean {
    const language = this.detectLanguage(filePath);
    return language !== 'unknown' && 
           language !== 'json' && 
           language !== 'markdown';
  }

  /**
   * Gets all supported file extensions
   * @returns Array of all supported file extensions
   */
  public static getAllExtensions(): string[] {
    return Object.values(this.languageExtensions).flat();
  }

  /**
   * Counts comment lines in the given content based on language
   * @param content File content
   * @param language Programming language
   * @returns Object with comment line count and total line count
   */
  public static countCommentLines(content: string, language: string): { commentLines: number; totalLines: number } {
    const lines = content.split('\n');
    const totalLines = lines.length;
    let commentLines = 0;
    
    if (['javascript', 'typescript', 'java', 'csharp', 'php', 'css'].includes(language)) {
      // Handle C-style comments (/* */ and //)
      let inBlockComment = false;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (inBlockComment) {
          commentLines++;
          if (trimmedLine.includes('*/')) {
            inBlockComment = false;
          }
        } else if (trimmedLine.startsWith('//')) {
          commentLines++;
        } else if (trimmedLine.startsWith('/*')) {
          commentLines++;
          if (!trimmedLine.includes('*/')) {
            inBlockComment = true;
          }
        } else if (trimmedLine.includes('//')) {
          // Line with code and end-line comment
          const commentIndex = trimmedLine.indexOf('//');
          const beforeComment = trimmedLine.substring(0, commentIndex).trim();
          if (beforeComment) {
            // There's code before the comment, count as partial comment
            commentLines += 0.5;
          } else {
            // Only comment on this line
            commentLines++;
          }
        }
      }
    } else if (language === 'python') {
      // Handle Python comments (# and """)
      let inDocstring = false;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (inDocstring) {
          commentLines++;
          if (trimmedLine.includes('"""')) {
            inDocstring = false;
          }
        } else if (trimmedLine.startsWith('#')) {
          commentLines++;
        } else if (trimmedLine.startsWith('"""')) {
          commentLines++;
          if (!trimmedLine.endsWith('"""') || trimmedLine === '"""') {
            inDocstring = true;
          }
        } else if (trimmedLine.includes('#')) {
          // Line with code and end-line comment
          const commentIndex = trimmedLine.indexOf('#');
          const beforeComment = trimmedLine.substring(0, commentIndex).trim();
          if (beforeComment) {
            // There's code before the comment, count as partial comment
            commentLines += 0.5;
          } else {
            // Only comment on this line
            commentLines++;
          }
        }
      }
    } else if (['html', 'xml'].includes(language)) {
      // HTML <!-- --> comments
      let inComment = false;
      for (const line of lines) {
        if (inComment) {
          commentLines++;
          if (line.includes('-->')) {
            inComment = false;
          }
        } else if (line.includes('<!--')) {
          commentLines++;
          if (!line.includes('-->')) {
            inComment = true;
          }
        }
      }
    }
    
    return { commentLines, totalLines };
  }
}
