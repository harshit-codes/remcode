# remcode-config.ts

**File Path**: `setup/remcode-config.ts`

## Description

Available embedding models

## Classes

- `RemcodeConfigManager`

## Interfaces

- `RepositoryConfig`
- `ProcessingConfig`
- `VectorizationConfig`
- `StatisticsConfig`
- `AdvancedConfig`
- `WebhookConfig`
- `RemcodeConfig`
- `ConfigValidationResult`

## Documentation Comments

### Comment 1

Available embedding models (Inference API compatible)

### Comment 2

Vector DB providers

### Comment 3

Processing status values

### Comment 4

Repository configuration

### Comment 5

Processing configuration

### Comment 6

Vectorization configuration

### Comment 7

Statistics configuration

### Comment 8

Advanced configuration options

### Comment 9

Webhook configuration

### Comment 10

Complete Remcode configuration

### Comment 11

Configuration validation result

### Comment 12

Class to manage Remcode configuration

### Comment 13

Constructor
 @param repoPath Path to the repository

### Comment 14

Create initial configuration file
 @param owner Repository owner
 @param repo Repository name
 @param options Additional configuration options
 @returns The created configuration

### Comment 15

Read configuration from file
 @returns The current configuration

### Comment 16

Update configuration with new values
 @param updates Configuration updates
 @returns The updated configuration

### Comment 17

Update processing status and statistics
 @param status New processing status
 @param stats Updated statistics
 @param commit Last processed commit hash
 @returns The updated configuration

### Comment 18

Validate configuration
 @param config Configuration to validate
 @returns Validation result

### Comment 19

Build initial configuration
 @param owner Repository owner
 @param repo Repository name
 @param options Additional configuration options
 @returns Initial configuration

### Comment 20

',
          '.git/**',
          'dist/**',
          'build/**',
          '*

### Comment 21

Deep merge two objects
 @param target Target object
 @param source Source object
 @returns Merged object

### Comment 22

Upgrade configuration to the latest version
 @param config Configuration to upgrade

### Comment 23

',
            '.git/**',
            'dist/**',
            'build/**',
            '*

### Comment 24

Check if configuration exists
 @returns True if configuration exists

### Comment 25

Delete configuration file
 @returns True if configuration was deleted

### Comment 26

Helper function to check if a value is an object
 @param item Item to check
 @returns True if the item is an object

## Code Overview

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import { getLogger } from '../utils/logger';

// Key exports:
export class RemcodeConfigManager { ... }
export interface RepositoryConfig { ... }
export interface ProcessingConfig { ... }
export interface VectorizationConfig { ... }
export interface StatisticsConfig { ... }
export interface AdvancedConfig { ... }
export interface WebhookConfig { ... }
export interface RemcodeConfig { ... }
export interface ConfigValidationResult { ... }
```

## File Statistics

- **Lines of Code**: 549
- **File Size**: 15727 bytes
- **Last Modified**: 2025-05-25T05:55:02.437Z

