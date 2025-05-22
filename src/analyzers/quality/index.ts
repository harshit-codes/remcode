import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { getLogger } from '../../utils/logger';
import { QualityAnalysis, FileQuality, ProblematicFile, ModuleQuality } from './types';
import { ESLintAnalyzer } from './eslint-analyzer';
import { ComplexityAnalyzer } from './complexity-analyzer';
import { LanguageUtils } from './language-utils';
import { QualityAssessor } from './quality-assessment';

// Use require for complexity-report instead of import since it lacks proper TypeScript definitions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const complexity = require('complexity-report');

const logger = getLogger('CodeQualityAnalyzer');

/**
 * Class that analyzes the code quality of a repository
 */
export class CodeQualityAnalyzer {
  private repoPath: string;
  private eslintAnalyzer: ESLintAnalyzer;
  private qualityAssessor: QualityAssessor;

  /**
   * Constructor
   * @param repoPath Path to the repository to analyze
   */
  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.eslintAnalyzer = new ESLintAnalyzer();
    this.qualityAssessor = new QualityAssessor();
    
    logger.info(`Initialized CodeQualityAnalyzer for repository: ${repoPath}`);
  }

  /**
   * Analyzes the code quality of the repository
   * @returns A detailed code quality analysis
   */
  public async analyze(): Promise<QualityAnalysis> {
    logger.info(`Analyzing code quality in ${this.repoPath}`);
    
    // Find all code files
    const files = await this.findCodeFiles();
    logger.info(`Found ${files.length} code files`);
    
    // Analyze each file
    const fileAnalyses: Record<string, FileQuality> = {};
    const problematicFiles: ProblematicFile[] = [];
    const complexityThresholds = this.qualityAssessor.getComplexityThresholds();
    
    for (const filePath of files) {
      try {
        const relPath = path.relative(this.repoPath, filePath);
        const analysis = await this.analyzeFile(filePath);
        
        fileAnalyses[relPath] = {
          ...analysis,
          quality_assessment: this.qualityAssessor.assessFileQuality(analysis),
          recommended_chunking: this.qualityAssessor.determineChunkingStrategy(analysis)
        };
        
        // Check if file has issues that need attention
        if (analysis.issues.length > 0 || analysis.complexity_score > complexityThresholds.file_complexity.poor) {
          problematicFiles.push({
            file_path: relPath,
            issues: analysis.issues,
            handling_strategy: analysis.complexity_score > complexityThresholds.file_complexity.poor * 1.5 ? 'refactor' : 'special_handling'
          });
        }
      } catch (error) {
        logger.error(`Error analyzing ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Group files by module (directory)
    const modules: Record<string, ModuleQuality> = {};
    
    for (const [filePath, fileAnalysis] of Object.entries(fileAnalyses)) {
      const dir = path.dirname(filePath);
      
      if (!modules[dir]) {
        modules[dir] = {
          complexity_score: 0,
          total_lines: 0,
          files: [],
          comment_ratio: 0,
          quality_assessment: 'moderate' // Add default quality assessment
        };
      }
      
      modules[dir].files?.push(filePath);
      modules[dir].complexity_score += fileAnalysis.complexity_score;
      modules[dir].total_lines += fileAnalysis.total_lines;
      modules[dir].comment_ratio += fileAnalysis.comment_ratio * fileAnalysis.total_lines; // Weighted by lines
    }
    
    // Calculate average comment ratio for modules
    for (const [modulePath, module] of Object.entries(modules)) {
      module.comment_ratio = module.comment_ratio / module.total_lines;
      module.quality_assessment = this.qualityAssessor.assessModuleQuality(module);
    }
    
    // Generate overall assessment
    const overallAssessment = this.qualityAssessor.generateOverallAssessment(modules, fileAnalyses, problematicFiles);
    
    return {
      modules,
      files: fileAnalyses,
      problematic_files: problematicFiles,
      overall_assessment: overallAssessment
    };
  }

  /**
   * Finds all code files in the repository
   * @returns Array of file paths
   */
  private async findCodeFiles(): Promise<string[]> {
    // Find all files with known extensions
    const extensions = LanguageUtils.getAllExtensions();
    const codeFiles: string[] = [];
    
    for (const extension of extensions) {
      const files = glob.sync(`**/*${extension}`, {
        cwd: this.repoPath,
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']
      });
      codeFiles.push(...files);
    }
    
    return codeFiles;
  }

  /**
   * Analyzes a single file for quality metrics
   * @param filePath Path to the file to analyze
   * @returns Analysis results
   */
  private async analyzeFile(filePath: string): Promise<FileQuality> {
    logger.debug(`Analyzing file: ${filePath}`);
    
    try {
      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');
      const language = LanguageUtils.detectLanguage(filePath);
      
      // Skip unknown file types or non-text files
      if (!LanguageUtils.isSourceCodeFile(filePath)) {
        return {
          complexity_score: 0,
          classes: 0,
          functions: 0,
          comment_ratio: 0,
          total_lines: 0,
          issues: [],
          recommended_chunking: 'file_level',
          quality_assessment: 'moderate' // Add default quality assessment
        };
      }
      
      const issues: string[] = [];
      let complexityScore = 0;
      let classes = 0;
      let functions = 0;
      let longestFunction = 0;
      let cyclomaticComplexity = 0;
      
      // Use ESLint for JavaScript and TypeScript files
      if (language === 'javascript' || language === 'typescript') {
        const eslintResults = await this.eslintAnalyzer.analyzeFile(filePath, content);
        
        if (eslintResults) {
          complexityScore = eslintResults.complexityScore;
          issues.push(...eslintResults.issues);
          classes = eslintResults.classes;
          functions = eslintResults.functions;
          longestFunction = eslintResults.longestFunction;
          cyclomaticComplexity = eslintResults.cyclomaticComplexity;
        } else {
          // If ESLint fails, fall back to complexity-report for JavaScript files
          const complexityReport = ComplexityAnalyzer.analyzeWithComplexityReport(content);
          
          if (complexityReport) {
            // Extract metrics from report
            cyclomaticComplexity = complexityReport.aggregate.cyclomatic;
            complexityScore = cyclomaticComplexity;
            classes = complexityReport.aggregate.classes || 0;
            functions = complexityReport.functions.length;
            
            // Find longest function
            if (complexityReport.functions && complexityReport.functions.length > 0) {
              longestFunction = Math.max(...complexityReport.functions.map((f: any) => 
                f.sloc.physical || 0
              ));
            }
            
            // Check for high complexity issues
            const thresholds = this.qualityAssessor.getComplexityThresholds();
            
            if (cyclomaticComplexity > thresholds.function_complexity.poor) {
              issues.push(`High cyclomatic complexity: ${cyclomaticComplexity}`);
            }
            
            if (functions > 0 && complexityScore / functions > thresholds.function_complexity.poor) {
              issues.push(`High average function complexity: ${(complexityScore / functions).toFixed(2)}`);
            }
          } else {
            // If complexity-report also fails, use our custom analyzer
            const structure = ComplexityAnalyzer.analyzeCodeStructure(content, language);
            complexityScore = structure.complexityScore;
            classes = structure.classes;
            functions = structure.functions;
            longestFunction = structure.longestFunction;
            issues.push(...structure.issues);
            cyclomaticComplexity = ComplexityAnalyzer.calculateCyclomaticComplexity(content, language);
          }
        }
      } else {
        // Use custom analysis for other languages
        const structure = ComplexityAnalyzer.analyzeCodeStructure(content, language);
        complexityScore = structure.complexityScore;
        classes = structure.classes;
        functions = structure.functions;
        longestFunction = structure.longestFunction;
        issues.push(...structure.issues);
        cyclomaticComplexity = ComplexityAnalyzer.calculateCyclomaticComplexity(content, language);
      }
      
      // Count comment lines
      const { commentLines, totalLines } = LanguageUtils.countCommentLines(content, language);
      const commentRatio = totalLines > 0 ? commentLines / totalLines : 0;
      
      // Calculate maintainability index
      const maintainabilityIndex = ComplexityAnalyzer.calculateMaintainabilityIndex(
        cyclomaticComplexity, 
        totalLines, 
        commentRatio
      );
      
      return {
        complexity_score: complexityScore,
        classes,
        functions,
        longest_function_lines: longestFunction,
        comment_ratio: commentRatio,
        cyclomatic_complexity: cyclomaticComplexity,
        maintainability_index: maintainabilityIndex,
        total_lines: totalLines,
        issues,
        quality_assessment: 'moderate', // This will be replaced in the analyze method
        recommended_chunking: 'file_level' // This will be replaced in the analyze method
      };
    } catch (error) {
      logger.error(`Error analyzing file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return a minimal structure in case of error
      return {
        complexity_score: 0,
        classes: 0,
        functions: 0,
        comment_ratio: 0,
        total_lines: 0,
        issues: [`Error analyzing file: ${error instanceof Error ? error.message : String(error)}`],
        quality_assessment: 'problematic',
        recommended_chunking: 'file_level'
      };
    }
  }
}

// Re-export all the types and classes from the quality module
export * from './types';
export * from './complexity-analyzer';
export * from './eslint-analyzer';
export * from './language-utils';
export * from './quality-assessment';
