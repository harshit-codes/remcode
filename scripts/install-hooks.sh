#!/bin/bash

# Script to install Git hooks for enforcing session documentation workflow
# This ensures consistent workflow across all development environments

echo "🔧 Installing Git hooks for session documentation workflow..."

# Get the project root directory
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
if [ -z "$PROJECT_ROOT" ]; then
  echo "❌ Error: Not in a git repository"
  exit 1
fi

# Ensure scripts directory exists
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
if [ ! -d "$HOOKS_DIR" ]; then
  echo "❌ Error: .git/hooks directory not found"
  exit 1
fi

# Create pre-commit hook
echo "📝 Installing pre-commit hook..."
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

# Pre-commit hook for session data validation
# Enforces session documentation before allowing commits

echo "🔍 Pre-commit: Checking session documentation..."

# 1. First, check if this is a significant code change that requires session documentation
CHANGED_FILES=$(git diff --cached --name-only | grep -v "sessions/sessions.json" | wc -l)
SESSION_JSON_UPDATED=$(git diff --cached --name-only | grep -q "sessions/sessions.json" && echo "true" || echo "false")

# Calculate timestamp for today's session boundaries (start of day)
TODAY=$(date +"%Y-%m-%d")

# Only enforce session documentation for significant code changes
if [ $CHANGED_FILES -gt 5 ] && [ "$SESSION_JSON_UPDATED" != "true" ]; then
    echo "🚨 Session documentation required for significant code changes!"
    echo "Found $CHANGED_FILES changed files but sessions.json not updated."
    echo ""
    echo "⚠️  Please document your work session before committing:"
    echo "   1. cd scripts"
    echo "   2. npm run template > template.json"
    echo "   3. Edit the template and add to sessions.json"
    echo "   4. npm run validate (to validate your changes)"
    echo "   5. git add sessions/sessions.json"
    echo ""
    echo "❌ Commit aborted. Session documentation required."
    exit 1
fi

# 2. If sessions.json is being committed, validate it
if [ "$SESSION_JSON_UPDATED" = "true" ]; then
    echo "📊 sessions.json detected in commit, validating..."
    
    # Navigate to scripts directory and validate
    cd scripts 2>/dev/null || {
        echo "❌ Error: scripts directory not found"
        exit 1
    }
    
    # Run validation
    if npx ts-node --transpile-only session/validator.ts --validate-all; then
        echo "✅ Session data validation passed"
        
        # Auto-generate report if validation passes
        echo "📈 Generating updated session report..."
        if npx ts-node --transpile-only session/report-generator.ts > /dev/null 2>&1; then
            echo "📊 Session report updated"
            
            # Add generated files to the commit
            git add ../sessions/SESSION_SUMMARY.md ../sessions/session-metrics.json 2>/dev/null
        else
            echo "⚠️ Warning: Could not generate report, but proceeding with commit"
        fi
    else
        echo "❌ Session data validation failed!"
        echo ""
        echo "Please fix the validation errors before committing."
        echo ""
        echo "💡 Tip: Use 'npm run validate' in docs/scripts to check your data"
        exit 1
    fi
fi

echo "✅ Pre-commit validation complete"
exit 0
EOF

# Create post-commit hook
echo "📝 Installing post-commit hook..."
cat > "$HOOKS_DIR/post-commit" << 'EOF'
#!/bin/bash

# Post-commit hook for session documentation
# Reminds users to document their work sessions

echo "📝 Post-commit: Checking session documentation status..."

# Get commit message and changed files
COMMIT_MSG=$(git log -1 --pretty=%B)
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD)
FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l)
SESSION_UPDATED=$(echo "$CHANGED_FILES" | grep -q "sessions/sessions.json" && echo "true" || echo "false")

# Check if a significant development session occurred
if [[ $FILE_COUNT -gt 3 ]] && [ "$SESSION_UPDATED" != "true" ]; then
    # This was a significant code change without session documentation
    echo ""
    echo "🎥 ⚡ REMEMBER TO DOCUMENT YOUR WORK SESSION ⚡"
    echo "📊 Files changed: $FILE_COUNT"
    echo "💬 Commit message: $(echo "$COMMIT_MSG" | head -1)"
    echo ""
    echo "🖥  Document your session with a single command:"
    echo "   cd scripts && npm run session:document -- \\"
    echo "      --description=\"feature-name\" \\"
    echo "      --focus=\"What you worked on\" \\"
    echo "      --achievements=\"What you accomplished\" \\"
    echo "      --next-steps=\"What to do next\""
    echo "   5. git add sessions/sessions.json"
    echo "   6. git commit -m 'docs: Add session documentation for $(date +"%Y-%m-%d")'"
    echo ""
    echo "💾 Your next commit will fail if you make significant changes without session documentation"
    echo ""
elif [ "$SESSION_UPDATED" = "true" ]; then
    echo "✅ Thank you for documenting your work session!"
    echo "📈 Session report has been updated automatically."
else
    echo "📋 Minor changes detected, no session entry needed"
fi

exit 0
EOF

# Make hooks executable
chmod +x "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/post-commit"

# Create a package.json script to run this installation
if [ -f "$PROJECT_ROOT/package.json" ]; then
  # Check if script already exists
  if ! grep -q '"install-hooks"' "$PROJECT_ROOT/package.json"; then
    # Add the script entry (simple sed replacement)
    sed -i.bak 's/"scripts": {/"scripts": {\n    "install-hooks": "bash scripts\/install-hooks.sh",/g' "$PROJECT_ROOT/package.json"
    rm -f "$PROJECT_ROOT/package.json.bak"
    echo "✅ Added 'npm run install-hooks' script to package.json"
  fi
fi

echo "✅ Git hooks installed successfully!"
echo ""
echo "💡 Team members should run 'npm run install-hooks' after cloning the repository"
echo "   to enable the session documentation workflow."
