# analyze-blockers.js

**File Path:** `docs/scripts/analyze-blockers.js`

## Overview

Bugs & Blockers Analysis Script

Analyzes blockers, technical issues, and their resolutions
Provides insights into common problems and solutions

Parse CSV file and return session data

Parse CSV line handling quotes properly

Analyze blockers and issues

Categorize blocker types

Extract issue keywords from blocker text

Extract resolution keywords from achievement text

Generate blockers analysis report

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

### `analyzeBlockers()`

```typescript
export function analyzeBlockers()
```

### `categorizeBlocker()`

```typescript
export function categorizeBlocker()
```

### `extractIssueKeywords()`

```typescript
export function extractIssueKeywords()
```

### `extractResolutionKeywords()`

```typescript
export function extractResolutionKeywords()
```

### `generateBlockersReport()`

```typescript
export function generateBlockersReport()
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
- `hasBlockers`
- `blocker`
- `category`
- `issueKeywords`
- `resolution`
- `resolutionKeywords`
- `categories`
- `keywords`
- `commonIssues`
- `keywords`
- `commonResolutions`
- `report`
- `resolutionRate`
- `sortedCategories`
- `percentage`
- `sortedIssues`
- `sortedResolutions`
- `recentBlockers`
- `date`
- `statusIcon`
- `shortBlocker`
- `shortResolution`
- `shortIssue`
- `shortRes`
- `sessions`
- `analysis`
- `report`
- `reportPath`
- `timestamp`
- `fileContent`

