#!/bin/bash

# MCP Inspector Testing Suite Runner
# Phase 2: Tool Validation Implementation

echo "🚀 MCP Inspector Testing Suite - Phase 2: Tool Validation"
echo "============================================================"

# Set environment variables for testing
export NODE_ENV=test
export LOG_LEVEL=debug

# Create test results directory
mkdir -p MCP-Inspect/results

echo "📋 Running Phase 2 Tool Validation Tests..."

# Run individual tool test suites
echo "🔧 Testing Setup Tools..."
npm test -- --testPathPattern="MCP-Inspect/tests/tools/setup.test.ts"

echo "🔍 Testing Search Tools..."
npm test -- --testPathPattern="MCP-Inspect/tests/tools/search.test.ts"

echo "🌲 Testing Pinecone Tools..."
npm test -- --testPathPattern="MCP-Inspect/tests/tools/pinecone.test.ts"

echo "🤗 Testing HuggingFace Tools..."
npm test -- --testPathPattern="MCP-Inspect/tests/tools/huggingface.test.ts"

echo "📚 Testing GitHub Tools..."
npm test -- --testPathPattern="MCP-Inspect/tests/tools/github.test.ts"

echo "⚙️ Testing Processing Tools..."
npm test -- --testPathPattern="MCP-Inspect/tests/tools/processing.test.ts"

echo "⚡ Testing Performance..."
npm test -- --testPathPattern="MCP-Inspect/tests/performance.test.ts"

echo "🚨 Testing Error Handling..."
npm test -- --testPathPattern="MCP-Inspect/tests/error-handling.test.ts"

echo "🔗 Testing Integration..."
npm test -- --testPathPattern="MCP-Inspect/tests/integration.test.ts"

echo "✅ Phase 2 Tool Validation Complete!"
echo "📊 Results saved in MCP-Inspect/results/"
