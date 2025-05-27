# Remcode Installation Guide

**Complete step-by-step guide to install and configure Remcode as an MCP server for AI assistants**

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Node.js 16+** installed
- **Git repository** (for your codebase)
- **API Keys**:
  - Pinecone API Key ([Get one here](https://www.pinecone.io/))
  - HuggingFace Token ([Get one here](https://huggingface.co/settings/tokens))
  - GitHub Token ([Get one here](https://github.com/settings/tokens))

### 1. Test Installation
```bash
npx remcode --help
```

### 2. Configure Environment
Create a `.env` file in your project directory:

```bash
# Remcode Environment Configuration
PINECONE_API_KEY=your_pinecone_api_key
HUGGINGFACE_TOKEN=your_huggingface_token
GITHUB_TOKEN=your_github_token
```

### 3. Start MCP Server
```bash
npx remcode serve --port 3000
```

✅ **Success!** Your MCP server is now running and ready for AI assistant integration.

---

## 📋 Detailed Installation Guide

### Step 1: Verify Prerequisites

#### Node.js Installation
```bash
node --version  # Should be 16.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

If Node.js is not installed:
- **macOS**: `brew install node`
- **Windows**: Download from [nodejs.org](https://nodejs.org/)
- **Linux**: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`

#### Git Repository Setup
```bash
# Initialize Git if needed
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub (optional but recommended)
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```
### Step 2: Obtain API Keys

#### Pinecone API Key
1. Visit [pinecone.io](https://www.pinecone.io/)
2. Sign up for a free account
3. Go to "API Keys" in dashboard
4. Copy your API key

#### HuggingFace Token
1. Visit [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Sign up if needed
3. Create a new token with "Read" permissions
4. Copy the token

#### GitHub Token (Required for setup automation)
1. Visit [github.com/settings/tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`, `admin:repo_hook`
4. Copy the token

### Step 3: Install and Test Remcode

#### Install via NPX (Recommended)
```bash
# Test installation
npx remcode --version

# View available commands
npx remcode --help
```

#### Alternative: Global Installation
```bash
# Install globally
npm install -g remcode

# Test global installation
remcode --version
```

### Step 4: Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Essential Configuration
PINECONE_API_KEY=pcsk_xxxxx...
HUGGINGFACE_TOKEN=hf_xxxxx...
GITHUB_TOKEN=ghp_xxxxx...

# Optional Configuration
LOG_LEVEL=info
MCP_PORT=3000
MCP_HOST=localhost
```

**Security Note**: Add `.env` to your `.gitignore` file to keep API keys secure.

### Step 5: Start MCP Server

#### Basic Startup
```bash
npx remcode serve
```

#### Advanced Startup Options
```bash
# Custom port and verbose logging
npx remcode serve --port 3001 --verbose

# Specify API keys directly (not recommended for production)
npx remcode serve --pinecone-key "your_key" --github-token "your_token"
```

#### Verify Server is Running
You should see output similar to:
```
✔ MCP server started on http://localhost:3000

Available MCP Tools:
  • pinecone_query        - Search for vectors in Pinecone
  • pinecone_upsert       - Upload vectors to Pinecone
  • github_get_repo       - Get repository metadata
  • huggingface_embed_code - Generate embeddings for code
  
Send MCP requests to: POST http://localhost:3000/v1/mcp
```

---

## 🤖 AI Assistant Integration

### Claude Desktop Integration

#### 1. Locate Configuration File
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### 2. Add Remcode MCP Server
```json
{
  "mcpServers": {
    "remcode": {
      "command": "npx",
      "args": ["remcode", "serve"],
      "env": {
        "PINECONE_API_KEY": "your_pinecone_api_key",
        "HUGGINGFACE_TOKEN": "your_huggingface_token",
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

#### 3. Restart Claude Desktop
Close and reopen Claude Desktop to load the new MCP server.

#### 4. Test Integration
Ask Claude: "What MCP tools are available?" or "Search my codebase for authentication functions."

### Other MCP-Compatible Clients

#### Continue Dev (VS Code Extension)
1. Install the Continue extension in VS Code
2. Add to your `~/.continue/config.json`:

```json
{
  "mcpServers": {
    "remcode": {
      "command": "npx",
      "args": ["remcode", "serve", "--port", "3001"],
      "env": {
        "PINECONE_API_KEY": "your_pinecone_api_key",
        "HUGGINGFACE_TOKEN": "your_huggingface_token",
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

#### Cursor Editor
1. Open Cursor settings
2. Navigate to Extensions > MCP
3. Add server configuration:

```json
{
  "remcode": {
    "command": "npx remcode serve --port 3002",
    "env": {
      "PINECONE_API_KEY": "your_pinecone_api_key",
      "HUGGINGFACE_TOKEN": "your_huggingface_token",
      "GITHUB_TOKEN": "your_github_token"
    }
  }
}
```

#### Custom MCP Client Implementation
For custom integrations, use the MCP specification:

```javascript
// Example HTTP request to Remcode MCP server
const response = await fetch('http://localhost:3000/v1/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tool: 'pinecone_query',
    parameters: {
      text: 'authentication functions',
      topK: 5
    }
  })
});

const result = await response.json();
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: "Port already in use"
**Solution**: Use a different port:
```bash
npx remcode serve --port 3001
```

#### Issue: "Module not found" or dependency errors
**Solution**: Clear npm cache and reinstall:
```bash
npm cache clean --force
npx clear-npx-cache  # If available
npx remcode serve
```

#### Issue: "Pinecone/GitHub/HuggingFace API errors"
**Solutions**:
1. Verify API keys are correct
2. Check API key permissions
3. Ensure network connectivity
4. Check service status pages

#### Issue: "Server starts but AI assistant can't connect"
**Solutions**:
1. Verify the MCP configuration in your AI assistant
2. Check that ports match between server and client config
3. Restart your AI assistant after configuration changes
4. Check firewall settings

#### Issue: "Permission denied" errors
**Solutions**:
- **macOS/Linux**: Ensure you have write permissions to the project directory
- **Windows**: Run terminal as administrator if needed
- Check that your GitHub token has the required scopes

### Advanced Troubleshooting

#### Enable Debug Logging
```bash
npx remcode serve --verbose
```

#### Test API Keys Individually
```bash
# Test Pinecone connection
curl -X GET "https://api.pinecone.io/indexes" \
  -H "Api-Key: your_pinecone_key"

# Test GitHub connection
curl -H "Authorization: token your_github_token" \
  https://api.github.com/user

# Test HuggingFace connection
curl -X POST "https://api-inference.huggingface.co/models/microsoft/codebert-base" \
  -H "Authorization: Bearer your_hf_token"
```

### Get Help
- **GitHub Issues**: [Report bugs](https://github.com/harshit-codes/remcode/issues)
- **Documentation**: [Full docs](https://github.com/harshit-codes/remcode#readme)
- **Community**: [Discussions](https://github.com/harshit-codes/remcode/discussions)

---

## 🎯 Next Steps

After successful installation:

1. **First Usage**: Ask your AI assistant to search your codebase
2. **Repository Setup**: Run initial codebase analysis
3. **Team Setup**: Share configuration with team members

**Example first queries**:
- "How does authentication work in this codebase?"
- "Show me error handling patterns"
- "Find functions related to user management"
- "What are the main components in this project?"

## 🔐 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate API keys** regularly
4. **Limit GitHub token scopes** to minimum required
5. **Use project-specific** `.env` files

Congratulations! You now have a fully functional codebase-aware AI assistant. 🚀
