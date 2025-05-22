# templates.ts

**File Path:** `workflows/templates.ts`

## Overview

Workflow template types

## Dependencies

- `../utils/logger`

## Classes

### `WorkflowTemplates`

**Methods:**

- `getWorkflowTemplate()`
- `switch()`
- `if()`
- `Error()`
- `getRemcodeWorkflowTemplate()`
- `Date()`
- `getRemcodeScheduledWorkflowTemplate()`
- `Date()`
- `if()`
- `getRemcodeAdvancedWorkflowTemplate()`
- `Date()`
- `always()`
- `always()`
- `getRemcodeCachedWorkflowTemplate()`
- `Date()`
- `hashFiles()`
- `always()`
- `getRemcodeWithNotificationsTemplate()`
- `Date()`
- `if()`
- `success()`
- `failure()`
- `if()`
- `always()`
- `getCustomWorkflowTemplate()`
- `if()`

## Interfaces

### `WorkflowScheduleConfig`

**Properties:**

- `enabled: boolean;`
- `cron: string;`
- `branches?: string[];`

### `WorkflowNotificationConfig`

**Properties:**

- `slack?: {`
- `enabled: boolean;`
- `webhook?: string;`
- `channel?: string;`
- `};`
- `email?: {`
- `enabled: boolean;`
- `recipients?: string[];`
- `};`

### `WorkflowEnvironmentConfig`

**Properties:**

- `nodeVersion: string;`
- `useCache: boolean;`
- `runnerOS: 'ubuntu-latest' | 'windows-latest' | 'macos-latest';`
- `npmVersion?: string;`
- `extraPackages?: string[];`

### `WorkflowTemplateOptions`

**Properties:**

- `repoName: string;`
- `branches?: string[];`
- `schedule?: WorkflowScheduleConfig;`
- `notifications?: WorkflowNotificationConfig;`
- `environment?: WorkflowEnvironmentConfig;`
- `secrets?: Record<string, string>;`
- `parameters?: Record<string, any>;`
- `version?: string;`
- `customTemplate?: string;`

