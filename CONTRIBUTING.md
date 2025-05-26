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

4. **Run tests and MCP Inspector**
   ```bash
   npm test
   ```

5. **Test with MCP Inspector** (Interactive tool testing)
   ```bash
   # Easy way (new!)
   npx remcode inspector
   
   # Manual way  
   npx @modelcontextprotocol/inspector node bin/remcode-stdio.js
   ```
   Then open: http://127.0.0.1:6274 to test all 27 MCP tools interactively

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

### MCP Inspector Testing
For interactive testing of MCP tools during development:

```bash
# Easy way (new!)
npx remcode inspector

# Manual way
npx @modelcontextprotocol/inspector node bin/remcode-stdio.js

# Open in browser
open http://127.0.0.1:6274
```

**Using the Inspector:**
1. **Connect**: Click "Connect" to establish connection
2. **List Tools**: Click "List Tools" to see all 27 available tools
3. **Test Tools**: Click any tool → "Run Tool" to test functionality
4. **Debug**: Check "Server Notifications" for errors or logs
5. **History**: View all executed commands in the History panel

**Available Tool Categories:**
- 📁 **Repository**: setup-repository, get_repository_status, list_repositories
- 🔍 **Search**: search, search_code, get_code_context  
- ⚙️ **Processing**: trigger-reprocessing, get-processing-status
- 🤖 **SWE**: default_prompt, get_scenarios, get_guidelines
- 🐙 **GitHub**: github_get_repo, github_list_files, github_get_file
- 🌲 **Pinecone**: pinecone_query, pinecone_list_indexes
- 🤗 **HuggingFace**: huggingface_embed_code, huggingface_embed_query

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
4. **Test with MCP Inspector**: 
   ```bash
   # Easy way (new!)
   npx remcode inspector
   
   # Manual way
   npx @modelcontextprotocol/inspector node bin/remcode-stdio.js
   ```
   - Open http://127.0.0.1:6274 to test tools interactively
   - Verify your changes work with the MCP protocol
5. Update documentation as needed
6. Submit a pull request with clear description

## 📚 Documentation & Development Insights

Remcode uses a dual documentation system with automated CI/CD integration for comprehensive development tracking and insights generation.

### **📁 Documentation Systems Overview**

#### **1. `/rem-docs` - Auto-Generated Code Mirror**
- **Purpose**: Automatically generated markdown documentation for every source file
- **Content**: Code structure analysis (classes, functions, interfaces, dependencies)
- **Updates**: Regenerated via `npm run docs` command
- **Structure**: Mirrors the exact folder structure of the codebase

#### **2. `/docs` - Session Tracking & Project Documentation**
- **Purpose**: Manual session tracking and automated development insights
- **Content**: Development sessions, progress analysis, blockers, and comprehensive reports
- **Updates**: Updated via session tracking scripts and CI/CD automation
- **Structure**: CSV-based session data with automated analysis reports

### **🔄 Documentation Generation Workflow**

#### **Auto-Generate Code Documentation**
```bash
# Regenerate all code documentation
npm run docs

# This creates/updates the entire rem-docs/ folder structure
# - Analyzes all TypeScript/JavaScript/Python files
# - Extracts functions, classes, interfaces, dependencies
# - Generates markdown files mirroring the codebase structure
```

**Generated Files Example:**
```
rem-docs/
├── src/
│   ├── mcp/handlers/setup.md           # From src/mcp/handlers/setup.ts
│   ├── vectorizers/pipeline.md         # From src/vectorizers/pipeline.ts
│   └── utils/logger.md                 # From src/utils/logger.ts
├── tests/
│   ├── unit/search.test.md             # From tests/unit/search.test.ts
│   └── integration/mcp-server.test.md  # From tests/integration/mcp-server.test.ts
└── scripts/
    └── validate-features.md            # From scripts/validate-features.js
```

### **📊 Session Tracking & Analysis System**

#### **Core Session Tracking Commands**
```bash
# Add new development session interactively
npm run session:add

# Quick session entry (command line)
npm run session:quick

# Validate CSV format and data quality
npm run session:validate
```

#### **Automated Analysis Generation**
```bash
# Generate all analysis reports
npm run session:summary

# Individual analysis reports
npm run session:progress    # → docs/PROGRESS_ANALYSIS.md
npm run session:blockers    # → docs/BLOCKERS_ANALYSIS.md  
npm run session:codebase    # → docs/CODEBASE_ANALYSIS.md

# Comprehensive summary combining all analyses
npm run session:summary     # → docs/COMPREHENSIVE_SUMMARY.md
```

#### **CSV Schema (12 Fields)**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `session_id` | String | Unique identifier | `2025-05-26-contributing-docs` |
| `timestamp` | ISO 8601 | Session timestamp | `2025-05-26T15:00:00Z` |
| `developer` | String | Developer name | `harshit-codes` |
| `status` | Enum | Session status | `completed`, `in_progress`, `blocked` |
| `focus` | String | Main focus area | `Documentation system enhancement` |
| `achievements` | String | What was accomplished | `CONTRIBUTING.md update, CI/CD integration` |
| `blockers` | String | Issues encountered | `None` or specific problems |
| `next_steps` | String | What to do next | `Test automated scripts with GitHub CI/CD` |
| `files_changed` | String | Modified files | `CONTRIBUTING.md, docs/SESSIONS.csv` |
| `learnings` | String | Key insights | `Dual documentation system improves maintainability` |
| `notes` | String | Additional context | `Integrated CI/CD content from separate file` |
| `duration_mins` | Integer | Time spent (minutes) | `120` |

### **🚀 CI/CD Integration & Automation**

