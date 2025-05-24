# service.ts

**File Path:** `src/notifications/service.ts`

## Overview

Send notification via all configured channels

Send Slack notification

Send email notification (placeholder implementation)

Create GitHub issue for critical failures

Get Slack color based on notification type

Get Slack emoji based on notification type

Create notification for workflow completion

Create notification for workflow health issues

Default notification configurations for common scenarios

Basic Slack-only configuration

Comprehensive notification configuration

## Dependencies

- `../utils/logger`

## Classes

### `NotificationService`

```typescript
class NotificationService {
// ... implementation
}
```

## Interfaces

### `NotificationConfig`

```typescript
interface NotificationConfig {
// ... properties
}
```

### `NotificationPayload`

```typescript
interface NotificationPayload {
// ... properties
}
```

## Variables

- `logger`
- `results`
- `overallSuccess`
- `errorMessage`
- `errorMessage`
- `errorMessage`
- `color`
- `emoji`
- `slackPayload`
- `response`
- `type`
- `title`
- `message`
- `title`
- `message`
- `defaultNotificationConfigs`

