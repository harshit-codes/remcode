# quality-assessment.ts

**File Path:** `analyzers/quality/quality-assessment.ts`

## Overview

Handles quality assessment and scoring

## Dependencies

- `./types`

## Classes

### `QualityAssessor`

**Class Definition:**

```typescript
export class QualityAssessor {
  private complexityThresholds: Record<string, ComplexityThresholds>;

  constructor() {
    // Complexity thresholds for different types of metrics
    this.complexityThresholds = {
      function_complexity: {
        excellent: 5,
        good: 10,
        moderate: 20,
        poor: 30
      },
      file_complexity: {
        excellent: 20,
        good: 40,
        moderate: 80,
        poor: 120
      },
      comment_ratio: {
        excellent: 0.25, // 25%
        good: 0.15,
        moderate: 0.1,
        poor: 0.05
      },
      function_length: {
        excellent: 25,
        good: 50,
        moderate: 100,
        poor: 150
      },
      test_coverage: {
        excellent: 0.8, // 80%
        good: 0.6,
        moderate: 0.4,
        poor: 0.2
      },
    };
  }

  /**
   * Get the complexity thresholds
   */
  public getComplexityThresholds(): Record<string, ComplexityThresholds> {
    return this.complexityThresholds;
  }

  /**
   * Assesses the quality of a file based on its metrics
   */
  public assessFileQuality(fileAnalysis: any): QualityAssessment {
    // Weight different factors
    const complexityWeight = 0.3;
    const commentWeight = 0.2;
    const maintainabilityWeight = 0.3;
    const issuesWeight = 0.2;
    
    // Score complexity (lower is better)
    let complexityScore = 0;
    if (fileAnalysis.complexity_score <= this.complexityThresholds.file_complexity.excellent) {
      complexityScore = 4;
    } else if (fileAnalysis.complexity_score <= this.complexityThresholds.file_complexity.good) {
      complexityScore = 3;
    } else if (fileAnalysis.complexity_score <= this.complexityThresholds.file_complexity.moderate) {
      complexityScore = 2;
    } else if (fileAnalysis.complexity_score <= this.complexityThresholds.file_complexity.poor) {
      complexityScore = 1;
    }
    
    // Score comment ratio (higher is better)
    let commentScore = 0;
    if (fileAnalysis.comment_ratio >= this.complexityThresholds.comment_ratio.excellent) {
      commentScore = 4;
    } else if (fileAnalysis.comment_ratio >= this.complexityThresholds.comment_ratio.good) {
      commentScore = 3;
    } else if (fileAnalysis.comment_ratio >= this.complexityThresholds.comment_ratio.moderate) {
      commentScore = 2;
    } else if (fileAnalysis.comment_ratio >= this.complexityThresholds.comment_ratio.poor) {
      commentScore = 1;
    }
    
    // Score maintainability (higher is better)
    let maintainabilityScore = 0;
    if (fileAnalysis.maintainability_index >= 85) {
      maintainabilityScore = 4;
    } else if (fileAnalysis.maintainability_index >= 65) {
      maintainabilityScore = 3;
    } else if (fileAnalysis.maintainability_index >= 40) {
      maintainabilityScore = 2;
    } else if (fileAnalysis.maintainability_index >= 20) {
      maintainabilityScore = 1;
    }
    
    // Score issues (fewer is better)
    const issuesScore = fileAnalysis.issues ? Math.max(0, 4 - fileAnalysis.issues.length) : 4;
    
    // Calculate weighted score
    const totalScore = 
      complexityScore * complexityWeight +
      commentScore * commentWeight +
      maintainabilityScore * maintainabilityWeight +
      issuesScore * issuesWeight;
    
    // Convert to quality assessment
    if (totalScore >= 3.5) return 'excellent';
    if (totalScore >= 2.5) return 'good';
    if (totalScore >= 1.5) return 'moderate';
    if (totalScore >= 0.5) return 'poor';
    return 'problematic';
  }

  /**
   * Determines the most appropriate chunking strategy for a file
   */
  public determineChunkingStrategy(fileAnalysis: any): ChunkingStrategy {
    // Determine based on file structure and complexity
    if (fileAnalysis.classes > 0 && fileAnalysis.functions >= 5) {
      // Complex class-based file - use class-level chunking
      return 'class_level';
    } else if (fileAnalysis.functions >= 3) {
      // Multiple functions - use function-level chunking
      return 'function_level';
    } else if (fileAnalysis.total_lines < 100) {
      // Small file - use file-level chunking
      return 'file_level';
    } else if (fileAnalysis.complexity_score > 7) {
      // Complex file - use sliding window with high overlap
      return 'sliding_window_with_overlap';
    } else {
      // Default to sliding window
      return 'sliding_window';
    }
  }

  /**
   * Assesses the quality of a module based on its metrics
   */
  public assessModuleQuality(module: any): QualityAssessment {
    // Weight different factors
    const complexityWeight = 0.4;
    const testCoverageWeight = 0.4;
    const commentWeight = 0.2;
    
    // Score complexity (lower is better)
    let complexityScore = 0;
    if (module.complexity_score <= this.complexityThresholds.file_complexity.excellent) {
      complexityScore = 4;
    } else if (module.complexity_score <= this.complexityThresholds.file_complexity.good) {
      complexityScore = 3;
    } else if (module.complexity_score <= this.complexityThresholds.file_complexity.moderate) {
      complexityScore = 2;
    } else if (module.complexity_score <= this.complexityThresholds.file_complexity.poor) {
      complexityScore = 1;
    }
    
    // Score test coverage (higher is better)
    let testCoverageScore = 0;
    if (module.test_coverage >= this.complexityThresholds.test_coverage.excellent * 100) {
      testCoverageScore = 4;
    } else if (module.test_coverage >= this.complexityThresholds.test_coverage.good * 100) {
      testCoverageScore = 3;
    } else if (module.test_coverage >= this.complexityThresholds.test_coverage.moderate * 100) {
      testCoverageScore = 2;
    } else if (module.test_coverage >= this.complexityThresholds.test_coverage.poor * 100) {
      testCoverageScore = 1;
    }
    
    // Score comment ratio (higher is better)
    let commentScore = 0;
    if (module.comment_ratio >= this.complexityThresholds.comment_ratio.excellent) {
      commentScore = 4;
    } else if (module.comment_ratio >= this.complexityThresholds.comment_ratio.good) {
      commentScore = 3;
    } else if (module.comment_ratio >= this.complexityThresholds.comment_ratio.moderate) {
      commentScore = 2;
    } else if (module.comment_ratio >= this.complexityThresholds.comment_ratio.poor) {
      commentScore = 1;
    }
    
    // Calculate weighted score
    const totalScore = 
      complexityScore * complexityWeight +
      testCoverageScore * testCoverageWeight +
      commentScore * commentWeight;
    
    // Convert to quality assessment
    if (totalScore >= 3.5) return 'excellent';
    if (totalScore >= 2.5) return 'good';
    if (totalScore >= 1.5) return 'moderate';
    if (totalScore >= 0.5) return 'poor';
    return 'problematic';
  }

  /**
   * Generates an overall assessment of the repository
   */
  public generateOverallAssessment(
    modules: Record<string, any>, 
    files: Record<string, any>, 
    problematicFiles: Array<{file_path: string; issues: string[]; handling_strategy: 'refactor' | 'ignore' | 'special_handling'}>
  ): OverallAssessment {
    // Calculate overall score
    let moduleScores = 0;
    let fileScores = 0;
    let totalModules = 0;
    let totalFiles = 0;
    
    // Assess modules
    for (const modulePath in modules) {
      const module = modules[modulePath];
      let score = 0;
      
      switch (module.quality_assessment) {
        case 'excellent': score = 100; break;
        case 'good': score = 80; break;
        case 'moderate': score = 60; break;
        case 'poor': score = 40; break;
        case 'problematic': score = 20; break;
      }
      
      moduleScores += score;
      totalModules++;
    }
    
    // Assess files
    for (const filePath in files) {
      const file = files[filePath];
      let score = 0;
      
      switch (file.quality_assessment) {
        case 'excellent': score = 100; break;
        case 'good': score = 80; break;
        case 'moderate': score = 60; break;
        case 'poor': score = 40; break;
        case 'problematic': score = 20; break;
      }
      
      fileScores += score;
      totalFiles++;
    }
    
    // Calculate averages
    const avgModuleScore = totalModules > 0 ? moduleScores / totalModules : 0;
    const avgFileScore = totalFiles > 0 ? fileScores / totalFiles : 0;
    
    // Weighted score (40% modules, 60% files)
    const overallScore = Math.round(avgModuleScore * 0.4 + avgFileScore * 0.6);
    
    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';
    
    // Identify strengths
    const strengths: string[] = [];
    let excellentModules = 0;
    let goodModules = 0;
    let excellentFiles = 0;
    let goodFiles = 0;
    let wellDocumented = 0;
    
    for (const modulePath in modules) {
      if (modules[modulePath].quality_assessment === 'excellent') excellentModules++;
      if (modules[modulePath].quality_assessment === 'good') goodModules++;
      if (modules[modulePath].comment_ratio >= this.complexityThresholds.comment_ratio.good) wellDocumented++;
    }
    
    for (const filePath in files) {
      if (files[filePath].quality_assessment === 'excellent') excellentFiles++;
      if (files[filePath].quality_assessment === 'good') goodFiles++;
    }
    
    if (excellentModules > 0) {
      strengths.push(`${excellentModules} modules have excellent quality`);
    }
    if (goodModules > 0) {
      strengths.push(`${goodModules} modules have good quality`);
    }
    if (excellentFiles > 0) {
      strengths.push(`${excellentFiles} files have excellent quality`);
    }
    if (wellDocumented > 0) {
      strengths.push(`${wellDocumented} modules are well-documented`);
    }
    
    // Identify weaknesses
    const weaknesses: string[] = [];
    if (problematicFiles.length > 0) {
      weaknesses.push(`${problematicFiles.length} problematic files identified`);
    }
    
    let poorModules = 0;
    let problematicModules = 0;
    let poorFiles = 0;
    let problemFiles = 0;
    
    for (const modulePath in modules) {
      if (modules[modulePath].quality_assessment === 'poor') poorModules++;
      if (modules[modulePath].quality_assessment === 'problematic') problematicModules++;
    }
    
    for (const filePath in files) {
      if (files[filePath].quality_assessment === 'poor') poorFiles++;
      if (files[filePath].quality_assessment === 'problematic') problemFiles++;
    }
    
    if (poorModules > 0) {
      weaknesses.push(`${poorModules} modules have poor quality`);
    }
    if (problematicModules > 0) {
      weaknesses.push(`${problematicModules} modules have problematic quality`);
    }
    if (poorFiles > 0) {
      weaknesses.push(`${poorFiles} files have poor quality`);
    }
    if (problemFiles > 0) {
      weaknesses.push(`${problemFiles} files have problematic quality`);
    }
    
    // Generate improvement suggestions
    const improvementSuggestions: string[] = [];
    
    if (problematicFiles && problematicFiles.length > 0) {
      improvementSuggestions.push('Refactor problematic files to reduce complexity and improve maintainability');
    }
    
    const lowCoverageModules = Object.values(modules).filter(m => (m.test_coverage || 0) < 40).length;
    if (lowCoverageModules > 0) {
      improvementSuggestions.push(`Increase test coverage for ${lowCoverageModules} modules with low coverage`);
    }
    
    const poorlyDocumentedModules = Object.values(modules).filter(m => m.comment_ratio < this.complexityThresholds.comment_ratio.poor).length;
    if (poorlyDocumentedModules > 0) {
      improvementSuggestions.push(`Improve documentation for ${poorlyDocumentedModules} poorly documented modules`);
    }
    
    // Add more generic suggestions if needed
    if (improvementSuggestions.length === 0) {
      improvementSuggestions.push('Continue maintaining code quality through regular reviews');
      improvementSuggestions.push('Consider adding more comprehensive unit tests');
      improvementSuggestions.push('Keep documentation up-to-date as the codebase evolves');
    }
    
    return {
      score: overallScore,
      grade,
      strengths,
      weaknesses,
      improvement_suggestions: improvementSuggestions
    };
  }
}
```

**Methods:**

#### `getComplexityThresholds()`

Get the complexity thresholds

```typescript
getComplexityThresholds(): Record<string, ComplexityThresholds> {
```

#### `assessFileQuality()`

Assesses the quality of a file based on its metrics

```typescript
assessFileQuality(fileAnalysis: any): QualityAssessment {
    // Weight different factors
```

#### `determineChunkingStrategy()`

Determines the most appropriate chunking strategy for a file

```typescript
determineChunkingStrategy(fileAnalysis: any): ChunkingStrategy {
    // Determine based on file structure and complexity
```

#### `assessModuleQuality()`

Assesses the quality of a module based on its metrics

```typescript
assessModuleQuality(module: any): QualityAssessment {
    // Weight different factors
```

#### `generateOverallAssessment()`

Generates an overall assessment of the repository

```typescript
generateOverallAssessment(
```

#### `if()`

```typescript
if (overallScore >= 80) grade = 'B';
```

#### `if()`

```typescript
if (overallScore >= 70) grade = 'C';
```

#### `if()`

```typescript
if (overallScore >= 60) grade = 'D';
```