#### **Automated Documentation Pipeline**
The project includes comprehensive CI/CD automation for both documentation systems:

**1. Code Documentation Auto-Generation**
- **Trigger**: Every commit to main/develop branches
- **Action**: Automatically runs `npm run docs` 
- **Result**: Updates `/rem-docs` folder with latest code structure
- **Benefits**: Always up-to-date code documentation without manual intervention

**2. Session Insights Auto-Generation**
- **Trigger**: Changes to `docs/SESSIONS.csv` or daily at 2 AM UTC
- **Actions**: 
  - Validates CSV format and data quality
  - Generates all 4 analysis reports automatically
  - Updates development metrics and trends
- **Generated Files**:
  - `docs/PROGRESS_ANALYSIS.md` - Development momentum and priorities
  - `docs/BLOCKERS_ANALYSIS.md` - Issue patterns and resolution strategies  
  - `docs/CODEBASE_ANALYSIS.md` - File changes and technical insights
  - `docs/COMPREHENSIVE_SUMMARY.md` - Executive summary with key metrics

#### **Git Hooks Integration**
```bash
# Install automated validation hooks
npm run session:install-hooks

# Pre-commit: Validates session data before commits
# Post-commit: Auto-generates updated analysis reports
```

#### **Quality Monitoring**
- **Weekly Quality Reviews**: Automated quality assessment with GitHub issue creation
- **Data Consistency Checks**: Validates session detail levels and completeness
- **Trend Analysis**: Historical pattern detection and recommendations
- **Real-time Metrics**: Live development metrics with badge generation

#### **Workflow Customization**
```yaml
# Example: Change automation frequency in .github/workflows/
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours instead of daily
```

#### **Integration with External Tools**
```yaml
# Slack notifications on insights updates
- name: Notify Team
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: |
      📊 Development insights updated
      • Sessions: ${{ needs.insights.outputs.total-sessions }}
      • Completion: ${{ needs.insights.outputs.completion_rate }}%
```

### **🔧 Development Workflow Integration**

#### **For New Contributors**
1. **Setup**: Clone repo and run `npm install && npm run build`
2. **Understand Structure**: Review `/rem-docs` for code architecture
3. **Track Work**: Use `npm run session:add` for development sessions
4. **Generate Docs**: Run `npm run docs` before major commits
5. **Review Progress**: Check `docs/COMPREHENSIVE_SUMMARY.md` for project status

#### **During Development**
```bash
# Start new development session
npm run session:add
# → Interactive prompts for session details

# Make your changes and test
npm test
npx remcode inspector  # Test MCP tools

# Update documentation
npm run docs           # Regenerate code docs
npm run session:summary # Update analysis reports

# Commit (automation will validate and enhance)
git add .
git commit -m "feat(contributing): enhance documentation system"
```

#### **For Code Reviews**
1. **Check Documentation**: Verify `/rem-docs` reflects code changes
2. **Review Session Data**: Check if session tracking captures the work scope
3. **Validate Analysis**: Ensure automated reports show accurate progress
4. **CI/CD Status**: Confirm automated workflows completed successfully

### **📈 Dashboard & Metrics**

#### **README Badge Integration**
```markdown
<!-- Dynamic badges from automated metrics -->
![Sessions](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/harshit-codes/remcode/main/sessions/session-metrics.json&query=$.total_sessions&label=Sessions&color=blue)
![Dev Time](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/harshit-codes/remcode/main/sessions/session-metrics.json&query=$.total_time_hours&label=Dev%20Time&suffix=h&color=green)
![Completion](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/harshit-codes/remcode/main/sessions/session-metrics.json&query=$.completion_rate&label=Completion&suffix=%25&color=brightgreen)
```

#### **Real-time Development Dashboard**
- **File**: `docs/DEVELOPMENT_DASHBOARD.md` (auto-generated)
- **Content**: Live metrics, health indicators, quick access to reports
- **Updates**: Every 6 hours or on-demand via workflow dispatch

### **🔍 Troubleshooting Documentation Issues**

#### **Code Documentation Issues**
```bash
# If rem-docs generation fails
npm run docs 2>&1 | grep -i error

# Check specific file processing
node scripts/colocated-docs-generator.js | grep "Error processing"

# Validate generated structure
find rem-docs -name "*.md" | wc -l  # Should match code file count
```

#### **Session Tracking Issues** 
```bash
# Validate CSV format
cd docs && npm run validate

# Check for parsing errors
node scripts/validate-session.js validate 2>&1 | grep -i error

# Debug analysis generation
npm run session:progress  # Test individual analysis
```

#### **CI/CD Pipeline Issues**
- **Check Workflow Permissions**: Settings → Actions → General → Read/write permissions
- **Review Failed Runs**: Actions tab → Failed workflow → Logs
- **Validate Triggers**: Ensure changes to correct file paths trigger workflows

### **💡 Best Practices**

1. **Regular Documentation Updates**: Run `npm run docs` before major commits
2. **Consistent Session Tracking**: Use standardized session entry for accurate analysis
3. **Quality Reviews**: Monitor weekly quality reports for improvement opportunities
4. **Automation Trust**: Let CI/CD handle routine documentation updates
5. **Metric Monitoring**: Check development dashboard regularly for insights

### **🎯 Benefits of This System**

- **Comprehensive Coverage**: Both code structure and development process documented
- **Zero Manual Maintenance**: Automated updates ensure documentation stays current
- **Actionable Insights**: Data-driven development progress analysis
- **Quality Assurance**: Automated validation prevents documentation debt
- **Team Collaboration**: Shared understanding through consistent documentation
- **Historical Tracking**: Complete development timeline with searchable insights

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
