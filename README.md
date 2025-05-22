# Remcode

**Codebase-Aware SWE Autopilot**

Remcode creates a codebase-aware autopilot trained on software engineering best practices. Your AI assistant gains deep understanding of your code patterns, architecture, and conventions. Use alongside other MCP tools to build an intelligent development workflow that follows your project's standards.

## 🚀 Key Features

- **🚀 One-Click Automated Setup**: First MCP call handles everything - secrets, workflows, processing
- **🤖 Zero-Setup AI Integration**: Automatic processing via GitHub Actions - no local setup required
- **🔗 MCP Protocol Support**: Direct integration with AI assistants like Claude, ChatGPT, and others
- **🧠 Codebase-Aware Intelligence**: Understands your specific code patterns, architecture, and conventions
- **📊 Incremental Processing**: Only analyzes changed files for efficient continuous integration
- **🔍 Semantic Code Search**: Ask questions in natural language, get relevant code snippets
- **🎯 SWE Best Practices**: Auto-injected software engineering guidelines and context-aware assistance
- **🛡️ Privacy & Security First**: Processing in your GitHub environment, secrets secured, vectors isolated

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
3. **Query Processing**: Converts natural language queries to vector embeddings
4. **Similarity Search**: Finds most relevant code chunks using vector similarity
5. **Context Assembly**: Retrieves code snippets with metadata and surrounding context
6. **Response Delivery**: Returns ranked results to AI assistant for user presentation

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
```
## 🔍 MCP Integration

### **Available MCP Tools**

**Setup & Repository Management**:
- `setup_repository`: Automated first-time setup (secrets, workflow generation, commit)
- `get_repository_status`: Check if repository is initialized, get processing status
- `list_repositories`: Show user's accessible GitHub repositories (for selection)
- `create_repository`: Create new GitHub repository for local codebase

**Code Search & Analysis**:
- `search_code`: Semantic search across vectorized codebase
- `get_code_context`: Get surrounding context for specific code snippets
- `analyze_file_structure`: Understand file organization and dependencies
- `find_similar_code`: Find code patterns similar to a given snippet

**Processing & Workflow Management**:
- `trigger_reprocessing`: Force full or incremental reprocessing
- `get_processing_status`: Check GitHub Actions workflow status
- `update_configuration`: Modify .remcode settings and chunking strategies

**SWE Best Practices & Guidance**:
- `default_prompt`: Auto-injected SWE best practices and Remcode optimization guidelines
- `get_scenarios`: Context-aware system prompt selection for specialized development scenarios

### **Connecting AI Assistants**

Configure remcode as an MCP server in your AI assistant. **GitHub token is mandatory** for automated setup:

**For Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "remcode": {
      "command": "npx",
      "args": ["remcode"],
      "env": {
        "PINECONE_API_KEY": "your_pinecone_api_key",
        "HUGGINGFACE_TOKEN": "your_huggingface_token", 
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

**For other MCP-compatible tools:**
Follow your tool's MCP server configuration format using:
- **Command**: `npx remcode`
- **Environment variables**: All three API keys as shown above
- **Note**: GitHub token enables automated repository setup and secret management

## 🔧 Configuration

### **.remcode File Structure**

After initialization, your repository will contain a `.remcode` file:

```json
{
  "version": "0.1.0",
  "initialized": "2025-05-22T10:30:45Z",
  
  "repository": {
    "name": "my-awesome-project",
    "owner": "my-username", 
    "url": "https://github.com/my-username/my-awesome-project",
    "defaultBranch": "main"
  },
  
  "processing": {
    "lastCommit": "abc123def456...",
    "lastUpdate": "2025-05-22T10:35:20Z",
    "status": "completed",
    "nextScheduledRun": "2025-05-29T02:00:00Z"
  },
  
  "vectorization": {
    "provider": "pinecone",
    "indexName": "remcode-my-awesome-project",
    "namespace": "main",
    "embeddingModel": "microsoft/graphcodebert-base",
    "embeddingDimension": 768
  },
  
  "chunking": {
    "strategy": {
      "cleanModules": "module_level",
      "complexModules": "file_level", 
      "monolithicFiles": "sliding_window_with_high_overlap"
    },
    "maxChunkSize": 750,
    "overlapFactor": 0.2
  },
  
  "statistics": {
    "filesProcessed": 143,
    "chunksCreated": 426,
    "vectorsStored": 426,
    "languagesDetected": ["typescript", "javascript", "python"],
    "lastProcessingDuration": "4m 32s"
  },
  
  "security": {
    "githubSecretsConfigured": true,
    "requiredSecrets": ["PINECONE_API_KEY", "HUGGINGFACE_TOKEN"],
    "lastSecretVerification": "2025-05-22T10:30:45Z"
  },
  
  "workflow": {
    "githubActionsEnabled": true,
    "workflowPath": ".github/workflows/remcode.yml"
  }
}
```

## 🚀 Roadmap

### **Current (v0.1.0)**
- ✅ GitHub Actions automation
- ✅ Incremental processing  
- ✅ MCP server implementation
- ✅ Basic semantic search
- ✅ Automated setup on first tool call

### **Planned (v0.2.0)**
- 🔄 **Code Optimization MCP Tools**: AI assistant tools to help write code optimized for chunking, embedding, and vectorization
- 🔄 **SWE Best Practices Auto-Selection**: Basic implementation of context-aware best practices guidance
- 🔄 **Multi-language support enhancement**
- 🔄 **Code change impact analysis**
- 🔄 **Performance optimizations**

### **Advanced Features (v1.0.0)**
- 🔮 **Customizable Tool Selection**: Choose your preferred embedding models, vector storage providers, and workflow runners
- 🔮 **Fine-grained AI Control**: Advanced parameters and attributes control for AI models and processing pipelines
- 🔮 **Advanced SWE Best Practices Control**: User control over SWE guidelines, scenario selection, and prompt customization
- 🔮 **Manual Processing Controls**: Force reprocessing, branch-specific processing, local development tools
- 🔮 **Advanced query capabilities**

### **Enterprise & Local (v2.0.0)**
- 🌟 **Fully Local Processing**: Complete offline operation with local LLMs, embeddings, and workflow execution
- 🌟 **Custom Best Practices Creation**: Users can create and manage their own SWE best practices and coding standards
- 🌟 **Language-Specific Optimizations**: Tech stack specific boilerplates and optimization templates
- 🌟 **Team collaboration features**
- 🌟 **Enterprise deployment options**
- 🌟 **Real-time code suggestions**
- 🌟 **IDE integrations**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### 📦 Tech Stack

- **GitHub Actions**: Automated processing and CI/CD
- **Node.js & TypeScript**: Core runtime and tooling
- **GraphCodeBERT**: Code-specific embeddings via HuggingFace
- **Pinecone**: Scalable vector database storage
- **Model Context Protocol**: AI assistant integration
- **Express.js**: MCP server functionality

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.