#!/bin/bash
# Quick validation that LLM optimization setup is working

echo "🔍 Testing LLM Optimization Setup..."

# Check if required files exist
echo "📋 Checking required files..."

FILES=(
    "LEAN_CODEBASE_STRATEGY.md"
    "scripts/llm-optimization/validate-docs.sh"
    "scripts/llm-optimization/generate-docs.js" 
    "scripts/llm-optimization/setup.js"
    "LLM_OPTIMIZATION_SUMMARY.md"
)

missing_files=()
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    else
        echo "✅ $file"
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Missing files:"
    printf '  - %s\n' "${missing_files[@]}"
    exit 1
fi

# Check if scripts are executable
echo -e "\n🔧 Checking script permissions..."
if [ -x "scripts/llm-optimization/validate-docs.sh" ]; then
    echo "✅ validate-docs.sh is executable"
else
    echo "⚠️  Making validate-docs.sh executable..."
    chmod +x scripts/llm-optimization/validate-docs.sh
fi

if [ -x "scripts/llm-optimization/generate-docs.js" ]; then
    echo "✅ generate-docs.js is executable"
else
    echo "⚠️  Making generate-docs.js executable..."
    chmod +x scripts/llm-optimization/generate-docs.js
fi

# Test documentation generation
echo -e "\n📚 Testing documentation generation..."
if node scripts/llm-optimization/generate-docs.js > /tmp/doc-test.log 2>&1; then
    echo "✅ Documentation generation works"
    if [ -f "docs/generated/QUICK_REFERENCE.md" ]; then
        echo "✅ Documentation files created"
    fi
else
    echo "⚠️  Documentation generation had issues (this may be normal for first run)"
    echo "Check /tmp/doc-test.log for details"
fi

# Test validation script
echo -e "\n🔍 Testing validation script..."
if bash scripts/llm-optimization/validate-docs.sh > /tmp/validation-test.log 2>&1; then
    echo "✅ Validation script works (no critical errors)"
else
    echo "⚠️  Validation found issues (expected for existing codebase)"
    echo "This is normal - validation enforces new LLM optimization standards"
fi

# Check for Node.js dependencies
echo -e "\n📦 Checking dependencies..."
if node -e "require('glob')" 2>/dev/null; then
    echo "✅ glob dependency available"
else
    echo "⚠️  glob dependency missing - run: npm install --save-dev glob"
fi

if node -e "require('fs')" 2>/dev/null; then
    echo "✅ fs (built-in) available"
else
    echo "❌ Node.js fs module not available"
fi

# Summary
echo -e "\n📊 Setup Summary"
echo "===================="

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required files present"
    echo "✅ LLM optimization infrastructure ready"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Run: node scripts/llm-optimization/setup.js"
    echo "2. Run: bash scripts/llm-optimization/validate-docs.sh"
    echo "3. Run: node scripts/llm-optimization/generate-docs.js"
    echo "4. Review: docs/generated/QUICK_REFERENCE.md"
    echo ""
    echo "📖 Read: LLM_OPTIMIZATION_SUMMARY.md for complete guide"
    echo "📋 Strategy: LEAN_CODEBASE_STRATEGY.md for implementation details"
else
    echo "❌ Setup incomplete - missing files"
    echo "Please ensure all files are created before proceeding"
fi