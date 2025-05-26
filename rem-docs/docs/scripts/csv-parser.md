# csv-parser.js

**File Path:** `docs/scripts/csv-parser.js`

## Overview

CSV Parser Utility for Session Data

Provides robust CSV parsing with proper handling of:
- Quoted fields containing commas
- Multi-line data
- Header detection and mapping
- Data type inference

Parse CSV content into array of objects
@param {string} csvContent - Raw CSV content
@returns {Array<Object>} Parsed data as array of objects

Parse a single CSV line handling quotes and commas
@param {string} line - CSV line to parse
@returns {Array<string>} Array of field values

Convert array of objects back to CSV format
@param {Array<Object>} data - Data to convert
@returns {string} CSV formatted string

## Functions

### `parseCSV()`

```typescript
export function parseCSV()
```

### `parseCSVLine()`

```typescript
export function parseCSVLine()
```

### `arrayToCSV()`

```typescript
export function arrayToCSV()
```

## Variables

- `lines`
- `headers`
- `data`
- `i`
- `values`
- `row`
- `fields`
- `currentField`
- `inQuotes`
- `i`
- `char`
- `nextChar`
- `headers`
- `csvLines`
- `values`
- `value`

