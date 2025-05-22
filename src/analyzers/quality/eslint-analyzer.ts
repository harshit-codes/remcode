import { ESLint } from 'eslint';
import { getLogger } from '../../utils/logger';
import { ESLintAnalysisResult } from './types';

const logger = getLogger('ESLintAnalyzer');

/**
 * Analyzes code quality using ESLint
 */
export class ESLintAnalyzer {
  private eslint: ESLint | null = null;

  /**
   * Initialize the ESLintAnalyzer with appropriate configuration
   */
  constructor() {
    this.initializeESLint();
  }

  /**
   * Initialize the ESLint instance with appropriate configuration
   */
  private initializeESLint(): void {
    try {
      this.eslint = new ESLint({
        useEslintrc: false,
        overrideConfig: {
          parser: '@typescript-eslint/parser',
          plugins: ['@typescript-eslint'],
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
          },
          rules: {
            // Complexity rules
            'complexity': ['error', { max: 20 }],
            'max-depth': ['error', { max: 4 }],
            'max-nested-callbacks': ['error', { max: 3 }],
            'max-params': ['error', { max: 4 }],
            'max-statements': ['error', { max: 20 }],
            'max-len': ['error', { code: 100, ignoreComments: true }],
            'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
            'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
            
            // Code quality rules
            'no-unused-vars': 'error',
            'no-duplicate-imports': 'error',
            'no-console': 'warn',
            'no-debugger': 'error',
            'no-eval': 'error',
            'no-alert': 'error',
            'no-implicit-globals': 'error',
            'prefer-const': 'error',
            'require-await': 'error',
          }
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        fix: false
      });
      
      logger.info('ESLint initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize ESLint: ${error instanceof Error ? error.message : String(error)}`);
      this.eslint = null;
    }
  }

  /**
   * Analyzes a file using ESLint
   * @param filePath Path to the file
   * @param content File content
   * @returns Analysis results or null if ESLint is not initialized
   */
  public async analyzeFile(filePath: string, content: string): Promise<ESLintAnalysisResult | null> {
    if (!this.eslint) {
      logger.error('ESLint not initialized, cannot analyze file');
      return null;
    }

    try {
      // Lint the file
      const results = await this.eslint.lintText(content, { filePath });
      const issues: string[] = [];
      
      // Extract issues
      if (results && results.length > 0) {
        const lintResult = results[0];
        
        lintResult.messages.forEach(message => {
          issues.push(`Line ${message.line}: ${message.message} (${message.ruleId || 'unknown rule'})`);
        });
      }
      
      // Count classes, functions, and calculate complexity
      // Use basic regex patterns to count structures
      const classRegex = /class\s+[\w_$]+/g;
      const functionRegex = /function\s+[\w_$]+|const\s+[\w_$]+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|\([^)]*\)\s*=>/g;
      
      const classes = (content.match(classRegex) || []).length;
      const functions = (content.match(functionRegex) || []).length;
      
      // Find longest function by detecting code blocks
      const codeBlocks = content.match(/\{[^{}]*(\{[^{}]*\}[^{}]*)*\}/g) || [];
      let longestFunction = 0;
      
      for (const block of codeBlocks) {
        const lines = block.split('\n').length;
        longestFunction = Math.max(longestFunction, lines);
      }
      
      // Rough estimate of cyclomatic complexity based on control structures
      const ifMatch = content.match(/if\s*\(/g) || [];
      const forMatch = content.match(/for\s*\(/g) || [];
      const whileMatch = content.match(/while\s*\(/g) || [];
      const caseMatch = content.match(/case\s+/g) || [];
      const catchMatch = content.match(/catch\s*\(/g) || [];
      
      const cyclomaticComplexity = 1 + 
        ifMatch.length + 
        forMatch.length + 
        whileMatch.length +
        caseMatch.length + 
        catchMatch.length;
      
      // Calculate a complexity score (higher = more complex)
      const complexityScore = Math.min(10, Math.ceil((cyclomaticComplexity + functions + longestFunction / 20) / 3));
      
      return {
        issues,
        complexityScore,
        classes,
        functions,
        longestFunction,
        cyclomaticComplexity
      };
    } catch (error) {
      logger.error(`Error analyzing file with ESLint: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}
