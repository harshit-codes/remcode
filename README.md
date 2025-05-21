# Remcode

A sophisticated code vectorization and analysis tool for better understanding of codebases. Remcode helps developers analyze code quality, understand dependencies, and create semantic search capabilities through vector embeddings.

## 🚀 Features

- **Codebase Analysis**: Generate comprehensive reports about code quality, complexity, and structure
- **Code Vectorization**: Create vector embeddings of your code using GraphCodeBERT
- **Semantic Search**: Find semantically similar code across your repositories
- **Adaptive Processing**: Intelligently handles both clean and messy codebases
- **Dual-Layer Architecture**: Module-level and function-level understanding of code
- **MCP Server**: Model Context Protocol integration for AI assistant interaction

## 📋 Project Overview

Remcode implements a two-step process:

1. **Codebase Analyzer**: Scans your code repository and generates a detailed JSON report about its structure, quality, and characteristics.

2. **Codebase Vectorizer**: Uses the analysis report to implement an optimal vectorization strategy, creating embeddings that capture the semantics of your code.

The project leverages several key technologies:
- **GraphCodeBERT**: For code-specific embeddings with semantic understanding
- **LangChain**: For document processing and vector operations
- **Pinecone**: For efficient storage and retrieval of vector embeddings

## 🛠️ Installation

### NPM

```bash
npm install -g remcode
```

### Docker

```bash
docker pull yourusername/remcode
```

## 🏁 Quick Start

### Analyze a codebase

```bash
remcode analyze ./my-project
```

### Analyze a GitHub repository

```bash
remcode analyze https://github.com/username/repo --token <github-token>
```

### Vectorize a codebase

```bash
remcode vectorize ./my-project --pinecone-key <key> --pinecone-env <env>
```

### Start the MCP server

```bash
remcode serve --port 3000 --pinecone-key <key> --pinecone-env <env>
```

## 📊 Analysis Report

The codebase analysis generates a comprehensive JSON report including:

- Repository structure and file distribution
- Code quality metrics and complexity scores
- Dependency graphs and relationships
- Recommendations for vectorization strategies

## 🔍 Vector Search

Once your code is vectorized, you can perform semantic searches:

```bash
remcode search "implement authentication with JWT" --pinecone-key <key> --pinecone-env <env>
```

## 📚 Documentation

For full documentation, visit [docs.remcode.io](https://docs.remcode.io).

## 📦 Tech Stack

- **Node.js**: Core runtime
- **Python**: For machine learning components
- **GraphCodeBERT**: For code embeddings
- **LangChain**: For document processing and vector operations
- **Pinecone**: For vector database storage
- **Express.js**: For MCP server implementation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.