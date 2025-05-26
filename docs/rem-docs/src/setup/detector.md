# detector.ts

**File Path:** `src/setup/detector.ts`

## Overview

Possible reasons for setup requirements

Git remote information

Detailed setup status information

Class to detect repository setup requirements for Remcode

Constructor
@param repoPath Path to the repository to analyze

Detect all setup requirements

Check if directory is a Git repository

Check if .remcode configuration file exists

Check if GitHub workflow file exists

Get Git remote information

Validate .remcode configuration file

Get .remcode configuration version

Get GitHub workflow version

Get current remcode version

Check if required GitHub secrets are set

Determine the reason for setup requirements

## Dependencies

- `../utils/logger`

## Classes

### `SetupDetector`

```typescript
class SetupDetector {
// ... implementation
}
```

## Interfaces

### `GitRemoteInfo`

```typescript
interface GitRemoteInfo {
// ... properties
}
```

### `SetupStatus`

```typescript
interface SetupStatus {
// ... properties
}
```

## Variables

- `logger`
- `execAsync`
- `hasGitRepo`
- `hasRemcodeFile`
- `hasWorkflow`
- `gitInfo`
- `hasGitHubRepo`
- `hasValidConfig`
- `hasRequiredSecrets`
- `configVersion`
- `workflowVersion`
- `needsSetup`
- `reason`
- `errorMessage`
- `errorMessage`
- `errorMessage`
- `workflowPath`
- `errorMessage`
- `trimmedUrl`
- `isGitHub`
- `owner`
- `httpsMatch`
- `defaultBranch`
- `errorMessage`
- `configPath`
- `configContent`
- `config`
- `errorMessage`
- `configPath`
- `configContent`
- `config`
- `workflowPath`
- `workflowContent`
- `versionMatch`
- `packageJsonPath`
- `packageJson`
- `errorMessage`

