#!/bin/bash

# Git hooks installer script
# Sets up local Git hooks for session automation

echo "🔧 Installing Git hooks for session automation..."

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [[ -z "$REPO_ROOT" ]]; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

HOOKS_DIR="$REPO_ROOT/.git/hooks"
SCRIPTS_DIR="$REPO_ROOT/scripts/git-hooks"

# Check if scripts directory exists
if [[ ! -d "$SCRIPTS_DIR" ]]; then
    echo "❌ Error: Git hooks scripts directory not found at $SCRIPTS_DIR"
    exit 1
fi

# Make scripts executable
chmod +x "$SCRIPTS_DIR"/*

# Install pre-commit hook
if [[ -f "$SCRIPTS_DIR/pre-commit" ]]; then
    cp "$SCRIPTS_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "✅ Installed pre-commit hook (session validation)"
else
    echo "⚠️ Warning: pre-commit script not found"
fi

# Install post-commit hook
if [[ -f "$SCRIPTS_DIR/post-commit" ]]; then
    cp "$SCRIPTS_DIR/post-commit" "$HOOKS_DIR/post-commit"
    chmod +x "$HOOKS_DIR/post-commit"
    echo "✅ Installed post-commit hook (session suggestions)"
else
    echo "⚠️ Warning: post-commit script not found"
fi

echo ""
echo "🎉 Git hooks installed successfully!"
echo ""
echo "📋 Installed hooks:"
echo "   • pre-commit: Validates SESSIONS.csv and auto-generates insights"
echo "   • post-commit: Suggests session entries after development commits"
echo ""
echo "💡 The hooks will:"
echo "   • Prevent commits with invalid session data"
echo "   • Auto-update analysis reports when sessions change"
echo "   • Remind you to track development sessions"
echo ""
echo "🚀 You're all set for automated session tracking!"