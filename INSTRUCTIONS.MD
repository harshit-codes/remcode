# ⚡ CRITICAL WORKFLOW - Run After Every Major Work Session
📊 Session Documentation Process

## 1. Document Your Session (Single Command)
```bash
cd scripts && npm run session:document -- \
  --description="feature-name" \
  --focus="What you worked on" \
  --achievements="What you accomplished" \
  --next-steps="What to do next" \
  --learnings="Key insights" \
  --blockers="Any blockers (use 'None' if none)" \
  --duration=60  # minutes
```

### Additional optional parameters:
- `--status=completed|in_progress|blocked` (default: completed)
- `--notes="Additional context"`
- `--files-changed="Files modified"` (auto-detected if omitted)
- `--developer="developer-name"` (default: harshit-codes)
- `--auto-commit` (automatically commits the session documentation)

## 2. Commit Your Session Documentation (if not using --auto-commit)
```bash
git add sessions/
git commit -m "docs: Add session documentation"
```

## 🔍 Automatic Validation Rules

✅ sessionId: YYYY-MM-DD-description format required
✅ timestamp: ISO 8601 format required (YYYY-MM-DDTHH:MM:SSZ)
✅ status: Must be "completed", "in_progress", or "blocked"
✅ duration: 1-600 minutes (number type)
✅ All fields: Required (use "None" for empty values)

## 🏗️ Development Environment Context File Paths

Local: /Users/harshitchoudhary/Documents/remcode/remcode
GitHub: https://github.com/harshit-codes/remcode
Test Local: /Users/harshitchoudhary/Documents/Github/remcode-test
Test GitHub: https://github.com/yashvibansalmin19/remcode-test

## Documentation Structure

Code Mirror: rem-docs/ folder contains markdown documentation for every code file
Key Files: README.md, sessions/sessions.json (primary)
⚠️ CRITICAL: DO NOT MODIFY ROOT README.MD FILE

## Development Philosophy

Public Libraries First: Extensively use existing packages vs reinventing
Tool Integration: Leverage GitHub, Desktop Commander, and MCP tools
Environment Variables: Read from .env files
Open Source: All work committed to GitHub


# 🎯 Development Session Protocol
## Phase 1: Context & Planning

📚 Review Documentation: Check rem-docs/ for relevant code file documentation
📊 Check Previous Sessions: Review sessions/sessions.json for recent work context
❓ Ask Clarifying Questions: Narrow scope to essential changes only
✅ Verify Approach: Confirm strategy before coding

## Phase 2: Implementation Strategy

🎯 Build Code Strategy: Define clear, modular approach
❓ Strategy Validation: Ask clarifying questions to confirm approach
📋 Verify Implementation Plan: Ensure strategy aligns with requirements

## Phase 3: Development Execution

💻 Perform Actions: Write modular, well-documented code
📝 Document Progress: PERIODICALLY UPDATE SESSION DOCUMENTATION during work
🏗️ Code Standards:

Use existing files/folders - DO NOT create new structure
Add JSDoc comments to all functions and classes
Respect file size limits - split large files into chunks:
```typescript
// First chunk
write_file(path, firstChunk, {mode: 'rewrite'})
// Additional chunks  
write_file(path, nextChunk, {mode: 'append'})
```

## Phase 4: Testing & Validation

🧪 Test Implementation: Follow existing testing framework organization
✅ Verify Results: Provide clear validation steps
📊 Respect Test Structure: Use existing test file organization

## Phase 5: Session Completion

📋 Final Session Documentation: Document your session with the session:document command
💾 Save Session: Auto-generated in sessions/sessions.json 
🚀 Push Code: Commit and push all changes to GitHub


# 🛠️ Tool Integration
## Available Tools

GitHub Integration: Repository management, PR/issue handling
Desktop Commander: File system operations, command execution
MCP Tools: Model Context Protocol for AI assistant integration

## Data Sources

Environment Variables: Read from .env files
Configuration: Use existing config files and patterns
Documentation: Leverage rem-docs/ mirrored documentation


# 📋 Quality Standards
## Code Quality

Modular Functions: Clear, single-responsibility functions
Descriptive Names: Self-documenting function and variable names
JSDoc Comments: Comprehensive documentation for all public APIs
File Size Management: Split large implementations appropriately

## Testing Requirements

Existing Framework: Respect current test organization
Unit Tests: Place tests in appropriate existing directories
Validation Steps: Provide clear testing instructions

## Documentation Requirements

Session Tracking: Use simplified session:document command
Progress Updates: Document major milestones during implementation
Learning Capture: Record key insights and decisions


# 🎉 Success Criteria
## Session Completion Checklist

✅ Context Understood: Reviewed relevant documentation and previous sessions
✅ Strategy Validated: Confirmed approach with clarifying questions
✅ Code Implemented: Modular, documented, tested implementation
✅ Session Documented: Used session:document command to record your work
✅ Changes Committed: All work pushed to GitHub repository

## Quality Indicators

✅ No New Structure: Used existing files/folders appropriately
✅ Documentation Updated: JSDoc comments added to modified functions
✅ Tests Passing: Existing test framework validates changes
✅ Session Validated: Validation occurs automatically with session:document
