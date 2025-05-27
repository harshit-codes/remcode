#!/bin/bash

# Phase 3: Real MCP Inspector Testing Runner
# Executes comprehensive real-world validation of Remcode MCP tools

echo "🚀 Phase 3: Real MCP Inspector Testing"
echo "======================================"

# Ensure we're in the correct directory
cd "$(dirname "$0")/../.."

# Check prerequisites
echo "📋 Checking Prerequisites..."

# Check if build exists
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build not found. Running npm run build..."
    npm run build
fi

# Check if STDIO bridge exists
if [ ! -f "bin/remcode-stdio.js" ]; then
    echo "❌ STDIO bridge not found at bin/remcode-stdio.js"
    echo "Please ensure the build includes the STDIO bridge"
    exit 1
fi

# Check MCP Inspector
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

echo "✅ Prerequisites checked"

# Run Phase 3 tests
echo ""
echo "🧪 Running Phase 3 Real MCP Tests..."
echo "Using Jest config: test-scenarios/phase3-real-mcp/jest.config.json"

# Execute tests with specific Jest config
npx jest --config=test-scenarios/phase3-real-mcp/jest.config.json --verbose

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Phase 3: Real MCP Testing PASSED"
    echo "🎯 All README features validated with real MCP calls"
else
    echo ""
    echo "❌ Phase 3: Real MCP Testing FAILED"
    echo "Check the output above for specific failures"
    exit 1
fi
