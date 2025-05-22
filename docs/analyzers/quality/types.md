# types.ts

**File Path:** `analyzers/quality/types.ts`

## Overview

Type definitions for code quality analysis

## Interfaces

### `QualityAnalysis`

**Properties:**

- `modules: Record<string, ModuleQuality>;`
- `files: Record<string, FileQuality>;`
- `problematic_files: ProblematicFile[];`
- `overall_assessment: OverallAssessment;`

### `ModuleQuality`

**Properties:**

- `complexity_score: number;`
- `test_coverage?: number;`
- `quality_assessment: QualityAssessment;`
- `total_lines: number;`
- `comment_ratio: number;`
- `files?: string[];`

### `FileQuality`

**Properties:**

- `complexity_score: number;`
- `test_coverage?: number;`
- `quality_assessment: QualityAssessment;`
- `classes: number;`
- `functions: number;`
- `longest_function_lines?: number;`
- `comment_ratio: number;`
- `cyclomatic_complexity?: number;`
- `maintainability_index?: number;`
- `recommended_chunking: ChunkingStrategy;`
- `total_lines: number;`
- `issues: string[];`

### `ProblematicFile`

**Properties:**

- `file_path: string;`
- `issues: string[];`
- `handling_strategy: 'refactor' | 'ignore' | 'special_handling';`

### `OverallAssessment`

**Properties:**

- `score: number; // 0-100`
- `grade: 'A' | 'B' | 'C' | 'D' | 'F';`
- `strengths: string[];`
- `weaknesses: string[];`
- `improvement_suggestions: string[];`

### `CodeStructureAnalysis`

**Properties:**

- `classes: number;`
- `functions: number;`
- `longestFunction: number;`
- `complexityScore: number;`
- `issues: string[];`

### `CommentAnalysis`

**Properties:**

- `commentLines: number;`
- `totalLines: number;`

### `ESLintAnalysisResult`

**Properties:**

- `issues: string[];`
- `complexityScore: number;`
- `classes: number;`
- `functions: number;`
- `longestFunction: number;`
- `cyclomaticComplexity: number;`

### `ComplexityThresholds`

**Properties:**

- `excellent: number;`
- `good: number;`
- `moderate: number;`
- `poor: number;`

### `ComplexityReport`

**Properties:**

- `aggregate: {`
- `cyclomatic: number;`
- `classes: number;`
- `};`
- `functions: Array<{`
- `name: string;`
- `sloc: {`
- `physical: number;`
- `};`
- `}>;`

