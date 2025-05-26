# analyze-codebase.js

**File Path:** `docs/scripts/analyze-codebase.js`

## Overview

Codebase Context Analysis Script

Analyzes files changed, learnings, and notes to understand codebase evolution
Provides insights into architectural changes and development patterns

Parse CSV file and return session data

Parse CSV line handling quotes properly

Analyze codebase context and evolution

Parse files changed from session text

Get directory from file path

Get file extension

Categorize learning type

Categorize evolution type

Extract insights from learning text

Generate codebase context report

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

### `analyzeCodebaseContext()`

```typescript
export function analyzeCodebaseContext()
```

### `parseFilesChanged()`

```typescript
export function parseFilesChanged()
```

### `getDirectory()`

```typescript
export function getDirectory()
```

### `getExtension()`

```typescript
export function getExtension()
```

### `categorizeLearning()`

```typescript
export function categorizeLearning()
```

### `categorizeEvolution()`

```typescript
export function categorizeEvolution()
```

### `extractInsights()`

```typescript
export function extractInsights()
```

### `generateCodebaseReport()`

```typescript
export function generateCodebaseReport()
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
- `files`
- `dir`
- `ext`
- `learning`
- `evolutionType`
- `insights`
- `files`
- `patterns`
- `match`
- `file`
- `parts`
- `ext`
- `text`
- `text`
- `insights`
- `text`
- `report`
- `sortedDirs`
- `sortedExts`
- `sortedFiles`
- `recentTechnical`
- `shortContent`
- `shortContent`
- `shortContent`
- `shortAchievement`
- `sessions`
- `analysis`
- `report`
- `reportPath`
- `timestamp`
- `fileContent`

