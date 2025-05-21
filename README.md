# Remcode

A code vectorization and analysis tool for better understanding of codebases. Remcode helps developers create semantic search capabilities through vector embeddings, analyze code quality, and understand dependencies.

## 🚀 Key Features

- **Code Analysis**: Generate reports about code quality and structure
- **Code Vectorization**: Create vector embeddings of your code for semantic search
- **MCP Server**: Model Context Protocol integration for AI assistants to interact with codebases

## 📋 Project Overview

Remcode implements an end-to-end process for code analysis and vectorization via the Model Context Protocol (MCP) server:

1. **Code Repository Access & Analysis**: Using the GitHub API to access repository files and analyze code structure.
2. **Code Chunking**: Breaking code files into meaningful segments based on code complexity.
3. **Embedding Generation**: Converting code chunks to vector embeddings using models like GraphCodeBERT via HuggingFace.
4. **Vector Storage**: Storing embeddings in Pinecone for efficient similarity search.
5. **Semantic Search**: Finding code based on natural language queries through vector similarity.

## ⚙️ Prerequisites

- Node.js (v16+)
- **Your own API keys** for:
  - Pinecone - [Get one here](https://www.pinecone.io/)
  - GitHub API Token (for GitHub repo access)
  - HuggingFace API Token (for embedding models)

## 🔑 Configuration

Create a `.env` file in the project root with your personal API keys:

```
GITHUB_TOKEN=your_github_token
PINECONE_API_KEY=your_pinecone_api_key
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

## 🔍 MCP Server

The MCP server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification, allowing AI assistants to interact with:
- Codebase analysis tools
- Code vectorization
- Semantic search capabilities

```bash
# Start the MCP server
npm run serve

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

- **HuggingFace Tools**:
  - `huggingface_embed_code`: Generate embeddings for code
  - `huggingface_embed_query`: Generate embeddings for search queries
  - `huggingface_list_models`: List available embedding models

- **Pinecone Tools**:
  - `pinecone_query`: Search for similar code
  - `pinecone_upsert`: Add vectors to the database
  - `pinecone_delete`: Remove vectors from the database
  - `pinecone_list_indexes`: List available indexes

## 🧪 Testing

The MCP server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification and can be tested using the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) tool.

```bash
# Start the MCP server
npm run serve

# Use the MCP Inspector in your browser
# Visit: https://inspector.modelcontextprotocol.io/
```

## 📦 Tech Stack

- **Node.js & TypeScript**: Core runtime
- **GraphCodeBERT**: For code embeddings via HuggingFace
- **Pinecone**: For vector database storage
- **Express.js**: For MCP server

## 🛣️ End-to-End Process

### 1. Code Repository Access and Analysis
**Tools**: GitHub API (via GitHub handler)
- AI assistant sends an MCP request to analyze a GitHub repository
- MCP server uses the GitHub handler to:
  - Clone/access the repository
  - List files and directories
  - Retrieve file contents
- Repository structure is analyzed (languages, modules, files)
- Code quality metrics are computed

### 2. Code Chunking
**Tools**: Internal chunking logic (ChunkingManager)
- Code files are broken down into meaningful chunks
- Different chunking strategies applied based on file complexity:
  - Function-level for clean code
  - Module-level for standard complexity
  - Sliding window for monolithic files

### 3. Embedding Generation
**Tools**: HuggingFace API (via HuggingFace handler)
- Text chunks are converted to vector embeddings using code-specific models:
  - GraphCodeBERT (primary model)
  - CodeBERT (fallback model)
- Embeddings capture the semantic meaning of the code segments

### 4. Vector Storage
**Tools**: Pinecone API (via Pinecone handler)
- Vector embeddings are stored in Pinecone vector database
- Metadata (file path, language, etc.) is attached to each vector
- Indexes are created for efficient similarity search

### 5. Semantic Search
**Tools**: Pinecone API + HuggingFace API
- User submits a natural language query via MCP
- Query is converted to vector embedding (HuggingFace)
- Similar code vectors are retrieved (Pinecone)
- Results are ranked and returned to the user

## 📝 ToDo List

### Priority 1: MCP Server Implementation
- [x] Add HuggingFace MCP handler implementation
- [ ] Enhance GitHub MCP handler with full repository analysis
- [ ] Complete Pinecone MCP handler implementation for vector operations
- [ ] Implement the full end-to-end process flow
- [ ] Add proper error handling and logging

### Priority 2: Integration Testing
- [ ] Create end-to-end tests for the MCP server
- [ ] Test with real GitHub repositories
- [ ] Test embedding generation with real HuggingFace models
- [ ] Test vector storage and retrieval with Pinecone
- [ ] Create automated test suite

## 📄 License

MIT License
