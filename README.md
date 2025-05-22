# Remcode

**AI-Powered Codebase Understanding Tool**

Remcode transforms any codebase into an intelligent, searchable knowledge base through automated vector embeddings and semantic search. Using GitHub Actions for processing and the Model Context Protocol (MCP) for AI integration, Remcode enables natural language queries about your code.

## 🚀 Key Features

- **🤖 Zero-Setup AI Integration**: Automatic processing via GitHub Actions - no local setup required
- **🔍 Semantic Code Search**: Ask questions in natural language, get relevant code snippets
- **📊 Incremental Updates**: Only processes changed files for efficient continuous integration
- **🔗 MCP Protocol Support**: Direct integration with AI assistants like Claude, ChatGPT, and others
- **⚡ GitHub-Powered Processing**: Uses GitHub's compute for analysis, chunking, and vectorization

## 🏗️ Architecture Overview

```
Developer pushes code → GitHub Actions → Analysis & Vectorization → Pinecone Storage
                                                                          ↓
   AI Assistant ← MCP Server ← Developer's IDE ← Semantic Search ← Vector Database
```

## 🔄 Complete Workflow

### **Phase 1: Automated Setup (GitHub Actions)**
When you first push to your repository:

1. **Automatic Detection**: GitHub Action detects no `.remcode` file exists
2. **Repository Analysis**: Analyzes code structure, languages, and complexity
3. **Smart Chunking**: Breaks code into semantic chunks (functions, classes, modules)
4. **Vector Generation**: Creates embeddings using GraphCodeBERT via HuggingFace
5. **Database Storage**: Stores vectors in Pinecone with metadata
6. **Configuration Creation**: Generates `.remcode` file with project settings

### **Phase 2: Continuous Updates (Incremental Processing)**
On subsequent pushes:

1. **Change Detection**: Compares current commit with last processed commit
2. **File Analysis**: Identifies added, modified, and deleted files
3. **Selective Processing**: Only processes changed code files
4. **Vector Updates**: Updates, adds, or removes vectors as needed
5. **State Management**: Updates `.remcode` with latest processing status

### **Phase 3: AI-Powered Code Assistance (MCP Integration)**
During development:

1. **Local MCP Server**: Developer runs `remcode serve` locally
2. **AI Assistant Connection**: AI tools connect via MCP protocol
3. **Semantic Queries**: Natural language questions about the codebase
4. **Intelligent Responses**: AI gets context-aware code snippets and explanations

## ⚙️ Prerequisites

