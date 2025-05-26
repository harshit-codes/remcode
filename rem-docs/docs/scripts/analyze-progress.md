# analyze-progress.js

**File Path:** `docs/scripts/analyze-progress.js`

## Overview

Progress Analysis Script

Analyzes session progress focusing on focus areas, achievements, and next steps
Provides insights into development momentum and priorities

Parse CSV file and return session data
@returns {Array} Array of session objects

Parse CSV line handling quotes properly

Analyze progress patterns and momentum
@param {Array} sessions - Array of session objects
@returns {Object} Progress analysis results

Generate progress report
@param {Object} analysis - Progress analysis results
@returns {string} Formatted progress report

CLI interface

## Functions

### `parseSessionsCSV()`

```typescript
export function parseSessionsCSV()
```

### `parseCSVLine()`

```typescript
export function parseCSVLine()
```

### `analyzeProgress()`

```typescript
export function analyzeProgress()
```

### `generateProgressReport()`

```typescript
export function generateProgressReport()
```

## Variables

- `fs`
- `path`
- `SESSIONS_FILE`
- `content`
- `lines`
- `headers`
- `sessions`
- `i`
- `line`
- `values`
- `session`
- `values`
- `current`
- `inQuotes`
- `i`
- `char`
- `analysis`
- `focus`
- `recentSessions`
- `nextStepsSet`
- `focus`
- `duration`
- `report`
- `statusIcon`
- `date`
- `recentAchievements`
- `date`
- `shortAchievement`
- `shortPriority`
- `sortedFocus`
- `hours`
- `shortFocus`
- `sessions`
- `analysis`
- `report`
- `reportPath`
- `timestamp`
- `fileContent`

