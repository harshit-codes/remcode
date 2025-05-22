# guidelines.ts

**File Path:** `swe/guidelines.ts`

## Overview

Priority levels for coding guidelines

## Dependencies

- `../utils/logger`

## Classes

### `SWEGuidelines`

**Class Definition:**

```typescript
export class SWEGuidelines {
  /**
   * Get all available coding standards
   */
  getCodingStandards(): CodingGuideline[] {
    return [
      {
        id: 'naming-conventions',
        title: 'Naming Conventions',
        description: 'Consistent naming across the codebase',
        rules: [
          'Use camelCase for variables and function names',
          'Use PascalCase for classes, interfaces, and type names',
          'Use UPPER_SNAKE_CASE for constants',
          'Boolean variables should be prefixed with is, has, should, etc.',
          'Use descriptive names that reflect the purpose'
        ],
        priority: 'high',
        examples: {
          good: 'const isUserLoggedIn = true;\nclass UserRepository {}',
          bad: 'const flag = true;\nclass repo {}'
        },
        category: 'code-style',
        tags: ['naming', 'readability']
      },
      {
        id: 'error-handling',
        title: 'Error Handling',
        description: 'Robust error handling patterns',
        rules: [
          'Always handle errors in async functions with try-catch',
          'Log meaningful error messages with contextual information',
          'Consider using custom error classes for different error types',
          'Propagate errors when appropriate, handle them when possible',
          'Never swallow errors without logging'
        ],
        priority: 'critical',
        examples: {
          good: 'try {\n  await api.getData();\n} catch (error) {\n  logger.error(\'Failed to get data\', error);\n}',
          bad: 'api.getData().catch(() => {});'
        },
        category: 'reliability',
        tags: ['error-handling', 'robustness']
      },
      {
        id: 'code-comments',
        title: 'Code Comments',
        description: 'Effective use of comments to explain complex logic',
        rules: [
          'Use JSDoc for public APIs and interfaces',
          'Explain "why" not "what" in comments',
          'Keep comments up-to-date with code changes',
          'Use TODO, FIXME with specific details and ticket numbers',
          'Document non-obvious decisions and edge cases'
        ],
        priority: 'medium',
        examples: {
          good: '// Throttle API calls to avoid rate limiting\nconst throttledFn = throttle(apiCall, 1000);',
          bad: '// Call function\ncallFn();'
        },
        category: 'documentation',
        tags: ['comments', 'documentation']
      },
      {
        id: 'type-safety',
        title: 'Type Safety',
        description: 'Proper use of TypeScript types for safer code',
        rules: [
          'Avoid using `any` type when possible',
          'Use interfaces for complex object structures',
          'Define return types for functions explicitly',
          'Use type guards for runtime type checking',
          'Leverage union types and generics for flexible APIs'
        ],
        priority: 'high',
        category: 'code-quality',
        tags: ['typescript', 'type-safety']
      },
      {
        id: 'testing-practices',
        title: 'Testing Practices',
        description: 'Comprehensive testing strategies',
        rules: [
          'Write unit tests for business logic',
          'Include edge cases in test coverage',
          'Use descriptive test names that explain the expected behavior',
          'Follow AAA pattern (Arrange-Act-Assert)',
          'Mock external dependencies in unit tests'
        ],
        priority: 'high',
        category: 'quality-assurance',
        tags: ['testing', 'quality']
      },
      {
        id: 'security-practices',
        title: 'Security Practices',
        description: 'Code patterns for secure applications',
        rules: [
          'Validate and sanitize all user inputs',
          'Use parameterized queries for database operations',
          'Implement proper authentication and authorization checks',
          'Never store sensitive information in client-side code',
          'Apply the principle of least privilege'
        ],
        priority: 'critical',
        category: 'security',
        tags: ['security', 'validation']
      }
    ];
  }

  /**
   * Get a specific guideline by ID
   */
  getGuideline(id: string): CodingGuideline | null {
    return this.getCodingStandards().find(g => g.id === id) || null;
  }

  /**
   * Get guidelines by category
   */
  getGuidelinesByCategory(category: string): CodingGuideline[] {
    return this.getCodingStandards().filter(g => g.category === category);
  }
  
  /**
   * Get guidelines by priority
   */
  getGuidelinesByPriority(priority: GuidlinePriority): CodingGuideline[] {
    return this.getCodingStandards().filter(g => g.priority === priority);
  }

  /**
   * Validate code against the guidelines
   */
  validateCode(code: string): ValidationIssue[] {
    logger.info('Validating code against guidelines');
    const issues: ValidationIssue[] = [];
    
    // Naming conventions check
    if (code.match(/const [A-Z]/) || code.match(/let [A-Z]/)) {
      issues.push({
        guidelineId: 'naming-conventions',
        message: 'Variable names should use camelCase, not PascalCase',
        severity: 'medium'
      });
    }
    
    // Error handling check
    const asyncWithoutTryCatch = code.includes('async') && 
                               !code.includes('try') && 
                               (code.includes('await') || code.includes('.then('));
    if (asyncWithoutTryCatch) {
      issues.push({
        guidelineId: 'error-handling',
        message: 'Async operations should use try-catch for error handling',
        severity: 'high'
      });
    }
    
    // Type safety check
    if (code.includes(': any') || code.includes('as any')) {
      issues.push({
        guidelineId: 'type-safety',
        message: 'Avoid using the "any" type when possible',
        severity: 'medium'
      });
    }
    
    // Empty catch blocks
    if (code.match(/catch[\s\S]*?\([\s\S]*?\)[\s\S]*?{[\s\S]*?}/)) {
      const emptyCatchRegex = /catch[\s\S]*?\([\s\S]*?\)[\s\S]*?{[\s\S]*?}/g;
      const catches = code.match(emptyCatchRegex) || [];
      
      for (const catchBlock of catches) {
        if (catchBlock.replace(/\s+/g, '').match(/catch\([^)]*\){}/)) {
          issues.push({
            guidelineId: 'error-handling',
            message: 'Empty catch blocks should at least include logging',
            severity: 'high'
          });
          break;
        }
      }
    }
    
    logger.debug(`Validation complete: found ${issues.length} issues`);
    return issues;
  }
}
```

**Methods:**

- `getCodingStandards()`
- `catch()`
- `throttle()`
- `pattern()`
- `getGuideline()`
- `getGuidelinesByCategory()`
- `getGuidelinesByPriority()`
- `validateCode()`
- `if()`
- `if()`
- `if()`
- `if()`
- `for()`
- `if()`

## Interfaces

### `CodingGuideline`

**Interface Definition:**

```typescript
export interface CodingGuideline {
  id: string;
  title: string;
  description: string;
  rules: string[];
  priority: GuidlinePriority;
  examples?: {
    good?: string;
    bad?: string;
  };
  category: string;
  tags: string[];
}
```

### `ValidationIssue`

**Interface Definition:**

```typescript
export interface ValidationIssue {
  guidelineId: string;
  message: string;
  severity: GuidlinePriority;
  lineNumber?: number;
  column?: number;
  suggestedFix?: string;
}
```

