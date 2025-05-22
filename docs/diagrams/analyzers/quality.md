# quality Entity Relationship Diagram

```mermaid
classDiagram
  class ComplexityAnalyzer {
    analyzeCodeStructure(): CodeStructureAnalysis
    if()
    for()
    if()
    if()
    if()
    if()
    if()
    functions()
    if()
    for()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    functions()
    calculateCyclomaticComplexity(): number
    if()
    if()
    ln()
    ln()
    sin()
    Volume()
    calculateMaintainabilityIndex(): number
    analyzeWithComplexityReport(): ComplexityReport | null
    catch()
    String()
  }
  class ESLintAnalyzer {
    eslint: ESLint | null = null
    initializeESLint(): void
    ESLint()
    catch()
    String()
    analyzeFile(): Promise<ESLintAnalysisResult | null>
    if()
    if()
    for()
    score()
    catch()
    String()
  }
  class CodeQualityAnalyzer {
    repoPath: string
    eslintAnalyzer: ESLintAnalyzer
    qualityAssessor: QualityAssessor
    ESLintAnalyzer()
    QualityAssessor()
    analyze(): Promise<QualityAnalysis>
    for()
    if()
    catch()
    String()
    module()
    for()
    if()
    for()
    findCodeFiles(): Promise<string[]>
    for()
    analyzeFile(): Promise<FileQuality>
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    catch()
    String()
    String()
  }
  class LanguageUtils {
    detectLanguage(): string
    for()
    if()
    file()
    isSourceCodeFile(): boolean
    getAllExtensions(): string[]
    countCommentLines(): 
    if()
    comments()
    for()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    comments()
    for()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    for()
    if()
    if()
    if()
    if()
  }
  class QualityAssessor {
    complexityThresholds: Record<string, ComplexityThresholds>
    getComplexityThresholds(): Record<string, ComplexityThresholds>
    assessFileQuality(): QualityAssessment
    complexity()
    if()
    if()
    if()
    if()
    ratio()
    if()
    if()
    if()
    if()
    maintainability()
    if()
    if()
    if()
    if()
    issues()
    if()
    if()
    if()
    if()
    determineChunkingStrategy(): ChunkingStrategy
    if()
    if()
    if()
    if()
    assessModuleQuality(): QualityAssessment
    complexity()
    if()
    if()
    if()
    if()
    coverage()
    if()
    if()
    if()
    if()
    ratio()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    generateOverallAssessment(): OverallAssessment
    for()
    switch()
    for()
    switch()
    score()
    if()
    if()
    if()
    if()
    for()
    if()
    if()
    if()
    for()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    for()
    if()
    if()
    for()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
  }
  class QualityAnalysis {
    <<interface>>
    modules: Record<string, ModuleQuality>
    files: Record<string, FileQuality>
    problematic_files: ProblematicFile[]
    overall_assessment: OverallAssessment
  }
  class ModuleQuality {
    <<interface>>
    complexity_score: number
    test_coverage: number
    quality_assessment: QualityAssessment
    total_lines: number
    comment_ratio: number
    files: string[]
  }
  class FileQuality {
    <<interface>>
    complexity_score: number
    test_coverage: number
    quality_assessment: QualityAssessment
    classes: number
    functions: number
    longest_function_lines: number
    comment_ratio: number
    cyclomatic_complexity: number
    maintainability_index: number
    recommended_chunking: ChunkingStrategy
    total_lines: number
    issues: string[]
  }
  class ProblematicFile {
    <<interface>>
    file_path: string
    issues: string[]
    handling_strategy: 'refactor' | 'ignore' | 'special_handling'
  }
  class OverallAssessment {
    <<interface>>
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    strengths: string[]
    weaknesses: string[]
    improvement_suggestions: string[]
  }
  class CodeStructureAnalysis {
    <<interface>>
    classes: number
    functions: number
    longestFunction: number
    complexityScore: number
    issues: string[]
  }
  class CommentAnalysis {
    <<interface>>
    commentLines: number
    totalLines: number
  }
  class ESLintAnalysisResult {
    <<interface>>
    issues: string[]
    complexityScore: number
    classes: number
    functions: number
    longestFunction: number
    cyclomaticComplexity: number
  }
  class ComplexityThresholds {
    <<interface>>
    excellent: number
    good: number
    moderate: number
    poor: number
  }
  class ComplexityReport {
    <<interface>>
    aggregate: {
    cyclomatic: number
    classes: number
    functions: Array<{
    name: string
    sloc: {
    physical: number
  }

  %% Inheritance relationships

  %% Usage relationships
  ComplexityAnalyzer --> QualityAnalysis: uses
  ComplexityAnalyzer --> ModuleQuality: uses
  ComplexityAnalyzer --> FileQuality: uses
  ComplexityAnalyzer --> ProblematicFile: uses
  ComplexityAnalyzer --> OverallAssessment: uses
  ComplexityAnalyzer --> CodeStructureAnalysis: uses
  ComplexityAnalyzer --> CommentAnalysis: uses
  ComplexityAnalyzer --> ESLintAnalysisResult: uses
  ComplexityAnalyzer --> ComplexityThresholds: uses
  ComplexityAnalyzer --> ComplexityReport: uses
  ESLintAnalyzer --> QualityAnalysis: uses
  ESLintAnalyzer --> ModuleQuality: uses
  ESLintAnalyzer --> FileQuality: uses
  ESLintAnalyzer --> ProblematicFile: uses
  ESLintAnalyzer --> OverallAssessment: uses
  ESLintAnalyzer --> CodeStructureAnalysis: uses
  ESLintAnalyzer --> CommentAnalysis: uses
  ESLintAnalyzer --> ESLintAnalysisResult: uses
  ESLintAnalyzer --> ComplexityThresholds: uses
  ESLintAnalyzer --> ComplexityReport: uses
  CodeQualityAnalyzer --> QualityAnalysis: uses
  CodeQualityAnalyzer --> ModuleQuality: uses
  CodeQualityAnalyzer --> FileQuality: uses
  CodeQualityAnalyzer --> ProblematicFile: uses
  CodeQualityAnalyzer --> OverallAssessment: uses
  CodeQualityAnalyzer --> CodeStructureAnalysis: uses
  CodeQualityAnalyzer --> CommentAnalysis: uses
  CodeQualityAnalyzer --> ESLintAnalysisResult: uses
  CodeQualityAnalyzer --> ComplexityThresholds: uses
  CodeQualityAnalyzer --> ComplexityReport: uses
  CodeQualityAnalyzer --> ESLintAnalyzer: uses
  CodeQualityAnalyzer --> ComplexityAnalyzer: uses
  CodeQualityAnalyzer --> LanguageUtils: uses
  CodeQualityAnalyzer --> QualityAssessor: uses
  QualityAssessor --> QualityAnalysis: uses
  QualityAssessor --> ModuleQuality: uses
  QualityAssessor --> FileQuality: uses
  QualityAssessor --> ProblematicFile: uses
  QualityAssessor --> OverallAssessment: uses
  QualityAssessor --> CodeStructureAnalysis: uses
  QualityAssessor --> CommentAnalysis: uses
  QualityAssessor --> ESLintAnalysisResult: uses
  QualityAssessor --> ComplexityThresholds: uses
  QualityAssessor --> ComplexityReport: uses

  %% Style and notes
  note "Generated from folder: quality" as Note1

  %% File groupings
  note "complexity-analyzer.ts" as Note_complexity-analyzer
  note "eslint-analyzer.ts" as Note_eslint-analyzer
  note "index.ts" as Note_index
  note "language-utils.ts" as Note_language-utils
  note "quality-assessment.ts" as Note_quality-assessment
  note "types.ts" as Note_types
```
