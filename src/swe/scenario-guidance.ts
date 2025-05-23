/**
 * Scenario-specific guidance with Remcode MCP tool recommendations
 */

// Define the guidance mapping using string keys to avoid circular dependency
export const SCENARIO_GUIDANCE_MAP: Record<string, string> = {
  'refactoring': `**REFACTORING FOCUS:**
Improve code structure, readability, and maintainability without changing functionality.

**🔧 Remcode MCP Workflow:**
1. Use \`search_code\` to find all instances of the code pattern you're refactoring
2. Use \`find_similar_code\` to identify related implementations that might need similar changes
3. Use \`get_code_context\` to understand dependencies and impact areas

**Key Principles:**
- Identify code smells: duplication, long methods, complex conditionals, tight coupling
- Apply SOLID principles and appropriate design patterns
- Ensure all tests pass after refactoring
- Refactor in small, verifiable steps
- Improve readability and reduce cognitive complexity
- Extract reusable components and eliminate duplication`,

  'new_feature': `**NEW FEATURE DEVELOPMENT:**
Add new functionality that integrates seamlessly with existing codebase architecture.

**🔧 Remcode MCP Workflow:**
1. Use \`search_code\` to find similar existing features and understand patterns
2. Use \`analyze_file_structure\` to understand where new code should be placed
3. Use \`get_code_context\` to understand integration points and dependencies

**Key Principles:**
- Follow existing architectural patterns and conventions
- Design with extensibility and maintainability in mind
- Implement comprehensive testing (unit, integration, end-to-end)
- Consider feature flags for controlled rollout
- Document new APIs and provide usage examples
- Plan for backward compatibility and migration paths`,

  'bug_fixing': `**BUG FIXING APPROACH:**
Identify root causes and implement robust fixes that prevent similar issues.

**🔧 Remcode MCP Workflow:**
1. Use \`search_code\` to find where the bug occurs and related functionality
2. Use \`find_similar_code\` to check if similar bugs exist elsewhere
3. Use \`get_code_context\` to understand the full scope of the problematic code

**Key Principles:**
- Reproduce the bug consistently before fixing
- Identify the root cause, not just symptoms
- Write regression tests that would have caught the bug
- Fix the issue without introducing new problems
- Document the fix clearly in code comments and commit messages
- Consider if similar issues exist in related code areas`,

  'performance': `**PERFORMANCE OPTIMIZATION:**
Improve system efficiency, speed, and resource utilization based on data-driven analysis.

**🔧 Remcode MCP Workflow:**
1. Use \`search_code\` to find performance-critical sections and existing optimizations2. Use \`find_similar_code\` to discover patterns that might benefit from similar optimizations
3. Use \`get_code_context\` to understand the full performance impact area

**Key Principles:**
- Profile and measure before optimizing
- Focus on bottlenecks with the highest impact
- Consider algorithmic complexity (Big O)
- Optimize database queries, API calls, and memory usage
- Balance performance gains with code maintainability
- Document performance-critical sections and assumptions`,

  'default': `**GENERAL SOFTWARE ENGINEERING:**
Apply software engineering best practices appropriate for the task at hand.

**🔧 Remcode MCP Workflow:**
1. Use \`search_code\` to understand existing patterns and conventions
2. Use \`get_code_context\` to understand the full scope of your work
3. Use \`find_similar_code\` to discover reusable components and approaches

**Key Principles:**
- Follow established patterns and conventions in the codebase
- Consider the impact on existing systems and dependencies
- Write clean, maintainable, and well-documented code
- Include appropriate testing and error handling
- Focus on simplicity and clarity over complexity
- Plan for future maintenance and extensibility`
};

/**
 * Helper function to get guidance by scenario string
 */
export function getScenarioGuidance(scenario: string): string {
  return SCENARIO_GUIDANCE_MAP[scenario] || SCENARIO_GUIDANCE_MAP['default'];
}
