/**
 * Enhanced MCP Tool Definitions with Rich Metadata
 * 
 * This module provides comprehensive tool definitions for Model Context Protocol (MCP)
 * integration, enabling AI assistants to understand and use Remcode capabilities effectively.
 */

// Tool Categories for better organization
export enum MCPToolCategory {
  SEARCH = 'search',
  SETUP = 'setup', 
  PROCESSING = 'processing',
  REPOSITORY = 'repository',
  GUIDANCE = 'guidance',
  VECTORIZATION = 'vectorization'
}

// Priority levels for tool recommendations
export enum MCPToolPriority {
  ESSENTIAL = 'essential',     // Core functionality, always recommend
  RECOMMENDED = 'recommended', // Frequently useful
  ADVANCED = 'advanced',       // Power users and specific scenarios
  DIAGNOSTIC = 'diagnostic'    // Debugging and troubleshooting
}

// Usage context hints for AI assistants
export enum MCPUsageContext {
  FIRST_TIME_SETUP = 'first_time_setup',
  CODE_EXPLORATION = 'code_exploration', 
  DEBUGGING = 'debugging',
  REFACTORING = 'refactoring',
  LEARNING = 'learning',
  MAINTENANCE = 'maintenance'
}

export interface EnhancedMCPTool {
  name: string;
  displayName: string;
  description: string;
  detailedDescription: string;
  category: MCPToolCategory;
  priority: MCPToolPriority;
  usageContexts: MCPUsageContext[];
  parameters: {
    [key: string]: {
      type: string;
      description: string;
      required: boolean;
      default?: any;
      examples: string[];
      constraints?: string;
    };
  };
  returns: {
    description: string;
    schema: any;
    examples: any[];
  };
  examples: {
    title: string;
    description: string;
    request: any;
    expectedResponse: string;
  }[];
  prerequisites?: string[];
  relatedTools: string[];
  performanceHints: string[];
  troubleshooting: {
    commonIssues: string[];
    solutions: string[];
  };
  bestPractices: string[];
  aiGuidance: {
    whenToUse: string;
    whenNotToUse: string;
    followUpSuggestions: string[];
  };
}

