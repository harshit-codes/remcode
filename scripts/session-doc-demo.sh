#!/bin/bash

# Demo script for the new streamlined session documentation process
# Shows how to document a session with a single command

echo "🚀 Testing new one-command session documentation process..."
echo ""

# Example 1: Basic session documentation with minimal options
echo "Example 1: Basic usage with minimal options"
echo "---------------------------------------"
echo "cd scripts && npm run session:document -- --description=\"feature-update\" \\"
echo "                          --focus=\"Updating the feature\" \\"
echo "                          --achievements=\"Fixed bugs, improved performance\""
echo ""

# Example 2: Comprehensive session documentation
echo "Example 2: Comprehensive documentation with all options"
echo "---------------------------------------"
echo "cd scripts && npm run session:document -- --description=\"major-refactor\" \\"
echo "                          --focus=\"Refactoring core components\" \\"
echo "                          --achievements=\"Improved code organization, reduced complexity\" \\"
echo "                          --blockers=\"API rate limits\" \\"
echo "                          --next-steps=\"Complete unit tests\" \\"
echo "                          --files-changed=\"src/core/*.ts, tests/*.ts\" \\"
echo "                          --learnings=\"Better separation of concerns improves maintainability\" \\"
echo "                          --notes=\"Remember to update documentation\" \\"
echo "                          --duration=120 \\"
echo "                          --status=\"completed\" \\"
echo "                          --auto-commit"
echo ""

# Example 3: Auto-detecting changed files
echo "Example 3: Auto-detecting changed files"
echo "---------------------------------------"
echo "cd scripts && npm run session:document -- --description=\"bug-fix\" \\"
echo "                          --focus=\"Fixing critical bug\" \\"
echo "                          --achievements=\"Resolved issue #123\""
echo ""

echo "🎯 Let's try it with a real example:"
echo "---------------------------------------"
cd scripts && npm run session:document -- --description="simplified-documentation" \
                          --focus="Simplifying session documentation process" \
                          --achievements="Created one-command solution, improved developer experience" \
                          --next-steps="Update workflow documentation" \
                          --learnings="Automation reduces friction in development workflow" \
                          --duration=30
