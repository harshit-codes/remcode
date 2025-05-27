# Remcode

**Codebase-Aware SWE Autopilot**

Remcode creates a codebase-aware autopilot trained on software engineering best practices. Your AI assistant gains deep understanding of your code patterns, architecture, and conventions. Use alongside other MCP tools to build an intelligent development workflow that follows your project's standards.

## ⚡ Quick Installation

```bash
# Single command - works everywhere
npx remcode
```

**That's it!** Remcode auto-detects your environment and guides you through setup.

### **🤖 Add to AI Assistant**

Copy-paste this configuration to your AI assistant:

#### **Claude Desktop**
```json
{
  "mcpServers": {
    "remcode": {
      "command": "npx",
      "args": ["remcode"],
      "env": {
        "PINECONE_API_KEY": "your_key_here",
        "HUGGINGFACE_TOKEN": "your_token_here",
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

#### **Get API Keys (30 seconds total):**
- **Pinecone**: [Get key →](https://app.pinecone.io/organizations/-/projects/-/keys)
- **HuggingFace**: [Get token →](https://huggingface.co/settings/tokens) 
- **GitHub**: [Get token →](https://github.com/settings/tokens/new?scopes=repo,workflow&description=Remcode%20MCP%20Tools)

#### **Ready!** Ask your AI assistant about your codebase.

### **🔧 More AI Assistants**

#### **Cursor Editor**
```json
{
  "remcode": {
    "command": "npx remcode",
    "env": {
      "PINECONE_API_KEY": "your_key_here",
      "HUGGINGFACE_TOKEN": "your_token_here",
      "GITHUB_TOKEN": "your_github_token"
    }
  }
}
```

#### **Continue Dev (VS Code)**
```json
{
  "mcpServers": {
    "remcode": {
      "command": "npx",
      "args": ["remcode"],
      "env": {
        "PINECONE_API_KEY": "your_key_here",
        "HUGGINGFACE_TOKEN": "your_token_here",
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

## 🚀 Key Features

- **🚀 One-Click Automated Setup**: First MCP call handles everything - secrets, workflows, processing
- **🤖 Zero-Setup AI Integration**: Automatic processing via GitHub Actions - no local setup required
- **🔗 MCP Protocol Support**: Direct integration with AI assistants like Claude, ChatGPT, and others
- **🧠 Codebase-Aware Intelligence**: ✅ **WORKING** - Real CodeBERT embeddings analyze your code patterns, architecture, and conventions
- **🎯 Smart Model Initialization**: ✅ **NEW** - Automatic deployment and validation of CodeBERT models via HuggingFace Inference API
- **📊 Incremental Processing**: Only analyzes changed files for efficient continuous integration
- **🔍 Semantic Code Search**: ✅ **FOUNDATION READY** - Vectorization pipeline functional, search layer in development
- **🎯 Enhanced SWE Best Practices**: ✅ **NEW** - Comprehensive guidance across 13 software engineering scenarios with automatic injection
- **🌐 Language-Agnostic Guidance**: ✅ **NEW** - Universal software engineering principles that work with any technology stack
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
4. **Model Initialization**: Deploy and validate CodeBERT embedding model via HuggingFace Inference API
5. **Repository Setup**: Use GitHub API to configure repository secrets (Pinecone, HuggingFace)
6. **Workflow Generation & Commit**: Create `.github/workflows/remcode.yml` file and auto-commit changes
7. **Initial Processing**: GitHub Actions automatically triggered, analyzes entire codebase
8. **Vectorization**: Generate embeddings using initialized CodeBERT model and store in Pinecone
9. **Configuration**: Create `.remcode` file with project settings, model configuration, and processing state

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

## 🧪 Testing & Development

### **MCP Inspector (Interactive Tool Testing)**
Test all MCP tools using the industry-standard MCP Inspector:

```bash
# 1. Start MCP server with SSE transport
npx remcode inspector
# OR
remcode inspector  # if installed globally

# 2. Open MCP Inspector in another terminal
npx @modelcontextprotocol/inspector

# 3. Configure connection in MCP Inspector UI:
#    Transport: SSE
#    Server URL: http://localhost:3008/sse (or displayed port)
#    Click "Connect"

# 4. Test tools interactively!
```

**Available Tools:**
- 📁 **Repository**: setup-repository, get_repository_status, list_repositories
- 🔍 **Search**: search, search_code, get_code_context  
- ⚙️ **Processing**: trigger-reprocessing, get-processing-status
- 🤖 **SWE**: default_prompt, get_scenarios, get_guidelines
- 🐙 **GitHub**: github_get_repo, github_list_files, github_get_file
- 🌲 **Pinecone**: pinecone_query, pinecone_list_indexes
- 🤗 **HuggingFace**: huggingface_embed_code, huggingface_embed_query

**Protocol**: JSON-RPC 2.0 over Server-Sent Events (SSE) - industry standard!


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
    "embeddingModel": "microsoft/codebert-base",
    "embeddingModelName": "CodeBERT-Base",
    "embeddingDimension": 768,
    "modelHealthy": true,
    "lastModelCheck": "2025-05-22T10:30:45Z",
    "availableModels": [
      {
        "id": "microsoft/codebert-base",
        "name": "CodeBERT-Base", 
        "isHealthy": true
      },
      {
        "id": "BAAI/bge-base-en-v1.5",
        "name": "BGE-Base",
        "isHealthy": true
      }
    ]
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

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development & Testing:**
```bash
# Setup
npm install && npm run build

# Testing - All suites now operational
npm run test:unit         # Core functionality tests
npm run test:integration  # Integration tests  
npm run test:mcp         # MCP server tests
npm run test:e2e         # End-to-end tests
npm run test:performance # Performance benchmarks

# Interactive MCP Testing
npx remcode inspector  # Easy way!
# OR: npx @modelcontextprotocol/inspector node bin/remcode-stdio.js
# Opens: http://127.0.0.1:6274 - Test all 27 tools interactively

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development & Testing:**
```bash
# Setup
npm install && npm run build

# Testing - All suites now operational
npm run test:unit         # Core functionality tests
npm run test:integration  # Integration tests  
npm run test:mcp         # MCP server tests
npm run test:e2e         # End-to-end tests
npm run test:performance # Performance benchmarks

# Interactive MCP Testing
npx remcode inspector  # Easy way!
# Opens MCP Inspector for interactive tool testing

# Documentation
npm run docs             # Regenerate all -rem.md files
```

### 📦 Tech Stack

- **GitHub Actions**: Automated processing and CI/CD
- **Node.js & TypeScript**: Core runtime and tooling
- **GraphCodeBERT**: Code-specific embeddings via HuggingFace
- **Pinecone**: Scalable vector database storage
- **Model Context Protocol**: AI assistant integration
- **Express.js**: MCP server functionality

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
