# MCP-Inspect

**Model Context Protocol Inspector Testing for Remcode**

## 🎯 Purpose

This directory contains comprehensive testing for Remcode using MCP Inspector CLI. Since Remcode is fundamentally an MCP tool, we test it through the MCP protocol itself for realistic validation.

## 📁 Directory Structure

```
MCP-Inspect/
├── README.md              # This file
├── helpers/                # Test utilities and MCP client
│   ├── mcp-client.ts      # MCPInspectorClient class
│   └── test-config.ts     # Configuration and constants
├── tests/                  # Test suites
│   ├── connection.test.ts  # Basic connection tests
│   ├── tool-discovery.test.ts # Tool discovery validation
│   └── basic-execution.test.ts # Basic tool execution
├── fixtures/              # Test data and mocks
│   └── test-data.ts       # Sample data for testing
└── scripts/               # Test automation scripts
    ├── run-tests.js       # Test runner
    └── validate-tools.sh  # Quick validation script
```

## 🚀 Phase 1 Implementation Status

✅ **Core Infrastructure Complete**
- [x] MCPInspectorClient helper class
- [x] Test configuration and constants
- [x] Basic connection testing
- [x] Tool discovery validation
- [x] Basic tool execution tests

✅ **Test Categories Implemented**
- [x] **Connection Testing** - MCP server startup and negotiation
- [x] **Tool Discovery** - All MCP tools availability and schema validation
- [x] **Basic Execution** - Core tool functionality testing

## 🛠️ Usage

### Run All MCP Inspector Tests
```bash
npm run test:mcp-inspect
```

### Run Specific Test Categories
```bash
# Connection tests only
npm test MCP-Inspect/tests/connection.test.ts

# Tool discovery tests only  
npm test MCP-Inspect/tests/tool-discovery.test.ts

# Basic execution tests only
npm test MCP-Inspect/tests/basic-execution.test.ts
```

### Quick Validation
```bash
npm run mcp:validate
```