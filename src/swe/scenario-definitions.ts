import { PromptType } from './prompts';
import { DifficultyLevel, Scenario } from './scenarios';

/**
 * Complete scenario definitions for all 13 software engineering contexts
 */
export const SCENARIO_DEFINITIONS: Scenario[] = [
  {
    id: 'refactoring',
    name: 'Code Refactoring',
    description: 'Improving existing code structure and quality without changing functionality',
    triggers: [
      'refactor', 'clean up', 'improve', 'restructure', 'simplify', 'optimize code', 
      'reduce complexity', 'make more readable', 'technical debt', 'code smell',
      'extract method', 'rename', 'move method', 'split class', 'consolidate'
    ],
    negativePatterns: ['add feature', 'implement new', 'create functionality', 'new requirement'],
    tools: ['search_code', 'find_similar_code', 'get_code_context'],
    difficulty: DifficultyLevel.INTERMEDIATE,
    promptType: PromptType.REFACTORING,
    estimatedTime: '1-4 hours',
    requiredSkills: ['design patterns', 'SOLID principles', 'clean code principles'],
    examples: [
      'Extract this method into smaller functions', 
      'Convert this class to use composition instead of inheritance',
      'Reduce the complexity of this function'
    ],
    tags: ['refactoring', 'code quality', 'maintenance']
  },
  {
    id: 'new_feature',
    name: 'New Feature Development',
    description: 'Adding new functionality to the codebase',
    triggers: [
      'add feature', 'implement', 'create', 'develop new', 'build functionality', 
      'new capability', 'enhance with', 'extend to include', 'add support for',
      'integrate', 'introduce', 'enable', 'provide', 'allow users to'
    ],
    negativePatterns: ['fix bug', 'resolve issue', 'troubleshoot', 'broken'],
    tools: ['search_code', 'get_code_context', 'analyze_file_structure'],
    difficulty: DifficultyLevel.INTERMEDIATE,
    promptType: PromptType.NEW_FEATURE,
    estimatedTime: '2-8 hours',
    requiredSkills: ['software design', 'testing', 'domain knowledge'],
    examples: [
      'Add a user authentication feature', 
      'Implement export to PDF functionality',
      'Create a new API endpoint'
    ],
    tags: ['feature', 'development', 'enhancement']
  },
  {
    id: 'bug_fixing',
    name: 'Bug Fixing',
    description: 'Identifying and resolving defects in the code',
    triggers: [
      'fix bug', 'resolve issue', 'troubleshoot', 'fix error', 'solve problem', 
      'not working', 'incorrect behavior', 'unexpected result', 'crash', 'fails',
      'debug', 'broken', 'exception', 'error message', 'malfunction'
    ],
    negativePatterns: ['add feature', 'new capability', 'enhancement'],
    tools: ['search_code', 'find_similar_code', 'get_code_context'],
    difficulty: DifficultyLevel.INTERMEDIATE,
    promptType: PromptType.BUG_FIXING,
    estimatedTime: '30min-3 hours',
    requiredSkills: ['debugging', 'problem-solving', 'root cause analysis'],
    examples: [
      'Fix the login error when using special characters', 
      'Resolve the calculation issue in the reporting module',
      'Debug why the API returns 500 errors'
    ],
    tags: ['bug', 'fix', 'defect', 'issue']
  },
  {
    id: 'performance',
    name: 'Performance Optimization',
    description: 'Improving system efficiency, speed, and resource utilization',
    triggers: [
      'optimize performance', 'speed up', 'improve efficiency', 'reduce latency', 
      'memory usage', 'cpu usage', 'faster execution', 'slow', 'bottleneck',
      'performance issue', 'timeout', 'scalability', 'resource consumption'
    ],
    negativePatterns: ['add feature', 'new functionality'],
    tools: ['search_code', 'find_similar_code', 'get_code_context'],
    difficulty: DifficultyLevel.ADVANCED,
    promptType: PromptType.PERFORMANCE,
    estimatedTime: '2-6 hours',
    requiredSkills: ['algorithmic complexity', 'profiling tools', 'performance measurement'],
    examples: [
      'Optimize this database query that\'s running slowly', 
      'Reduce the memory usage of this processing function',
      'Improve the response time of this API endpoint'
    ],
    tags: ['performance', 'optimization', 'speed', 'efficiency']
  },
  {
    id: 'security',
    name: 'Security Analysis & Hardening',
    description: 'Identifying vulnerabilities and implementing robust security measures',
    triggers: [
      'security review', 'security check', 'vulnerability assessment', 'find vulnerabilities', 
      'secure the code', 'penetration testing', 'security audit', 'authentication',
      'authorization', 'encryption', 'xss', 'sql injection', 'csrf', 'security flaw'
    ],
    negativePatterns: ['performance', 'new feature'],
    tools: ['search_code', 'find_similar_code', 'get_code_context'],
    difficulty: DifficultyLevel.ADVANCED,
    promptType: PromptType.SECURITY,
    estimatedTime: '2-5 hours',
    requiredSkills: ['security principles', 'OWASP knowledge', 'threat modeling'],
    examples: [
      'Review this authentication code for security issues', 
      'Check for SQL injection vulnerabilities',
      'Secure this API endpoint against unauthorized access'
    ],
    tags: ['security', 'vulnerability', 'safety']
  },
  {
    id: 'testing',
    name: 'Test Development & Coverage',
    description: 'Creating comprehensive testing strategies for code reliability',
    triggers: [
      'create tests', 'add unit tests', 'improve test coverage', 'integration tests', 
      'write tests', 'test scenarios', 'test cases', 'testing strategy', 'test plan',
      'mock', 'stub', 'test data', 'test automation', 'quality assurance'
    ],
    negativePatterns: ['production code', 'business logic'],
    tools: ['search_code', 'get_code_context', 'find_similar_code'],
    difficulty: DifficultyLevel.INTERMEDIATE,
    promptType: PromptType.TESTING,
    estimatedTime: '1-4 hours',
    requiredSkills: ['testing principles', 'test frameworks', 'mocking'],
    examples: [
      'Add unit tests for this authentication service', 
      'Create integration tests for the API endpoints',
      'Improve test coverage for this module'
    ],
    tags: ['testing', 'quality assurance', 'unit tests', 'integration tests']
  },
  {
    id: 'code_review',
    name: 'Code Review & Quality Assessment',
    description: 'Evaluating code for quality, maintainability, and standards compliance',
    triggers: [
      'review code', 'evaluate', 'assess quality', 'check for issues', 'provide feedback', 
      'analyze code', 'code check', 'pull request', 'merge request', 'code audit',
      'quality gate', 'standards compliance', 'best practices check'
    ],
    negativePatterns: ['implement', 'create new'],
    tools: ['search_code', 'find_similar_code', 'get_code_context'],
    difficulty: DifficultyLevel.INTERMEDIATE,
    promptType: PromptType.CODE_REVIEW,
    estimatedTime: '1-2 hours',
    requiredSkills: ['code quality standards', 'security awareness', 'performance optimization'],
    examples: [
      'Review this pull request for best practices', 
      'Check this code for security vulnerabilities',
      'Assess the quality of this implementation'
    ],
    tags: ['review', 'quality', 'assessment']
  },
  {
    id: 'architecture',
    name: 'System Architecture & Design',
    description: 'Designing scalable, maintainable system structures and component interactions',
    triggers: [
      'architecture', 'system design', 'design pattern', 'structure', 'component design',
      'microservices', 'monolith', 'scalability', 'modularity', 'separation of concerns',
      'layered architecture', 'design principles', 'architectural decision'
    ],
    negativePatterns: ['bug fix', 'small change'],
    tools: ['analyze_file_structure', 'search_code', 'get_code_context'],
    difficulty: DifficultyLevel.ADVANCED,
    promptType: PromptType.ARCHITECTURE,
    estimatedTime: '4-12 hours',
    requiredSkills: ['architectural patterns', 'system design', 'scalability principles'],
    examples: [
      'Design a microservices architecture for this monolith', 
      'Create a scalable data processing pipeline',
      'Design the component structure for this new module'
    ],
    tags: ['architecture', 'design', 'scalability', 'structure']
  },
