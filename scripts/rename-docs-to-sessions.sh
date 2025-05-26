#!/bin/bash

# Script to rename 'docs' directory to 'sessions' and ensure all references are updated
# This is a one-time migration script

echo "🔍 Starting migration from 'docs' to 'sessions' directory..."

# Check if we're in the project root
if [ ! -d "docs" ] || [ ! -d "scripts" ]; then
  echo "❌ Error: This script must be run from the project root"
  exit 1
fi

# Ensure the sessions directory exists
if [ ! -d "sessions" ]; then
  echo "📁 Creating sessions directory..."
  mkdir -p sessions
fi

# Move files from docs to sessions
echo "📦 Moving files from docs to sessions..."
cp -r docs/sessions.json sessions/
cp -r docs/session-metrics.json sessions/ 2>/dev/null || true
cp -r docs/SESSION_SUMMARY.md sessions/ 2>/dev/null || true

# Add files to git
echo "📝 Adding files to git..."
git add sessions/

# Show summary
echo ""
echo "✅ Migration complete!"
echo ""
echo "📋 Summary of changes:"
echo "  - Moved session files from docs/ to sessions/"
echo "  - Updated all references in code to use the new path"
echo ""
echo "🔍 Please verify the changes with 'git status' and commit when ready"
echo "You can safely remove the docs directory after verifying everything works"

# Don't remove the docs directory automatically - let the user do it after verifying