- GitHub repository (public or private)
- **Required API keys** (stored as GitHub Secrets):
  - **Pinecone API Key** - [Get one here](https://www.pinecone.io/)
  - **HuggingFace Token** - [Get one here](https://huggingface.co/settings/tokens)
  - **GitHub Token** - Automatically provided by GitHub Actions

## 🚀 Quick Start

### 1. **Repository Setup** (One-time)

Add the required API keys to your GitHub repository secrets:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these repository secrets:
   ```
   PINECONE_API_KEY=your_pinecone_key
   HUGGINGFACE_TOKEN=your_huggingface_token
   ```

### 2. **Add GitHub Action** (One-time)

Create `.github/workflows/remcode.yml` in your repository:

```yaml
# Copy the workflow from our GitHub Actions artifact below
```

### 3. **Initialize Remcode** (Automatic)

Simply push to your main branch:

```bash
git add .
git commit -m "Add Remcode workflow"
git push origin main
```

The GitHub Action will automatically:
- ✅ Analyze your entire codebase
- ✅ Create optimized code chunks  
- ✅ Generate vector embeddings
- ✅ Store vectors in Pinecone
- ✅ Create `.remcode` configuration file

### 4. **Start Using AI Assistance**

On your local machine:

```bash
# Install Remcode globally
npm install -g remcode

# Create local .env with your tokens
echo "PINECONE_API_KEY=your_pinecone_key
HUGGINGFACE_TOKEN=your_huggingface_token
GITHUB_TOKEN=your_github_token" > .env

# Start the MCP server
remcode serve --port 3000
```

### 5. **Connect AI Assistant**

Configure your AI assistant (Claude, ChatGPT, etc.) to connect to:
```
http://localhost:3000/v1/mcp
```

### 6. **Ask Questions About Your Code**

```
"How does user authentication work in this codebase?"
"Show me the error handling patterns used"
"Where is the database connection logic?"
"Find functions related to payment processing"
```

## 🔧 How It Works

### **Automated Processing Pipeline**

1. **Code Analysis** (GitHub Actions)
   - Scans repository for code files
   - Identifies languages, frameworks, and patterns
   - Calculates complexity metrics
   - Determines optimal chunking strategies

2. **Smart Chunking** (GitHub Actions)
   - **Function-level**: For clean, well-structured code
   - **Module-level**: For standard complexity code
   - **Sliding-window**: For complex or monolithic files
   - Preserves semantic context and relationships

3. **Vector Generation** (GitHub Actions + HuggingFace)
   - Uses GraphCodeBERT for code-specific embeddings
   - Generates 768-dimensional vectors
   - Maintains code semantics and context
   - Batch processing for efficiency

4. **Vector Storage** (GitHub Actions + Pinecone)
   - Stores vectors with rich metadata
   - Organizes by file, function, and context
   - Enables fast similarity search
   - Supports incremental updates

5. **Semantic Search** (Local MCP Server)
   - Converts natural language queries to vectors
   - Performs similarity search in Pinecone
   - Returns ranked, relevant code snippets
   - Provides context and explanations

### **Incremental Update System**

Remcode optimizes for ongoing development:

- **Tracks Changes**: Monitors Git commits since last processing
- **Selective Processing**: Only analyzes modified files
- **Vector Updates**: Adds, updates, or removes vectors as needed
- **Efficient Storage**: Minimizes redundant processing and storage

### **Example Query Flow**

```
User: "How does authentication work?"
  ↓
MCP Server: Converts query to vector embedding
  ↓
Pinecone: Finds similar code vectors
  ↓
MCP Server: Retrieves relevant code snippets
  ↓
AI Assistant: Provides explanation with code examples
```

## 📊 Real-World Usage Examples

### **For New Team Members**
```
"What are the main architectural patterns in this codebase?"
"Show me how data flows through the application"
"Where should I look to understand the API structure?"
```

### **For Code Reviews**
```
"Find similar error handling patterns to this function"
"Show me other places where we validate user input" 
"Are there examples of how we handle database transactions?"
```

### **For Debugging**
```
"Where might this type of error be coming from?"
"Show me functions that interact with the payment service"
"Find code that handles timeout scenarios"
```

### **For Feature Development**
```
"How do we typically implement caching in this codebase?"
"Show me examples of API endpoint implementations"
"Where do we handle user permissions?"
```

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
    "url": "https://github.com/my-username/my-awesome-project"
  },
  "resources": {
    "pinecone": {
      "index": "remcode-my-awesome-project",
      "namespace": "main"
    },
    "huggingface": {
      "model": "microsoft/graphcodebert-base",
      "embedding_dimension": 768
    }
  },
  "lastCommit": "abc123...",
  "lastUpdate": "2025-05-22T10:35:20Z",
  "stats": {
    "filesProcessed": 143,
    "chunksCreated": 426,
    "vectorsStored": 426
  }
}
```

## 🛠️ Advanced Usage

### **Manual Reprocessing**

To force a complete reprocessing of your codebase:

1. Go to your GitHub repository
2. Navigate to **Actions** tab
3. Select **Remcode Processing** workflow
4. Click **Run workflow**
5. Check **Force full reprocessing**
6. Click **Run workflow**

### **Branch-Specific Processing**

Remcode automatically processes pushes to main branches (`main`, `master`, `develop`). For other branches:

```yaml
# Modify .github/workflows/remcode.yml
on:
  push:
    branches: [ main, master, develop, feature/* ]  # Add your patterns
```

### **Local Development**

For local testing and development:

```bash
# Clone and setup
git clone https://github.com/harshit-codes/remcode.git
cd remcode
npm install
npm run build

# Local MCP server
npm run serve
```

## 🔍 MCP Integration

### **Available MCP Tools**

- **Code Search Tools**:
  - `search_code`: Semantic search across the codebase
  - `find_functions`: Find specific functions or methods
  - `get_context`: Get surrounding context for code snippets

- **Repository Tools**:
  - `get_file_summary`: Get AI-generated summaries of files
  - `list_similar_files`: Find files with similar functionality
  - `analyze_dependencies`: Understand code dependencies

### **Connecting AI Assistants**

The MCP server provides a standard interface for AI assistants:

```
Endpoint: http://localhost:3000/v1/mcp
Protocol: Model Context Protocol v1.0
Authentication: API key-based (your tokens)
```

## 📦 Tech Stack

- **GitHub Actions**: Automated processing and CI/CD
- **Node.js & TypeScript**: Core runtime and tooling
- **GraphCodeBERT**: Code-specific embeddings via HuggingFace
- **Pinecone**: Scalable vector database storage
- **Model Context Protocol**: AI assistant integration
- **Express.js**: Local MCP server

## 🔒 Security & Privacy

- **API Keys**: Stored securely in GitHub Secrets
- **Code Privacy**: Processing happens in your GitHub environment
- **Vector Storage**: Your code vectors are isolated in your Pinecone account
- **Local MCP**: Server runs on your machine, you control access

## ⚡ Performance & Efficiency

- **Incremental Updates**: Only processes changed files
- **Batch Processing**: Efficient embedding generation
- **Smart Chunking**: Optimized for code semantics
- **Caching**: GitHub Actions cache for faster builds
- **Selective Processing**: Ignores non-code files automatically

## 🚀 Roadmap

### **Current (v0.1.0)**
- ✅ GitHub Actions automation
- ✅ Incremental processing
- ✅ MCP server implementation
- ✅ Basic semantic search

### **Planned (v0.2.0)**
- 🔄 Multi-language support enhancement
- 🔄 Code change impact analysis  
- 🔄 Advanced query capabilities
- 🔄 Performance optimizations

### **Future (v1.0.0)**
- 🔮 Real-time code suggestions
- 🔮 Integration with popular IDEs
- 🔮 Team collaboration features
- 🔮 Enterprise deployment options

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.