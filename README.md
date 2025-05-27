# Remcode

**Turn Your AI Assistant Into a Codebase Expert**

Remcode gives your AI assistant deep understanding of your code patterns, architecture, and conventions through intelligent vectorization and semantic search.

## ⚡ 30-Second Setup

### **1. Install**
```bash
npx remcode
```

### **2. Add to AI Assistant**

<details>
<summary><strong>📱 Claude Desktop</strong></summary>

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

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
</details>

<details>
<summary><strong>🎯 Cursor Editor</strong></summary>

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
</details>

<details>
<summary><strong>🔄 Continue Dev</strong></summary>

**Location**: `~/.continue/config.json`

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
</details>

### **3. Get API Keys**

<details>
<summary><strong>🔑 Get Free API Keys (2 minutes)</strong></summary>

**Pinecone** - Vector Database
- Visit: [pinecone.io](https://app.pinecone.io/organizations/-/projects/-/keys)
- Sign up free → Create project → Copy API key

**HuggingFace** - AI Models  
- Visit: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- Sign up free → New token → Read permission → Copy

**GitHub** - Repository Access
- Visit: [github.com/settings/tokens/new](https://github.com/settings/tokens/new?scopes=repo,workflow&description=Remcode%20MCP%20Tools)
- Generate token → Select `repo,workflow` → Copy

**⏱️ Total time: ~2 minutes**
</details>

### **4. Start Using**
Ask your AI assistant: *"What authentication patterns are used in this codebase?"*

## 🚀 Key Features

- **🧠 Codebase Intelligence**: AI understands your code structure and patterns
- **🔍 Semantic Search**: Find code by meaning, not just keywords  
- **🤖 SWE Best Practices**: Built-in software engineering guidance
- **🔗 MCP Protocol**: Direct integration with AI assistants
- **⚡ Zero Configuration**: Works out of the box with smart defaults
- **🛡️ Privacy First**: Your code stays in your environment

## 🎯 How It Works

1. **Analyzes Your Code**: Remcode understands your codebase structure and patterns
2. **Creates Embeddings**: Generates semantic representations using CodeBERT
3. **Enables AI Search**: Your assistant can find and understand code contextually
4. **Provides Guidance**: Offers software engineering best practices specific to your code

## 🧪 Testing

**Quick Test**:
```bash
npx remcode inspector
```
Opens MCP Inspector for interactive testing of all tools.

**Full Test Suite**:
```bash
npm test
```

## 📚 Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[License](LICENSE)** - MIT License

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📦 Tech Stack

- **TypeScript** - Type-safe development
- **CodeBERT** - Code-specific embeddings  
- **Pinecone** - Vector database
- **Model Context Protocol** - AI assistant integration
- **GitHub Actions** - Automated processing

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Made with ❤️ for developers who want smarter AI assistants**
