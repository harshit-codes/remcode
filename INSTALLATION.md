# Remcode Installation Guide

**Complete setup guide for integrating Remcode with AI assistants via Model Context Protocol (MCP)**

---

## 🚀 Quick Installation

```bash
# Install globally (recommended)
npm install -g remcode@beta

# Or use directly with npx
npx remcode@beta serve
```

---

## 📋 Prerequisites

Before installing Remcode, ensure you have:

### **System Requirements**
- **Node.js**: Version 16 or higher
- **Git**: Repository must be under Git version control
- **GitHub Repository**: Public or private repository on GitHub

### **Required API Keys**
You'll need these API keys for full functionality:

1. **Pinecone API Key** - [Get one here](https://www.pinecone.io/)
   - Used for vector storage and semantic search
   - Free tier available

2. **HuggingFace Token** - [Get one here](https://huggingface.co/settings/tokens)
   - Used for code embedding generation
   - Free tier available

3. **GitHub Token** - [Get one here](https://github.com/settings/tokens)
   - Required for automated repository setup
   - Needs `repo` and `workflow` permissions

---

## 🤖 Claude Desktop Integration

### **Step 1: Install Remcode**

```bash
# Install the beta version
npm install -g remcode@beta

# Verify installation
remcode --version
# Should output: 0.1.0-beta.1
```

### **Step 2: Set Up Environment Variables**

Create a `.env` file in your project directory or set system environment variables:

```bash
# Option A: Project-level .env file
cd /path/to/your/project
echo "PINECONE_API_KEY=your_pinecone_key_here" >> .env
echo "HUGGINGFACE_TOKEN=your_huggingface_token_here" >> .env
echo "GITHUB_TOKEN=your_github_token_here" >> .env
```

```bash
# Option B: System environment variables (macOS/Linux)
export PINECONE_API_KEY="your_pinecone_key_here"
export HUGGINGFACE_TOKEN="your_huggingface_token_here"
export GITHUB_TOKEN="your_github_token_here"
```

### **Step 3: Configure Claude Desktop**

1. **Locate Claude Desktop Config File**:
   ```bash
   # macOS
   ~/.config/claude_desktop_config.json
   
   # Windows
   %APPDATA%\Claude\claude_desktop_config.json
   
   # Linux
   ~/.config/claude_desktop_config.json
   ```

2. **Add Remcode MCP Server Configuration**:

   ```json
   {
     "mcpServers": {
       "remcode": {
         "command": "remcode",
         "args": ["serve"],
         "env": {
           "PINECONE_API_KEY": "your_pinecone_key_here",
           "HUGGINGFACE_TOKEN": "your_huggingface_token_here",
           "GITHUB_TOKEN": "your_github_token_here"
         }
       }
     }
   }
   ```

   **Alternative with npx (if not installed globally)**:
   ```json
   {
     "mcpServers": {
       "remcode": {
         "command": "npx",
         "args": ["remcode@beta", "serve"],
         "env": {
           "PINECONE_API_KEY": "your_pinecone_key_here",
           "HUGGINGFACE_TOKEN": "your_huggingface_token_here",
           "GITHUB_TOKEN": "your_github_token_here"
         }
       }
     }
   }
   ```

### **Step 4: Restart Claude Desktop**

1. **Close Claude Desktop completely**
2. **Restart the application**
3. **Verify MCP integration** by starting a new conversation

### **Step 5: Initialize Your Codebase**

In your project directory, start a conversation with Claude and ask any question about your codebase. Remcode will automatically:

1. **Detect setup requirements**
2. **Ask for confirmation to proceed**
3. **Set up GitHub repository secrets**
4. **Create GitHub Actions workflow**
5. **Begin initial code analysis**

Example first question:
```
"How does authentication work in this codebase?"
```

---

## 🔧 Advanced Configuration

### **Custom MCP Server Options**

You can customize the MCP server behavior:

```json
{
  "mcpServers": {
    "remcode": {
      "command": "remcode",
      "args": [
        "serve",
        "--port", "3001",
        "--host", "localhost",
        "--verbose"
      ],
      "env": {
        "PINECONE_API_KEY": "your_pinecone_key_here",
        "HUGGINGFACE_TOKEN": "your_huggingface_token_here",
        "GITHUB_TOKEN": "your_github_token_here",
        "MCP_CORS_ORIGINS": "*"
      }
    }
  }
}
```

### **Multiple Projects Configuration**

For multiple projects, you can set up project-specific configurations:

```json
{
  "mcpServers": {
    "remcode-project1": {
      "command": "remcode",
      "args": ["serve", "--port", "3001"],
      "env": {
        "PINECONE_API_KEY": "project1_pinecone_key",
        "HUGGINGFACE_TOKEN": "your_huggingface_token",
        "GITHUB_TOKEN": "your_github_token"
      }
    },
    "remcode-project2": {
      "command": "remcode", 
      "args": ["serve", "--port", "3002"],
      "env": {
        "PINECONE_API_KEY": "project2_pinecone_key",
        "HUGGINGFACE_TOKEN": "your_huggingface_token",
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

---

## ✅ Verification & Testing

### **Test MCP Integration**

1. **Start a new conversation in Claude Desktop**

2. **Ask a codebase question**:
   ```
   "What are the main components in this codebase?"
   ```

3. **Expected behavior**:
   - If first time: Remcode will ask to set up the repository
   - Subsequent questions: Remcode will search and analyze your code

### **Manual MCP Server Test**

```bash
# Start MCP server manually
cd /path/to/your/project
remcode serve --verbose

# Should output:
# ✓ MCP server started on http://localhost:3000
# Available MCP Tools: [list of tools]
```

### **Test CLI Commands**

```bash
# Test basic functionality
remcode --help
remcode analyze ./your-project
remcode serve --port 3001
```

---

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. "Command not found: remcode"**
```bash
# Solution: Install globally or use npx
npm install -g remcode@beta
# Or
npx remcode@beta --version
```

#### **2. "GitHub token is required"**
```bash
# Solution: Set the environment variable
export GITHUB_TOKEN="your_github_token_here"
# Or add to Claude Desktop config env section
```

#### **3. "Port already in use"**
```bash
# Solution: Use different port
remcode serve --port 3001
```

#### **4. "Claude Desktop not detecting MCP server"**
- **Check config file location and syntax**
- **Restart Claude Desktop completely**
- **Verify environment variables are set**
- **Check console logs in Claude Desktop**

### **Debug Mode**

Enable verbose logging for troubleshooting:

```json
{
  "mcpServers": {
    "remcode": {
      "command": "remcode",
      "args": ["serve", "--verbose"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "remcode:*",
        "PINECONE_API_KEY": "your_key",
        "HUGGINGFACE_TOKEN": "your_token",
        "GITHUB_TOKEN": "your_token"
      }
    }
  }
}
```

### **Log Files**

Check log files for detailed error information:

```bash
# MCP server logs
tail -f ~/.config/claude_desktop_logs/mcp.log

# Remcode logs (if available)
tail -f ~/.remcode/logs/server.log
```

---

## 🔄 Updates & Maintenance

### **Update Remcode**

```bash
# Update to latest beta version
npm update -g remcode@beta

# Or reinstall
npm uninstall -g remcode
npm install -g remcode@beta
```

### **Version Check**

```bash
# Check current version
remcode --version

# Check for updates
npm outdated -g remcode
```

---

## 📞 Support

### **Getting Help**

1. **GitHub Issues**: [Create an issue](https://github.com/harshit-codes/remcode/issues)
2. **Documentation**: Check the [README](https://github.com/harshit-codes/remcode#readme)
3. **Discussions**: [GitHub Discussions](https://github.com/harshit-codes/remcode/discussions)

### **Before Reporting Issues**

Please include:
- **Remcode version**: `remcode --version`
- **Node.js version**: `node --version`
- **Operating system**: macOS/Windows/Linux
- **Error messages**: Full error output
- **Configuration**: Your Claude Desktop config (without API keys)

---

## 🎯 What's Next?

After successful installation:

1. **Explore MCP Tools**: Ask questions about your codebase
2. **Review Generated Workflows**: Check `.github/workflows/remcode.yml`
3. **Monitor Processing**: Watch GitHub Actions for code analysis
4. **Advanced Features**: Explore semantic search and code patterns

**Happy coding with AI-powered codebase understanding! 🚀**
