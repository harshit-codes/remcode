# Remcode

**Codebase-Aware SWE Autopilot**

Remcode creates a codebase-aware autopilot trained on software engineering best practices. Your AI assistant gains deep understanding of your code patterns, architecture, and conventions. Use alongside other MCP tools to build an intelligent development workflow that follows your project's standards.

## 🚀 Key Features in Basic Version

- **🚀 One-Click Automated Setup**: First MCP call handles everything - secrets, workflows, processing
- **🤖 Zero-Setup AI Integration**: Automatic processing via GitHub Actions - no local setup required
- **🔗 MCP Protocol Support**: Direct integration with AI assistants like Claude, ChatGPT, and others
- **🧠 Codebase-Aware Intelligence**: ✅ **FULLY FUNCTIONAL** - Real CodeBERT embeddings analyze your code patterns, architecture, and conventions
- **📊 Incremental Processing**: Only analyzes changed files for efficient continuous integration
- **🔍 Semantic Code Search**: ✅ **FULLY FUNCTIONAL** - Natural language code search with intelligent query processing and context extraction
- **🎯 SWE Best Practices**: Auto-injected software engineering guidelines and context-aware assistance
- **🛡️ Privacy & Security First**: Processing in your GitHub environment, secrets secured, vectors isolated
- **⚡ Production-Ready Core**: Real 768-dimensional CodeBERT embeddings, Pinecone vector storage, smart chunking

## 🔄 Complete Workflow

### **Phase 1: Automated Setup (First-Time MCP Tool Call)**

**👤 User Actions:**
1. **Ensure Git Setup**: Initialize Git repository and connect to GitHub
2. **Configure MCP**: Add remcode to AI assistant with all API tokens (including GitHub token)
3. **First Tool Call**: Ask any question about the codebase through AI assistant
4. **Setup Confirmation**: When prompted, confirm to proceed with initial setup and file creation
5. **Wait for Processing**: Allow GitHub Actions to complete initial codebase analysis

**🤖 Remcode Actions:**
1. **Prerequisites Check**: Verify `.git` exists, no uncommitted changes, GitHub repository access
2. **Setup Heads-up**: Inform user about initial setup process and files that will be created
3. **User Confirmation**: Wait for user to confirm proceeding with automated setup
4. **Repository Setup**: Use GitHub API to configure repository secrets (Pinecone, HuggingFace)
5. **Workflow Generation & Commit**: Create `.github/workflows/remcode.yml` file and auto-commit changes
6. **Initial Processing**: GitHub Actions automatically triggered, analyzes entire codebase
7. **Vectorization**: Generate embeddings and store in Pinecone with metadata
8. **Configuration**: Create `.remcode` file with project settings and processing state

### **Phase 2: Continuous Updates (Incremental Processing)**

**👤 User Actions:**
1. **Code Development**: Make changes to codebase (add, modify, delete files)
2. **Commit & Push**: Push changes to monitored branches (main, master, develop)

**🤖 Remcode Actions:**
1. **Change Detection**: Compares current commit SHA with `lastCommit` in `.remcode` file
2. **File Analysis**: Identifies which specific files were added, modified, or deleted
3. **Selective Processing**: Only analyzes and processes changed code files
4. **Vector Management**: Updates existing vectors, adds new ones, removes obsolete ones
5. **State Update**: Updates `.remcode` file with new commit SHA and processing statistics
### **Phase 3: AI-Powered Code Assistance (Integrated Development)**

**👤 User Actions:**
1. **Ask Questions**: Query codebase using natural language through AI assistant (setup already complete)

**🤖 Remcode Actions:**
1. **MCP Response**: Remcode responds to MCP calls from AI assistant  
2. **Database Connection**: Connects to Pinecone vector database using stored credentials
3. **Query Processing**: Converts natural language queries to vector embeddings with intelligent intent detection
4. **Semantic Search**: Finds most relevant code chunks using vector similarity with advanced ranking
5. **Context Assembly**: Retrieves code snippets with metadata, surrounding context, and file structure analysis
6. **Response Delivery**: Returns ranked results with highlights and relevance explanations to AI assistant

## ⚙️ Prerequisites

- **Git repository** (local codebase must be under Git version control)
- **GitHub repository** (public or private) 
- **Required API keys**:
  - **Pinecone API Key** - [Get one here](https://www.pinecone.io/)
  - **HuggingFace Token** - [Get one here](https://huggingface.co/settings/tokens)
  - **GitHub Token** - [Get one here](https://github.com/settings/tokens) (required for automated setup)

## 🚀 Quick Start

### 1. **Setup Repository**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. **Configure MCP**
Add to your AI assistant's MCP configuration:
```json
{
  "mcpServers": {
    "remcode": {
      "command": "npx",
      "args": ["remcode"],
      "env": {
        "PINECONE_API_KEY": "your_pinecone_key",
        "HUGGINGFACE_TOKEN": "your_huggingface_token",
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

### 3. **Start Asking Questions**
First question triggers automatic setup, then ask away:
```
"How does authentication work in this codebase?"
"Show me the error handling patterns"
"Find functions similar to this async error handling code"
```