export const ENHANCED_MCP_TOOLS: EnhancedMCPTool[] = [
  // SEARCH TOOLS
  {
    name: 'search_code',
    displayName: 'Intelligent Code Search',
    description: 'Search codebase using natural language with semantic understanding',
    detailedDescription: 'Performs intelligent semantic search across the vectorized codebase. Uses advanced NLP to understand intent and find relevant code patterns, functions, classes, and implementations even when exact keywords don\'t match.',
    category: MCPToolCategory.SEARCH,
    priority: MCPToolPriority.ESSENTIAL,
    usageContexts: [MCPUsageContext.CODE_EXPLORATION, MCPUsageContext.LEARNING, MCPUsageContext.DEBUGGING],
    parameters: {
      query: {
        type: 'string',
        description: 'Natural language description of what you\'re looking for',
        required: true,
        examples: [
          'authentication functions',
          'error handling patterns',
          'database connection code',
          'how users are validated',
          'async operations with retries'
        ],
        constraints: 'Use descriptive natural language rather than exact code syntax'
      },
      topK: {
        type: 'number', 
        description: 'Maximum number of results to return',
        required: false,
        default: 10,
        examples: ['5', '10', '20'],
        constraints: 'Range: 1-50, higher values may impact performance'
      },
      filters: {
        type: 'object',
        description: 'Optional filters to narrow search scope',
        required: false,
        examples: [
          '{"language": "typescript"}',
          '{"fileType": [".ts", ".js"]}',
          '{"complexity": "high"}'
        ]
      }
    },
    returns: {
      description: 'Ranked search results with relevance scores and context',
      schema: {
        success: 'boolean',
        query: {
          processed: 'string',
          type: 'string',
          intent: 'string'
        },
        results: [{
          filePath: 'string',
          content: 'string',
          score: 'number',
          highlights: ['string'],
          context: 'object'
        }],
        totalResults: 'number',
        searchTime: 'number'
      },
      examples: [{
        success: true,
        totalResults: 3,
        searchTime: 450,
        results: [{
          filePath: 'src/auth/authentication.ts',
          content: 'async function authenticate(user, password) {...}',
          score: 0.92,
          highlights: ['authenticate', 'password validation']
        }]
      }]
    },
    examples: [
      {
        title: 'Find Authentication Logic',
        description: 'Locate all authentication-related code in the codebase',
        request: { query: 'user authentication and login functions' },
        expectedResponse: 'Returns authentication functions, middleware, and related utilities with relevance scores'
      },
      {
        title: 'Search Error Handling',
        description: 'Find robust error handling patterns',
        request: { query: 'error handling try catch patterns', topK: 5 },
        expectedResponse: 'Returns functions with comprehensive error handling, ranked by pattern sophistication'
      }
    ],
    prerequisites: ['Repository must be vectorized using setup_repository or trigger_reprocessing'],
    relatedTools: ['get_code_context', 'find_similar_patterns', 'trigger_reprocessing'],
    performanceHints: [
      'Use specific, descriptive queries for better results',
      'Start with broader queries and narrow down based on results',
      'Consider using filters for large codebases'
    ],
    troubleshooting: {
      commonIssues: [
        'No results found',
        'Irrelevant results returned',
        'Search taking too long'
      ],
      solutions: [
        'Check if repository is properly vectorized',
        'Try broader or more specific query terms',
        'Reduce topK value for faster responses'
      ]
    },
    bestPractices: [
      'Use natural language descriptions rather than exact code syntax',
      'Include context about what you\'re trying to accomplish',
      'Try multiple query variations for comprehensive coverage'
    ],
    aiGuidance: {
      whenToUse: 'When users ask "how does X work", "find code that does Y", or "show me examples of Z"',
      whenNotToUse: 'For exact file path lookups or when user needs to see all files',
      followUpSuggestions: [
        'get_code_context for detailed analysis of results',
        'find_similar_patterns to explore related implementations',
        'Suggest refinements based on result quality'
      ]
    }
  },

  {
    name: 'get_code_context',
    displayName: 'Extract Code Context',
    description: 'Extract detailed context and structure from specific code sections',
    detailedDescription: 'Analyzes code files to extract surrounding context, function relationships, dependencies, and structural information. Provides comprehensive understanding of how code fits within the larger codebase.',
    category: MCPToolCategory.SEARCH,
    priority: MCPToolPriority.RECOMMENDED,
    usageContexts: [MCPUsageContext.CODE_EXPLORATION, MCPUsageContext.REFACTORING, MCPUsageContext.LEARNING],
    parameters: {
      filePath: {
        type: 'string',
        description: 'Path to the source file to analyze',
        required: true,
        examples: [
          'src/auth/authentication.ts',
          './components/UserManager.tsx',
          'backend/services/database.js'
        ]
      },
      startLine: {
        type: 'number',
        description: 'Starting line number (0-indexed)',
        required: false,
        default: 0,
        examples: ['10', '25', '100']
      },
      endLine: {
        type: 'number',
        description: 'Ending line number (0-indexed)',
        required: false,
        examples: ['20', '50', '150']
      }
    },
    returns: {
      description: 'Comprehensive code context and structural analysis',
      schema: {
        success: 'boolean',
        context: {
          targetContent: 'string',
          surroundingLines: ['string'],
          relatedFunctions: ['string'],
          imports: ['string'],
          classContext: 'string',
          fileStructure: 'object'
        }
      },
      examples: [{
        success: true,
        context: {
          targetContent: 'function authenticate(user) {...}',
          relatedFunctions: ['validateUser', 'hashPassword'],
          imports: ['bcrypt', 'jsonwebtoken'],
          classContext: 'AuthenticationService'
        }
      }]
    },
    examples: [
      {
        title: 'Analyze Function Context',
        description: 'Get comprehensive context for a specific function',
        request: { filePath: 'src/auth.ts', startLine: 15, endLine: 30 },
        expectedResponse: 'Returns function details, dependencies, related functions, and file structure'
      }
    ],
    relatedTools: ['search_code', 'find_similar_patterns'],
    performanceHints: [
      'Specify line ranges for large files to improve performance',
      'Use with search results for detailed follow-up analysis'
    ],
    troubleshooting: {
      commonIssues: ['File not found', 'Invalid line numbers'],
      solutions: ['Verify file path is correct', 'Check line numbers are within file bounds']
    },
    bestPractices: [
      'Use after search_code to analyze specific results',
      'Combine with multiple files for architectural understanding'
    ],
    aiGuidance: {
      whenToUse: 'When users want to understand specific code sections in detail',
      whenNotToUse: 'For broad codebase exploration (use search_code instead)',
      followUpSuggestions: [
        'find_similar_patterns to explore similar implementations',
        'search_code for related functionality'
      ]
    }
  },

  {
    name: 'find_similar_patterns',
    displayName: 'Find Similar Code Patterns',
    description: 'Discover code with similar patterns, structures, or implementations',
    detailedDescription: 'Uses advanced similarity analysis to find code sections that share similar patterns, design approaches, or implementation strategies. Helps identify consistent coding patterns and potential refactoring opportunities.',
    category: MCPToolCategory.SEARCH,
    priority: MCPToolPriority.RECOMMENDED,
    usageContexts: [MCPUsageContext.REFACTORING, MCPUsageContext.LEARNING, MCPUsageContext.MAINTENANCE],
    parameters: {
      codeSnippet: {
        type: 'string',
        description: 'Code snippet to find similar patterns for',
        required: true,
        examples: [
          'async function fetchData() { try { ... } catch(e) { ... } }',
          'class UserService extends BaseService',
          'const [state, setState] = useState(initialValue)'
        ]
      },
      threshold: {
        type: 'number',
        description: 'Minimum similarity threshold (0.0-1.0)',
        required: false,
        default: 0.8,
        examples: ['0.7', '0.8', '0.9'],
        constraints: 'Range: 0.0-1.0, higher values return fewer but more similar results'
      }
    },
    returns: {
      description: 'Similar code patterns with similarity analysis',
      schema: {
        success: 'boolean',
        targetCode: 'string',
        similarCode: ['object'],
        similarityReasons: ['string'],
        patternType: 'string',
        confidence: 'number'
      },
      examples: [{
        success: true,
        patternType: 'async-await',
        confidence: 0.85,
        similarCode: [{ filePath: 'api/users.ts', score: 0.92 }],
        similarityReasons: ['Similar error handling pattern', 'Async/await usage']
      }]
    },
    examples: [
      {
        title: 'Find Similar Error Handling',
        description: 'Locate similar error handling patterns',
        request: { 
          codeSnippet: 'try { await operation(); } catch(error) { logger.error(error); throw error; }',
          threshold: 0.7 
        },
        expectedResponse: 'Returns code with similar try-catch patterns and error logging'
      }
    ],
    relatedTools: ['search_code', 'get_code_context'],
    performanceHints: [
      'Lower threshold values find more results but may include less relevant matches',
      'Use specific code snippets for better pattern matching'
    ],
    troubleshooting: {
      commonIssues: ['No similar patterns found', 'Too many irrelevant results'],
      solutions: ['Lower threshold for more results', 'Use more specific code examples']
    },
    bestPractices: [
      'Use representative code snippets that capture the pattern you want',
      'Combine with refactoring efforts to improve consistency'
    ],
    aiGuidance: {
      whenToUse: 'When users want to find consistent patterns or similar implementations',
      whenNotToUse: 'For exact code searches (use search_code instead)',
      followUpSuggestions: [
        'get_code_context for detailed analysis of similar patterns',
        'Suggest refactoring opportunities based on pattern consistency'
      ]
    }
  },

  // SETUP TOOLS
  {
    name: 'setup_repository',
    displayName: 'Initialize Repository',
    description: 'Complete one-click setup of Remcode for a repository',
    detailedDescription: 'Performs comprehensive repository initialization including prerequisite checks, GitHub integration, secret configuration, workflow generation, and initial vectorization. This is typically the first tool to use with any new repository.',
    category: MCPToolCategory.SETUP,
    priority: MCPToolPriority.ESSENTIAL,
    usageContexts: [MCPUsageContext.FIRST_TIME_SETUP],
    parameters: {
      owner: {
        type: 'string',
        description: 'GitHub repository owner (username or organization)',
        required: true,
        examples: ['microsoft', 'facebook', 'myusername']
      },
      repo: {
        type: 'string', 
        description: 'GitHub repository name',
        required: true,
        examples: ['typescript', 'react', 'my-project']
      },
      token: {
        type: 'string',
        description: 'GitHub personal access token with repo permissions',
        required: true,
        examples: ['ghp_xxxxxxxxxxxxxxxxxxxx'],
        constraints: 'Must have repo, workflow, and secrets permissions'
      },
      branch: {
        type: 'string',
        description: 'Default branch to process',
        required: false,
        default: 'main',
        examples: ['main', 'master', 'develop']
      },
      workflowType: {
        type: 'string',
        description: 'Type of GitHub Actions workflow to generate',
        required: false,
        default: 'standard',
        examples: ['basic', 'standard', 'advanced', 'enterprise']
      }
    },
    returns: {
      description: 'Comprehensive setup results with status for each component',
      schema: {
        success: 'boolean',
        setupStatus: 'object',
        secretsResult: 'object', 
        workflowResult: 'object',
        configResult: 'object',
        duration: 'number'
      },
      examples: [{
        success: true,
        setupStatus: { needsSetup: false },
        secretsResult: { successful: 2, failed: 0 },
        workflowResult: { success: true, filePath: '.github/workflows/remcode.yml' },
        duration: 12500
      }]
    },
    examples: [
      {
        title: 'Setup New Repository',
        description: 'Initialize Remcode for a TypeScript project',
        request: { 
          owner: 'myorg', 
          repo: 'my-typescript-app',
          token: 'ghp_...',
          workflowType: 'standard'
        },
        expectedResponse: 'Completes full setup with workflow generation and secret configuration'
      }
    ],
    prerequisites: [
      'Repository must exist on GitHub',
      'GitHub token must have appropriate permissions',
      'Local directory must be a git repository'
    ],
    relatedTools: ['check_prerequisites', 'trigger_reprocessing', 'get_processing_status'],
    performanceHints: [
      'Ensure stable internet connection for GitHub API calls',
      'Use standard workflow type for most projects'
    ],
    troubleshooting: {
      commonIssues: [
        'GitHub token permissions insufficient',
        'Repository not found',
        'Git repository not initialized'
      ],
      solutions: [
        'Verify token has repo, workflow, and secrets scopes',
        'Check repository name and owner are correct',
        'Run git init in the project directory'
      ]
    },
    bestPractices: [
      'Run check_prerequisites first to verify readiness',
      'Use descriptive repository names',
      'Start with standard workflow type'
    ],
    aiGuidance: {
      whenToUse: 'When user wants to set up Remcode for the first time on a repository',
      whenNotToUse: 'For repositories already configured with Remcode',
      followUpSuggestions: [
        'trigger_reprocessing to start vectorization',
        'search_code once setup is complete',
        'get_processing_status to monitor initial vectorization'
      ]
    }
  },

  // PROCESSING TOOLS  
  {
    name: 'trigger_reprocessing',
    displayName: 'Trigger Codebase Reprocessing',
    description: 'Start vectorization and analysis of codebase changes',
    detailedDescription: 'Initiates comprehensive reprocessing of the codebase, including change detection, code analysis, vectorization, and embedding generation. Can perform full reprocessing or incremental updates based on git changes.',
    category: MCPToolCategory.PROCESSING,
    priority: MCPToolPriority.RECOMMENDED,
    usageContexts: [MCPUsageContext.MAINTENANCE, MCPUsageContext.FIRST_TIME_SETUP],
    parameters: {
      type: {
        type: 'string',
        description: 'Type of processing to perform',
        required: false,
        default: 'incremental',
        examples: ['full', 'incremental', 'vectorize', 'analyze']
      },
      force: {
        type: 'boolean',
        description: 'Force reprocessing even if no changes detected',
        required: false,
        default: false,
        examples: ['true', 'false']
      }
    },
    returns: {
      description: 'Processing status and workflow information',
      schema: {
        success: 'boolean',
        workflowTriggered: 'boolean',
        runId: 'number',
        statusUrl: 'string',
        estimatedDuration: 'string'
      },
      examples: [{
        success: true,
        workflowTriggered: true,
        runId: 12345,
        estimatedDuration: '5-10 minutes'
      }]
    },
    examples: [
      {
        title: 'Process Recent Changes',
        description: 'Process only files changed since last run',
        request: { type: 'incremental' },
        expectedResponse: 'Triggers incremental processing workflow'
      },
      {
        title: 'Full Reprocessing',
        description: 'Reprocess entire codebase from scratch',
        request: { type: 'full', force: true },
        expectedResponse: 'Triggers complete reprocessing of all files'
      }
    ],
    prerequisites: ['Repository must be set up with setup_repository'],
    relatedTools: ['get_processing_status', 'setup_repository'],
    performanceHints: [
      'Use incremental processing for regular updates',
      'Full processing may take 10-30 minutes for large codebases'
    ],
    troubleshooting: {
      commonIssues: ['Workflow fails to trigger', 'Processing takes too long'],
      solutions: ['Check GitHub Actions permissions', 'Monitor with get_processing_status']
    },
    bestPractices: [
      'Use incremental processing for regular updates',
      'Monitor progress with get_processing_status'
    ],
    aiGuidance: {
      whenToUse: 'When codebase has been updated and search results seem outdated',
      whenNotToUse: 'Immediately after setup_repository (processing starts automatically)',
      followUpSuggestions: [
        'get_processing_status to monitor progress',
        'search_code once processing completes'
      ]
    }
  },

  // GUIDANCE TOOLS
  {
    name: 'get_swe_guidance',
    displayName: 'Get Software Engineering Guidance',
    description: 'Receive context-aware software engineering best practices and guidance',
    detailedDescription: 'Provides intelligent software engineering guidance based on the current context, detected scenario, and codebase characteristics. Includes best practices, coding standards, architectural recommendations, and scenario-specific advice.',
    category: MCPToolCategory.GUIDANCE,
    priority: MCPToolPriority.RECOMMENDED,
    usageContexts: [MCPUsageContext.LEARNING, MCPUsageContext.REFACTORING, MCPUsageContext.CODE_EXPLORATION],
    parameters: {
      scenario: {
        type: 'string',
        description: 'Development scenario or context',
        required: false,
        examples: [
          'refactoring',
          'new_feature',
          'bug_fixing', 
          'performance_optimization',
          'security_review',
          'testing',
          'code_review'
        ]
      },
      language: {
        type: 'string',
        description: 'Primary programming language',
        required: false,
        examples: ['typescript', 'javascript', 'python', 'java']
      },
      complexity: {
        type: 'string',
        description: 'Project complexity level',
        required: false,
        examples: ['simple', 'moderate', 'complex', 'enterprise']
      }
    },
    returns: {
      description: 'Comprehensive software engineering guidance',
      schema: {
        success: 'boolean',
        scenario: 'object',
        guidelines: ['object'],
        recommendations: ['string'],
        bestPractices: ['string'],
        codeExamples: ['object']
      },
      examples: [{
        success: true,
        scenario: { name: 'refactoring', confidence: 0.9 },
        guidelines: [{ category: 'maintainability', priority: 'high' }],
        recommendations: ['Extract common functionality into utilities']
      }]
    },
    examples: [
      {
        title: 'Refactoring Guidance',
        description: 'Get best practices for code refactoring',
        request: { scenario: 'refactoring', language: 'typescript' },
        expectedResponse: 'Returns refactoring guidelines, patterns to avoid, and TypeScript-specific recommendations'
      }
    ],
    relatedTools: ['search_code', 'find_similar_patterns'],
    performanceHints: ['Specify scenario and language for more targeted guidance'],
    troubleshooting: {
      commonIssues: ['Generic guidance returned'],
      solutions: ['Provide more specific scenario and context parameters']
    },
    bestPractices: [
      'Use in combination with code analysis for context-aware advice',
      'Apply guidance iteratively during development'
    ],
    aiGuidance: {
      whenToUse: 'When users need development guidance or best practice recommendations',
      whenNotToUse: 'For specific technical debugging (use search tools instead)',
      followUpSuggestions: [
        'search_code to find examples of recommended patterns',
        'find_similar_patterns to identify consistency opportunities'
      ]
    }
  }
];

// Tool discovery and recommendation engine
export class MCPToolRecommendationEngine {
  static getToolsByCategory(category: MCPToolCategory): EnhancedMCPTool[] {
    return ENHANCED_MCP_TOOLS.filter(tool => tool.category === category);
  }

  static getToolsByPriority(priority: MCPToolPriority): EnhancedMCPTool[] {
    return ENHANCED_MCP_TOOLS.filter(tool => tool.priority === priority);
  }

  static getToolsByUsageContext(context: MCPUsageContext): EnhancedMCPTool[] {
    return ENHANCED_MCP_TOOLS.filter(tool => tool.usageContexts.includes(context));
  }

  static recommendToolsForNewUser(): EnhancedMCPTool[] {
    return this.getToolsByUsageContext(MCPUsageContext.FIRST_TIME_SETUP);
  }

  static recommendFollowUpTools(currentTool: string): string[] {
    const tool = ENHANCED_MCP_TOOLS.find(t => t.name === currentTool);
    return tool?.relatedTools || [];
  }

  static getToolByName(name: string): EnhancedMCPTool | undefined {
    return ENHANCED_MCP_TOOLS.find(tool => tool.name === name);
  }
}
