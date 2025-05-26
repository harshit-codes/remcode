# generate-session-report.js

**File Path:** `docs/generate-session-report.js`

## Overview

Simple Session Report Generator

Generates a clean markdown report from SESSIONS.csv for CI/CD cycles
Replaces complex analytics with simple, readable summaries

## Functions

### `generateSessionReport()`

```typescript
export function generateSessionReport()
```

### `parseCSVLine()`

```typescript
export function parseCSVLine()
```

### `generateMarkdownReport()`

```typescript
export function generateMarkdownReport()
```

### `getStatusEmoji()`

```typescript
export function getStatusEmoji()
```

## Variables

- `fs`
- `path`
- `csvPath`
- `csvContent`
- `lines`
- `headers`
- `sessions`
- `values`
- `session`
- `report`
- `reportPath`
- `metrics`
- `values`
- `current`
- `inQuotes`
- `i`
- `char`
- `now`
- `totalHours`
- `completedSessions`
- `inProgressSessions`
- `blockedSessions`
- `recentSessions`
- `currentBlockers`
- `report`
- `sessionDetails`
- `blockersSection`
- `learningsSection`

