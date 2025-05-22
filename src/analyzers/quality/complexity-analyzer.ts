import { getLogger } from '../../utils/logger';
import { CodeStructureAnalysis, ComplexityReport } from './types';

// Use require for complexity-report instead of import since it lacks proper TypeScript definitions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const complexity = require('complexity-report');

const logger = getLogger('ComplexityAnalyzer');

/**
 * Analyzes code complexity and structure
 */
export class ComplexityAnalyzer {
  /**
   * Analyzes code structure to find classes, functions, etc.
   * @param content File content
   * @param language Programming language
   * @returns Analysis of code structure
   */
  public static analyzeCodeStructure(content: string, language: string): CodeStructureAnalysis {
    let classes = 0;
    let functions = 0;
    let longestFunction = 0;
    const issues: string[] = [];
    
    // Use regex patterns to detect code structures based on language
    if (['javascript', 'typescript'].includes(language)) {
      // Find classes
      const classRegex = /class\s+[\w_$]+\s*\{|class\s+[\w_$]+\s+extends\s+[\w_$.]+\s*\{/g;
      const classMatches = content.match(classRegex) || [];
      classes = classMatches.length;
      
      // Find functions
      const functionRegex = /function\s+[\w_$]+\s*\([^)]*\)\s*\{|const\s+[\w_$]+\s*=\s*\([^)]*\)\s*=>\s*\{|\([^)]*\)\s*=>\s*\{|async\s+function\s+[\w_$]+\s*\([^)]*\)\s*\{/g;
      const functionMatches = content.match(functionRegex) || [];
      functions = functionMatches.length;
      
      // Estimate longest function
      let maxFunctionLength = 0;
      const functionBlocks = content.match(/\{([^{}]*({[^{}]*}[^{}]*)*)*\}/g) || [];
      for (const block of functionBlocks) {
        const lines = block.split('\n').length;
        if (lines > maxFunctionLength) {
          maxFunctionLength = lines;
        }
      }
      longestFunction = maxFunctionLength;
      
      // Check for common issues
      if (content.includes('console.log')) {
        issues.push('Contains console.log statements');
      }
      if (content.includes('TODO')) {
        issues.push('Contains TODO comments');
      }
      if (content.includes('any') && language === 'typescript') {
        issues.push('Uses `any` type, which reduces type safety');
      }
      if (longestFunction > 100) {
        issues.push('Contains very long functions (>100 lines)');
      }
    } else if (language === 'python') {
      // Find classes
      const classRegex = /class\s+[\w_]+/g;
      const classMatches = content.match(classRegex) || [];
      classes = classMatches.length;
      
      // Find functions
      const functionRegex = /def\s+[\w_]+\s*\(/g;
      const functionMatches = content.match(functionRegex) || [];
      functions = functionMatches.length;
      
      // Estimate longest function
      const lines = content.split('\n');
      let currentFunctionLength = 0;
      let inFunction = false;
      let maxFunctionLength = 0;
      
      for (const line of lines) {
        if (line.trim().startsWith('def ')) {
          if (inFunction && currentFunctionLength > maxFunctionLength) {
            maxFunctionLength = currentFunctionLength;
          }
          currentFunctionLength = 1;
          inFunction = true;
        } else if (inFunction) {
          if (line.trim() && !line.trim().startsWith('#')) {
            if (!line.startsWith(' ') && !line.startsWith('\t')) {
              inFunction = false;
              if (currentFunctionLength > maxFunctionLength) {
                maxFunctionLength = currentFunctionLength;
              }
            } else {
              currentFunctionLength++;
            }
          }
        }
      }
      
      longestFunction = maxFunctionLength;
      
      // Check for common issues
      if (content.includes('print(')) {
        issues.push('Contains print statements');
      }
      if (content.includes('TODO')) {
        issues.push('Contains TODO comments');
      }
      if (longestFunction > 100) {
        issues.push('Contains very long functions (>100 lines)');
      }
    }
    
    // Calculate complexity score based on number of classes, functions, and length
    const complexityScore = Math.min(10, Math.ceil((classes * 2 + functions + longestFunction / 20) / 2));
    
    return { classes, functions, longestFunction, complexityScore, issues };
  }
  
  /**
   * Calculates cyclomatic complexity based on control flow structures
   * @param content File content
   * @param language Programming language
   * @returns Cyclomatic complexity score
   */
  public static calculateCyclomaticComplexity(content: string, language: string): number {
    // Base complexity is 1
    let complexity = 1;
    
    if (['javascript', 'typescript', 'java', 'csharp'].includes(language)) {
      // Count decision points
      const ifMatch = content.match(/if\s*\(/g) || [];
      const forMatch = content.match(/for\s*\(/g) || [];
      const whileMatch = content.match(/while\s*\(/g) || [];
      const caseMatch = content.match(/case\s+[^:]+:/g) || [];
      const catchMatch = content.match(/catch\s*\(/g) || [];
      const ternaryMatch = content.match(/\?[^:]+:/g) || [];
      const andMatch = content.match(/&&/g) || [];
      const orMatch = content.match(/\|\|/g) || [];
      
      complexity += ifMatch.length + forMatch.length + whileMatch.length + 
                   caseMatch.length + catchMatch.length + ternaryMatch.length +
                   andMatch.length + orMatch.length;
    } else if (language === 'python') {
      // Count decision points in Python
      const ifMatch = content.match(/if\s+/g) || [];
      const forMatch = content.match(/for\s+/g) || [];
      const whileMatch = content.match(/while\s+/g) || [];
      const exceptMatch = content.match(/except\s+/g) || [];
      const andMatch = content.match(/\band\b/g) || [];
      const orMatch = content.match(/\bor\b/g) || [];
      
      complexity += ifMatch.length + forMatch.length + whileMatch.length + 
                   exceptMatch.length + andMatch.length + orMatch.length;
    }
    
    return complexity;
  }
  
  /**
   * Calculates maintainability index
   * MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC) + 50 * sin(sqrt(2.4 * CR))
   * where:
   * HV = Halstead Volume (simplified as LOC)
   * CC = Cyclomatic Complexity
   * LOC = Lines of Code
   * CR = Comment Ratio
   * @param cyclomaticComplexity Cyclomatic complexity
   * @param linesOfCode Lines of code
   * @param commentRatio Comment ratio
   * @returns Maintainability index
   */
  public static calculateMaintainabilityIndex(cyclomaticComplexity: number, linesOfCode: number, commentRatio: number): number {
    // Simplified calculation
    const halsteadVolume = linesOfCode; // Approximation
    const mi = 171 - 5.2 * Math.log(halsteadVolume || 1) - 0.23 * cyclomaticComplexity - 
              16.2 * Math.log(linesOfCode || 1) + 50 * Math.sin(Math.sqrt(2.4 * commentRatio));
    
    return Math.max(0, Math.min(100, mi));
  }

  /**
   * Use complexity-report to analyze JavaScript/TypeScript code
   * @param content File content
   * @returns Complexity report or null if analysis fails
   */
  public static analyzeWithComplexityReport(content: string): ComplexityReport | null {
    try {
      return complexity.analyse(content, {
        newmi: true,
        newmi_options: {
          moduleType: 'esm'
        }
      });
    } catch (error) {
      logger.warn(`Error using complexity-report: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}
