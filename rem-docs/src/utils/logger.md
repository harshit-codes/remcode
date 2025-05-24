# logger.ts

**File Path:** `src/utils/logger.ts`

## Overview

Log levels

Log level names for display

Log record structure

Logger interface

Logger configuration

Default logger configuration

Global logger configuration

Configure global logger settings

Format a log record for output

Write a log record to the configured outputs

Create a logger instance

Global logger instance

Get a logger instance for a specific component

Log an error with stack trace

Get the current log level

Set the current log level

Enable file logging

Disable file logging

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
export function configureLogger()
```

### `formatLogRecord()`

```typescript
export function formatLogRecord()
```

### `writeLogRecord()`

```typescript
export function writeLogRecord()
```

### `createLogger()`

```typescript
export function createLogger()
```

### `getLogger()`

```typescript
export function getLogger()
```

### `logError()`

```typescript
export function logError()
```

### `getLogLevel()`

```typescript
export function getLogLevel()
```

### `setLogLevel()`

```typescript
export function setLogLevel()
```

### `enableFileLogging()`

```typescript
export function enableFileLogging()
```

### `disableFileLogging()`

```typescript
export function disableFileLogging()
```

## Variables

- `chalk`
- `LogLevelNames`
- `defaultLoggerConfig`
- `globalConfig`
- `dir`
- `output`
- `timestamp`
- `levelName`
- `levelColor`
- `formattedLog`
- `createLogMethod`
- `error`
- `combinedMetadata`
- `record`
- `combinedMetadata`
- `record`
- `logger`
- `component`
- `logger`

