# logger.ts

**File Path:** `utils/logger.ts`

## Overview

Log levels

## Interfaces

### `LogRecord`

```typescript
interface LogRecord {
// ... properties
}
```

### `Logger`

```typescript
interface Logger {
// ... properties
}
```

### `LoggerConfig`

```typescript
interface LoggerConfig {
// ... properties
}
```

## Functions

### `configureLogger()`

```typescript
export function configureLogger(config: Partial<LoggerConfig>): void {
```

### `createLogger()`

```typescript
export function createLogger(name: string, baseMetadata: Record<string, any> = {
```

### `getLogger()`

```typescript
export function getLogger(component: string): Logger {
```

### `logError()`

```typescript
export function logError(error: Error, context?: string): void {
```

### `getLogLevel()`

```typescript
export function getLogLevel(): LogLevel {
```

### `setLogLevel()`

```typescript
export function setLogLevel(level: LogLevel): void {
```

### `enableFileLogging()`

```typescript
export function enableFileLogging(filePath: string, format: 'text' | 'json' = 'text'): void {
```

### `disableFileLogging()`

```typescript
export function disableFileLogging(): void {
```

## Variables

- `LogLevelNames`
- `defaultLoggerConfig`
- `logger`

