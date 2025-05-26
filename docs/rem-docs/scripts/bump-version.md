# bump-version.js

**File Path:** `scripts/bump-version.js`

## Overview

Automatic Version Bumping Script

This script automatically bumps the package version based on commit messages:
- feat: minor version bump
- fix: patch version bump  
- BREAKING CHANGE: major version bump
- chore/docs/style: patch version bump

## Functions

### `getCurrentVersion()`

```typescript
export function getCurrentVersion()
```

### `setVersion()`

```typescript
export function setVersion()
```

### `bumpVersion()`

```typescript
export function bumpVersion()
```

### `determineVersionBump()`

```typescript
export function determineVersionBump()
```

### `main()`

```typescript
export function main()
```

## Variables

- `fs`
- `packageJson`
- `packageJson`
- `currentVersion`
- `newVersion`
- `commitMessage`
- `currentVersion`
- `bumpType`
- `newVersion`

