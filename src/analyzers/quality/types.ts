/**
 * Type definitions for code quality analysis
 */

/**
 * Represents a detailed code quality analysis of a repository
 */
export interface QualityAnalysis {
  modules: Record<string, ModuleQuality>;
  files: Record<string, FileQuality>;
  problematic_files: ProblematicFile[];
  overall_assessment: OverallAssessment;
}

export interface ModuleQuality {
  complexity_score: number;
  test_coverage?: number;
  quality_assessment: QualityAssessment;
  total_lines: number;
  comment_ratio: number;
  files?: string[];
}

export interface FileQuality {
  complexity_score: number;
  test_coverage?: number;
  quality_assessment: QualityAssessment;
  classes: number;
  functions: number;
  longest_function_lines?: number;
  comment_ratio: number;
  cyclomatic_complexity?: number;
  maintainability_index?: number;
  recommended_chunking: ChunkingStrategy;
  total_lines: number;
  issues: string[];
}

export interface ProblematicFile {
  file_path: string;
  issues: string[];
  handling_strategy: 'refactor' | 'ignore' | 'special_handling';
}

export interface OverallAssessment {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
}

export interface CodeStructureAnalysis {
  classes: number;
  functions: number;
  longestFunction: number;
  complexityScore: number;
  issues: string[];
}

export interface CommentAnalysis {
  commentLines: number;
  totalLines: number;
}

export interface ESLintAnalysisResult {
  issues: string[];
  complexityScore: number;
  classes: number;
  functions: number;
  longestFunction: number;
  cyclomaticComplexity: number;
}

/**
 * Complexity thresholds for scoring
 */
export interface ComplexityThresholds {
  excellent: number;
  good: number;
  moderate: number;
  poor: number;
}

// Create a simple interface for complexity-report as it lacks TypeScript definitions
export interface ComplexityReport {
  aggregate: {
    cyclomatic: number;
    classes: number;
  };
  functions: Array<{
    name: string;
    sloc: {
      physical: number;
    };
  }>;
}

import { ChunkStrategyType } from '../../vectorizers/types';

// Re-export for convenience
export { ChunkStrategyType } from '../../vectorizers/types';

export type QualityAssessment = 'excellent' | 'good' | 'moderate' | 'poor' | 'problematic';
export type ChunkingStrategy = ChunkStrategyType;
