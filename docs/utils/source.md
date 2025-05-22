# source.ts

**File Path:** `utils/source.ts`

## Overview

Source types supported by the resolver

## Dependencies

- `./logger`

## Interfaces

### `ParsedSource`

**Interface Definition:**

```typescript
export interface ParsedSource {
  type: SourceType;
  // For Git repositories
  owner?: string;
  repo?: string;
  branch?: string;
  path?: string;
  // For HTTP URLs
  url?: string;
  // For local paths
  localPath?: string;
  // Original source string
  originalSource: string;
}
```

## Functions

### `resolveSource()`

**Function Signature:**

```typescript
export function resolveSource(source: string, options: SourceOptions = {
```

**Full Function:**

```typescript
export function resolveSource(source: string, options: SourceOptions = {}
```

### `detectLanguages()`

**Function Signature:**

```typescript
export function detectLanguages(directory: string): Promise<Record<string, number>> {
```

**Full Function:**

```typescript
export function detectLanguages(directory: string): Promise<Record<string, number>> {
  const fileStats: Record<string, number> = {};
  const languages: Record<string, number> = {};
  
  // Map file extensions to languages
  const extensionMap: Record<string, string> = {
    '.py': 'python',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.h': 'c',
    '.hpp': 'cpp',
    '.rb': 'ruby',
    '.go': 'go',
    '.php': 'php',
    '.cs': 'csharp',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.rs': 'rust',
  };
  
  // Count files by extension
  function countFiles(dir: string): void {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        countFiles(filePath);
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        fileStats[ext] = (fileStats[ext] || 0) + 1;
      }
    }
  }
  
  // Count files in the directory
  countFiles(directory);
  
  // Convert file extensions to languages
  for (const [ext, count] of Object.entries(fileStats)) {
    const language = extensionMap[ext];
    if (language) {
      languages[language] = (languages[language] || 0) + count;
    }
  }
  
  return languages;
}
```

