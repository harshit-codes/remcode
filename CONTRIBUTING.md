# Contributing to Remcode

Welcome! Help us make AI assistants more codebase-aware.

## 🚀 Quick Start

```bash
# 1. Fork and clone
git clone https://github.com/your-username/remcode.git
cd remcode

# 2. Install and build  
npm install && npm run build

# 3. Set up environment
cp .env.example .env
# Add your API keys

# 4. Test
npm test
npx remcode inspector  # Interactive MCP tool testing
```

## 📂 Contributing Areas

### 🤖 **MCP Tools** (High Priority)
- Add new AI assistant tools
- Improve existing functionality
- Enhance tool specifications
- **Skills**: API development, TypeScript

### 🧠 **SWE Best Practices** (High Priority)  
- Improve software engineering prompts
- Add context-aware guidance
- Enhance TypeScript/JavaScript workflows
- **Skills**: Software engineering, prompt engineering

### 🧪 **Testing & QA** (High Priority)
- Expand test coverage
- Add TypeScript/JavaScript test cases
- Improve testing infrastructure
- **Skills**: Test automation, QA

### ⚙️ **Core Improvements** (Medium Priority)
- Enhance code analysis algorithms
- Improve chunking strategies
- Optimize embedding performance
- **Skills**: Algorithms, ML engineering

## 📋 Guidelines

### **Code Standards**
- **TypeScript**: Properly typed code
- **ESLint**: Follow existing rules
- **Testing**: Include tests for new features
- **Documentation**: Update relevant docs

### **Development Workflow**
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes with tests
npm test

# Test with MCP Inspector
npx remcode inspector

# Update documentation
npm run docs  # If available

# Commit and push
git commit -m "feat(scope): description"
git push origin feature/your-feature
```

### **Commit Message Format**
```
type(scope): description

feat(mcp): add new search_patterns tool
fix(setup): resolve token validation
docs(readme): update installation guide
test(search): add edge cases
```

### **Pull Request Process**
1. Create feature branch
2. Make changes with comprehensive tests
3. Test with MCP Inspector
4. Update documentation
5. Submit PR with clear description

### **Testing Requirements**
- **Unit tests**: Core functionality
- **Integration tests**: Component interaction
- **MCP testing**: Tool functionality via Inspector
- **E2E tests**: Complete user workflows

## 🎯 Session Documentation

Track your work using our session system:

```bash
cd scripts && npm run session:document -- \
  --description="feature-name" \
  --focus="What you worked on" \
  --achievements="What you accomplished" \
  --next-steps="What to do next" \
  --duration=60
```

## 🏆 Recognition

Contributors are recognized in:
- README acknowledgments
- Release notes
- GitHub contributor graphs  
- Special mentions for innovations

## 🤝 Community

- **Issues**: Bug reports and feature requests
- **Discussions**: Questions and ideas
- **Discord**: Developer community (coming soon)

## 📄 Legal

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Remcode! 🚀
