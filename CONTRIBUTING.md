# Contributing to Remcode

Welcome to Remcode! We're excited to have you contribute to making AI assistants more codebase-aware. This guide will help you understand how to contribute effectively across different domains.

## 🚀 Quick Start

1. **Fork and clone the repo**
   ```bash
   git clone https://github.com/your-username/remcode.git
   cd remcode
   ```

2. **Install dependencies**
   ```bash
   npm install && npm run build
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your API keys
   ```

4. **Run tests**
   ```bash
   npm test
   npm run test:mcp-inspector
   ```

## 📂 Contributing Domains - Basic Version Focus

Choose your area of contribution. **Note**: Multi-language and large-scale features have been moved to the Advanced Version.

### 🤖 [MCP Tools Development](./docs/contributing/mcp-tools.md)
**Perfect for:** Developers familiar with APIs, HTTP servers, and AI tool integration
- Add new MCP tools for AI assistants
- Improve existing tool functionality
- Enhance tool specifications and documentation
- **Skill Level:** Intermediate to Advanced
- **Priority:** HIGH for Basic Version

### 🧠 [SWE Best Practices & Prompts](./docs/contributing/swe-prompts.md)
**Perfect for:** Software engineers, prompt engineers, and AI practitioners
- Improve software engineering prompts across 13 comprehensive scenarios
- Add context-aware guidance with deep Remcode MCP integration
- Enhance TypeScript/JavaScript specific guidance and workflows
- **Skill Level:** Beginner to Intermediate
- **✨ UPDATED:** Focus on TypeScript/JavaScript for Basic Version
- **Priority:** HIGH for Basic Version

### 🧪 [Testing & Quality Assurance](./docs/contributing/testing.md)
**Perfect for:** QA engineers, test automation specialists, and reliability engineers
- Expand test coverage for core functionality
- Add TypeScript/JavaScript specific test cases
- Improve testing infrastructure for small-to-medium repositories
- **Skill Level:** Beginner to Advanced
- **Priority:** HIGH for Basic Version

### ⚙️ [Core Logic Improvements](./docs/contributing/core-logic.md)
**Perfect for:** Algorithm developers, ML engineers, and performance optimization experts
- Enhance code analysis algorithms for TypeScript/JavaScript
- Improve chunking strategies for modern web development
- Optimize embedding and vectorization for smaller codebases
- **Skill Level:** Advanced
- **Priority:** MEDIUM for Basic Version

### 🔧 [External Integrations & Local Support](./docs/contributing/external-integrations.md)
**Perfect for:** DevOps engineers, infrastructure developers, and integration specialists
- Add support for new vector databases
- Integrate additional embedding models
- Support local deployments and custom setups
- **Skill Level:** Advanced
- **Priority:** LOW for Basic Version (moved to Advanced)

### 🚀 [Platform Extensions](./docs/contributing/platform-extensions.md)
**Perfect for:** Full-stack developers, DevOps engineers, and product developers
- Create standalone applications
- Build IDE plugins
- Develop custom frontends
- **Skill Level:** Intermediate to Advanced
- **Priority:** LOW for Basic Version (moved to Advanced)

## 🚫 **Moved to Advanced Version**
The following features have been moved to the Advanced Version to keep the Basic Version focused:
- **Multi-Language Support** (Python, Java, Go, Rust, C++)
- **Large-Scale Processing** (1000+ files, enterprise codebases)
- **Complex Platform Extensions**
- **Advanced External Integrations**

## 📋 General Guidelines

### Code Standards
- **TypeScript**: All code must be properly typed
- **ESLint**: Follow the existing linting rules
- **Testing**: Include tests for all new functionality
- **Documentation**: Update relevant documentation

### Commit Message Format
```
type(scope): description

feat(mcp): add new search_similar_patterns tool
fix(setup): resolve GitHub token validation issue
docs(contributing): update MCP tools guide
test(search): add semantic search edge cases
```

### Pull Request Process
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes with tests
3. Run the full test suite: `npm test`
4. Test with MCP Inspector: `npm run test:mcp-inspector`
5. Update documentation as needed
6. Submit a pull request with clear description

### Review Criteria
- **Functionality**: Does it work as intended?
- **Tests**: Are there comprehensive test cases?
- **Documentation**: Is it properly documented?
- **Performance**: Does it maintain/improve performance?
- **Security**: Are there any security implications?

## 🏆 Recognition

Contributors will be recognized in:
- README.md acknowledgments
- Release notes for significant contributions
- GitHub contributor graphs
- Special mentions for innovative features

## 🤝 Community

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs and request features via GitHub Issues
- **Discord**: Join our developer community [link to be added]

## 📄 Legal

By contributing to Remcode, you agree that your contributions will be licensed under the MIT License.

---

## Domain-Specific Guides

Click on any domain above to access detailed contribution guidelines, including:
- Technical requirements and setup
- Step-by-step implementation guides
- Testing requirements and examples
- Code style and architectural patterns
- Example contributions and templates

Thank you for contributing to Remcode! 🚀
