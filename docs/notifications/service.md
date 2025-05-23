# service.ts

**File Path:** `notifications/service.ts`

## Overview

Send notification via all configured channels

## Dependencies

- `../utils/logger`

## Classes

### `NotificationService`

Send notification via all configured channels

```typescript
class NotificationService {
// ... implementation
}
```

**Methods:**

#### `sendNotification()`

Send notification via all configured channels

```typescript
sendNotification(payload: NotificationPayload): Promise<{
```

#### `getSlackColor()`

Get Slack color based on notification type

```typescript
getSlackColor(type: NotificationPayload['type']): string {
```

#### `getSlackEmoji()`

Get Slack emoji based on notification type

```typescript
getSlackEmoji(type: NotificationPayload['type']): string {
```

#### `createWorkflowNotification()`

Create notification for workflow completion

```typescript
createWorkflowNotification(
```

#### `createHealthNotification()`

Create notification for workflow health issues

```typescript
createHealthNotification(
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

- `defaultNotificationConfigs`

