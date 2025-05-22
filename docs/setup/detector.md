# detector.ts

**File Path:** `setup/detector.ts`

## Overview

Possible reasons for setup requirements

## Dependencies

- `../utils/logger`

## Classes

### `SetupDetector`

**Methods:**

- `detectSetupNeeds()`
- `Date()`
- `catch()`
- `String()`
- `Error()`
- `hasGitRepository()`
- `catch()`
- `String()`
- `hasRemcodeFile()`
- `catch()`
- `String()`
- `hasGitHubWorkflow()`
- `catch()`
- `String()`
- `getGitRemoteInfo()`
- `execAsync()`
- `if()`
- `if()`
- `if()`
- `execAsync()`
- `catch()`
- `String()`
- `validateRemcodeConfig()`
- `catch()`
- `String()`
- `getConfigVersion()`
- `catch()`
- `getWorkflowVersion()`
- `catch()`
- `getRemcodeVersion()`
- `if()`
- `catch()`
- `String()`
- `checkRequiredSecrets()`
- `getSetupReason()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`
- `if()`

## Interfaces

### `GitRemoteInfo`

**Properties:**

- `exists: boolean;`
- `url: string;`
- `owner?: string;`
- `repo?: string;`
- `isGitHub: boolean;`
- `defaultBranch?: string;`

### `SetupStatus`

**Properties:**

- `needsSetup: boolean;`
- `hasRemcodeFile: boolean;`
- `hasGitRepo: boolean;`
- `hasGitHubRepo: boolean;`
- `hasWorkflow: boolean;`
- `hasRequiredSecrets: boolean;`
- `hasValidConfig: boolean;`
- `reason: SetupReason;`
- `gitInfo?: GitRemoteInfo;`
- `configVersion?: string;`
- `workflowVersion?: string;`
- `remcodeVersion?: string;`
- `detectionTimestamp: string;`

