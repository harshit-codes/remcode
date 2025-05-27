#!/bin/bash

# MCP Inspector Tool Validation Script
# Quick validation of MCP server and tools

echo "🔍 MCP Inspector Tool Validation"
echo "==============================="

# Check if remcode-stdio.js exists
if [ ! -f "bin/remcode-stdio.js" ]; then
    echo "❌ bin/remcode-stdio.js not found"
    exit 1
fi

echo "✅ MCP server binary found"

# Check if MCP Inspector is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found - please install Node.js"
    exit 1
fi

echo "✅ npx available"

# Try to list tools (basic connectivity test)
echo "🧪 Testing MCP server connection..."

# Use gtimeout on macOS if available, otherwise try without timeout
if command -v gtimeout &> /dev/null; then
    TIMEOUT_CMD="gtimeout 30s"
elif command -v timeout &> /dev/null; then
    TIMEOUT_CMD="timeout 30s"
else
    TIMEOUT_CMD=""
fi

$TIMEOUT_CMD npx @modelcontextprotocol/inspector --cli node bin/remcode-stdio.js --method tools/list > /tmp/mcp-tools.json 2>&1

if [ $? -eq 0 ]; then
    echo "✅ MCP server connected successfully"
    
    # Count tools if JSON parsing is available
    if command -v jq &> /dev/null; then
        TOOL_COUNT=$(jq '. | length' /tmp/mcp-tools.json 2>/dev/null || echo "0")
    else
        TOOL_COUNT=$(grep -o '"name"' /tmp/mcp-tools.json | wc -l || echo "0")
    fi
    
    echo "📋 Found $TOOL_COUNT tools"
    
    if [ "$TOOL_COUNT" -gt 20 ]; then
        echo "✅ Tool count looks good (>20 tools)"
    else
        echo "⚠️  Low tool count - may indicate issues"
    fi
else
    echo "❌ MCP server connection failed"
    echo "Error output:"
    cat /tmp/mcp-tools.json
    exit 1
fi

# Clean up
rm -f /tmp/mcp-tools.json

echo "🎉 MCP Inspector validation complete!"