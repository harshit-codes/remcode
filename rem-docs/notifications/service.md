# service.ts

**File Path**: `notifications/service.ts`

## Description

Send notification via all configured channels

## Classes

- `NotificationService`

## Interfaces

- `NotificationConfig`
- `NotificationPayload`

## Constants

- `defaultNotificationConfigs`

## Documentation Comments

### Comment 1

Send Slack notification

### Comment 2

Send email notification (placeholder implementation)

### Comment 3

Create GitHub issue for critical failures

### Comment 4

Get Slack color based on notification type

### Comment 5

Get Slack emoji based on notification type

### Comment 6

Create notification for workflow completion

### Comment 7

Create notification for workflow health issues

### Comment 8

Default notification configurations for common scenarios

### Comment 9

Basic Slack-only configuration

### Comment 10

Comprehensive notification configuration

## Code Overview

```typescript
import { getLogger } from '../utils/logger';

// Key exports:
export class NotificationService { ... }
export interface NotificationConfig { ... }
export interface NotificationPayload { ... }
```

## File Statistics

- **Lines of Code**: 327
- **File Size**: 9160 bytes
- **Last Modified**: 2025-05-23T18:23:20.372Z

