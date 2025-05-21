# Remcode

A code vectorization and analysis tool for better understanding of codebases. Remcode helps developers create semantic search capabilities through vector embeddings, analyze code quality, and understand dependencies.

## 🚀 Key Features

- **Codebase Analysis**: Generate reports about code quality and structure
- **Code Vectorization**: Create vector embeddings of your code for semantic search
- **MCP Server**: Model Context Protocol integration for AI assistants to interact with codebases

## 📋 Project Overview

Remcode implements a two-step process:

1. **Analysis**: Scans your code repository for structure, quality, and characteristics
2. **Vectorization**: Creates embeddings that capture the semantics of your code

## ⚙️ Prerequisites

- Node.js (v16+)
- **Your own API keys** for:
  - Pinecone - [Get one here](https://www.pinecone.io/)
  - GitHub API Token (for GitHub repo access)
  - Hugging Face API Token (for embedding models)

## 🔑 Configuration

Create a `.env` file in the project root with your personal API keys:

```
GITHUB_TOKEN=your_github_token
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
HUGGINGFACE_TOKEN=your_huggingface_token
```

**Important**: 
- Never commit your API keys to the repository!
- The MCP server requires you to provide your own API keys.
- Each developer must create their own `.env` file locally.

## 🚀 Getting Started

### Local Development

```bash
# Clone the repository
git clone https://github.com/harshit-codes/remcode.git
cd remcode

# Install dependencies
npm install

# Start the MCP server in development mode
npm run serve
```

### Using the CLI (Development)

```bash
# Analyze a codebase
npm run dev analyze ./my-project

# Analyze a GitHub repository
npm run dev analyze https://github.com/username/repo --token <github-token>

# Vectorize a codebase
npm run dev vectorize ./my-project --pinecone-key <key> --pinecone-env <env>

# Start the MCP server
npm run dev serve --port 3000
```

## 🔍 MCP Server

The MCP server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification, allowing AI assistants to interact with:
- Codebase analysis tools
- Code vectorization
- Semantic search capabilities

```bash
# Start the MCP server
npm run dev serve

# Server available at: http://localhost:3000/v1/mcp
# MCP spec available at: http://localhost:3000/v1/mcp/spec
```

### MCP Endpoints

The server exposes these main tools:

- **GitHub Tools**:
  - `github_get_repo`: Get repository metadata
  - `github_list_files`: List files in a repository
  - `github_get_file`: Get file contents
  - `github_search_code`: Search code in repositories

- **Pinecone Tools**:
  - `pinecone_query`: Search for similar code
  - `pinecone_upsert`: Add vectors to the database
  - `pinecone_delete`: Remove vectors from the database
  - `pinecone_list_indexes`: List available indexes

## 🧪 Testing

The MCP server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification and can be tested using the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) tool.

```bash
# Start the MCP server
npm run dev serve

# Use the MCP Inspector in your browser
# Visit: https://inspector.modelcontextprotocol.io/
```

The MCP Inspector provides a user-friendly interface to:
- Connect to your local MCP server
- Explore available tools
- Test various API endpoints
- View request and response formats

## 📦 Tech Stack

- **Node.js & TypeScript**: Core runtime
- **GraphCodeBERT**: For code embeddings
- **Pinecone**: For vector database storage
- **Express.js**: For MCP server

## 🛣️ Roadmap

- [x] Initial project setup
- [ ] MCP Server implementation
- [ ] Core vectorization functionality
- [ ] Semantic search capabilities
- [ ] NPM package (coming later)
- [ ] Docker container (coming later)

## 📝 Todo List

### Priority 1: MCP Server Implementation
- [ ] Complete Pinecone MCP handler implementation:
  - [ ] Implement vector query functionality with actual embeddings
  - [ ] Connect to Pinecone for vector storage and retrieval
  - [ ] Implement vector upsert and delete operations
  - [ ] Add index management capabilities
- [ ] Complete GitHub MCP handler implementation:
  - [ ] Enhance repository fetching and analysis
  - [ ] Implement file content retrieval and analysis
  - [ ] Add code search functionality
- [ ] Integrate analysis capabilities into MCP server:
  - [ ] Connect code quality analysis to MCP endpoints
  - [ ] Connect dependency analysis to MCP endpoints
- [ ] Add authentication and security to MCP server
- [ ] Implement comprehensive error handling and logging

### Priority 2: Core Functionality
- [ ] Implement actual chunking strategies in ChunkingManager
- [ ] Connect to embedding models (GraphCodeBERT/CodeBERT)
- [ ] Complete Pinecone storage integration
- [ ] Enhance code quality analyzer with real metrics
## 📄 License

MIT License
