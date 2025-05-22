# initializer.ts

**File Path:** `setup/initializer.ts`

## Overview

Setup options

## Dependencies

- `../utils/logger`
- `./detector`
- `./prerequisites`
- `./secrets`
- `./workflow-generator`
- `./remcode-config`

## Classes

### `SetupInitializer`

**Methods:**

- `SetupDetector()`
- `Prerequisites()`
- `SecretsManager()`
- `WorkflowGenerator()`
- `RemcodeConfigManager()`
- `initializeRepository()`
- `if()`
- `if()`
- `Error()`
- `secrets()`
- `if()`
- `if()`
- `Error()`
- `workflow()`
- `if()`
- `if()`
- `Error()`
- `catch()`
- `String()`
- `Date()`
- `checkSetupNeeds()`
- `updateSetup()`
- `cleanupSetup()`
- `catch()`
- `String()`

## Interfaces

### `SetupOptions`

**Properties:**

- `owner: string;`
- `repo: string;`
- `token?: string;`
- `defaultBranch?: string;`
- `skipSecrets?: boolean;`
- `skipWorkflow?: boolean;`
- `forceUpdate?: boolean;`
- `workflowType?: WorkflowTemplateType;`
- `customSecrets?: Record<string, string>;`

### `SetupResult`

**Properties:**

- `success: boolean;`
- `setupStatus: SetupStatus;`
- `prerequisites?: PrerequisiteCheck[];`
- `secretsResult?: SecretsOperationSummary;`
- `workflowResult?: WorkflowGenerationResult;`
- `configResult?: RemcodeConfig;`
- `error?: string;`
- `duration: number;`

