# types.ts

**File Path:** `analyzers/quality/types.ts`

## Overview

Type definitions for code quality analysis

## Dependencies

- `../../vectorizers/types`

## Interfaces

### `QualityAnalysis`

**Interface Definition:**

```typescript
export interface QualityAnalysis {
  modules: Record<string, ModuleQuality>;
  files: Record<string, FileQuality>;
  problematic_files: ProblematicFile[];
  overall_assessment: OverallAssessment;
}
```

### `ModuleQuality`

**Interface Definition:**

```typescript
export interface ModuleQuality {
  complexity_score: number;
  test_coverage?: number;
  quality_assessment: QualityAssessment;
  total_lines: number;
  comment_ratio: number;
  files?: string[];
}
```

### `FileQuality`

**Interface Definition:**

```typescript
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
```

### `ProblematicFile`

**Interface Definition:**

```typescript
export interface ProblematicFile {
  file_path: string;
  issues: string[];
  handling_strategy: 'refactor' | 'ignore' | 'special_handling';
}
```

### `OverallAssessment`

**Interface Definition:**

```typescript
export interface OverallAssessment {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
}
```

### `CodeStructureAnalysis`

**Interface Definition:**

```typescript
export interface CodeStructureAnalysis {
  classes: number;
  functions: number;
  longestFunction: number;
  complexityScore: number;
  issues: string[];
}
```

### `CommentAnalysis`

**Interface Definition:**

```typescript
export interface CommentAnalysis {
  commentLines: number;
  totalLines: number;
}
```

### `ESLintAnalysisResult`

**Interface Definition:**

```typescript
export interface ESLintAnalysisResult {
  issues: string[];
  complexityScore: number;
  classes: number;
  functions: number;
  longestFunction: number;
  cyclomaticComplexity: number;
}
```

### `ComplexityThresholds`

**Interface Definition:**

```typescript
export interface ComplexityThresholds {
  excellent: number;
  good: number;
  moderate: number;
  poor: number;
}
```

### `ComplexityReport`

**Interface Definition:**

```typescript
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
```

