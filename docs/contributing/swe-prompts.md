# SWE Best Practices & Prompts Development Guide

## Overview
Enhance Remcode's software engineering prompts and best practices to make AI assistants more codebase-aware and helpful for developers.

## 🎯 Contribution Areas
- **Prompt Engineering**: Improve AI prompts for development scenarios
- **Best Practices Database**: Expand SWE knowledge base
- **Context-Aware Scenarios**: Add new development scenarios and detection
- **Guidelines & Standards**: Enhance coding standards and quality rules

## 🛠️ Technical Requirements
- **Skills**: Software engineering principles, prompt engineering, TypeScript
- **Knowledge**: Code quality metrics, development workflows, AI/ML basics
- **Tools**: Understanding of various development scenarios and patterns

## 📝 Development Process

### 1. Areas to Enhance
- **Prompts** (`src/swe/prompts.ts`): Core prompt templates and generation
- **Scenarios** (`src/swe/scenarios.ts`): Scenario detection and management  
- **Guidelines** (`src/swe/guidelines.ts`): Coding standards and rules

### 2. Implementation Steps
- Identify development scenario or prompt improvement need
- Add new prompt templates or enhance existing ones
- Implement scenario detection logic for user input
- Create validation rules for code quality assessment
- Add context-aware prompt generation

### 3. Testing Requirements ⚠️ **MANDATORY**
- **Prompt Quality Tests**: Verify prompts provide actionable guidance
- **Scenario Detection Tests**: Accurate scenario identification from user input
- **Context Awareness Tests**: Prompts adapt based on code context
- **Guidelines Validation Tests**: Code validation rules work correctly
- **Integration Tests**: MCP tools use prompts effectively

## 🧪 Testing Standards

### Required Test Coverage
- **Unit Tests**: All prompt generation and scenario detection methods
- **Integration Tests**: End-to-end prompt delivery via MCP tools
- **Quality Tests**: Prompt effectiveness and relevance metrics
- **Performance Tests**: Response time < 100ms for prompt generation

### Test Cases Must Include
- Different programming languages (TypeScript, Python, Java, etc.)
- Various development scenarios (refactoring, new features, bug fixes)
- Edge cases (empty input, complex code structures)
- Context variations (security-sensitive code, performance-critical sections)

## 📊 Quality Metrics
- **Clarity**: Prompts are easily understood
- **Actionability**: Contain specific, implementable guidance
- **Relevance**: Match the development context and scenario
- **Completeness**: Cover all aspects of the development task

## 🎯 High-Priority Improvements
- **Security-focused prompts** for authentication, authorization, data handling
- **Performance optimization guidance** for algorithms and database queries
- **API development standards** for REST, GraphQL, and microservices
- **Testing strategy prompts** for unit, integration, and E2E testing
- **Code review checklists** for different types of changes
- **Accessibility guidelines** for frontend development

## 📚 Domain-Specific Areas
- **Frontend**: React, Vue, Angular best practices
- **Backend**: Node.js, Python, Java server development
- **Database**: SQL optimization, NoSQL patterns, migrations
- **DevOps**: CI/CD, containerization, infrastructure as code
- **Security**: OWASP guidelines, secure coding practices
- **Performance**: Profiling, optimization techniques, caching strategies

## 🤝 Review Criteria
1. **Accuracy**: Technical information must be correct and current
2. **Usefulness**: Prompts should genuinely help developers
3. **Consistency**: Follow established prompt formatting and style
4. **Completeness**: Cover edge cases and error scenarios
5. **Performance**: Fast prompt generation and scenario detection

Ready to make AI assistants better software engineering mentors? 🎯
