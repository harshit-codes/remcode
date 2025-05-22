# logger.ts

**File Path:** `utils/logger.ts`

## Overview

Log levels

## Interfaces

### `LogRecord`

**Interface Definition:**

```typescript
export interface LogRecord {
  timestamp: Date;
  level: LogLevel;
  name: string;
  message: string;
  metadata?: Record<string, any>;
  error?: Error;
}
```

### `Logger`

**Interface Definition:**

```typescript
export interface Logger {
  trace(message: string, metadata?: Record<string, any>): void;
  debug(message: string, metadata?: Record<string, any>): void;
  info(message: string, metadata?: Record<string, any>): void;
  warn(message: string, metadata?: Record<string, any>): void;
  error(message: string, error?: Error, metadata?: Record<string, any>): void;
  fatal(message: string, error?: Error, metadata?: Record<string, any>): void;
  log(level: LogLevel, message: string, error?: Error, metadata?: Record<string, any>): void;
  child(name: string): Logger;
  withMetadata(metadata: Record<string, any>): Logger;
}
```

### `LoggerConfig`

**Interface Definition:**

```typescript
export interface LoggerConfig {
  level: LogLevel;
  colors: boolean;
  timestamp: boolean;
  logToFile: boolean;
  logFilePath?: string;
  logFormat?: 'text' | 'json';
}
```

## Functions

### `configureLogger()`

**Function Signature:**

```typescript
export function configureLogger(config: Partial<LoggerConfig>): void {
```

**Full Function:**

```typescript
export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = { ...globalConfig, ...config };
  
  // Set up file logging if enabled
  if (globalConfig.logToFile && globalConfig.logFilePath) {
    const dir = path.dirname(globalConfig.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
```

### `createLogger()`

**Function Signature:**

```typescript
export function createLogger(name: string, baseMetadata: Record<string, any> = {
```

**Full Function:**

```typescript
export function createLogger(name: string, baseMetadata: Record<string, any> = {}
```

### `getLogger()`

**Function Signature:**

```typescript
export function getLogger(component: string): Logger {
```

**Full Function:**

```typescript
export function getLogger(component: string): Logger {
  return createLogger(component);
}
```

### `logError()`

**Function Signature:**

```typescript
export function logError(error: Error, context?: string): void {
```

**Full Function:**

```typescript
export function logError(error: Error, context?: string): void {
  const component = context || 'Error';
  const logger = getLogger(component);
  logger.error('An error occurred', error);
}
```

### `getLogLevel()`

**Function Signature:**

```typescript
export function getLogLevel(): LogLevel {
```

**Full Function:**

```typescript
export function getLogLevel(): LogLevel {
  return globalConfig.level;
}
```

### `setLogLevel()`

**Function Signature:**

```typescript
export function setLogLevel(level: LogLevel): void {
```

**Full Function:**

```typescript
export function setLogLevel(level: LogLevel): void {
  globalConfig.level = level;
}
```

### `enableFileLogging()`

**Function Signature:**

```typescript
export function enableFileLogging(filePath: string, format: 'text' | 'json' = 'text'): void {
```

**Full Function:**

```typescript
export function enableFileLogging(filePath: string, format: 'text' | 'json' = 'text'): void {
  configureLogger({
    logToFile: true,
    logFilePath: filePath,
    logFormat: format
  });
}
```

### `disableFileLogging()`

**Function Signature:**

```typescript
export function disableFileLogging(): void {
```

**Full Function:**

```typescript
export function disableFileLogging(): void {
  configureLogger({
    logToFile: false
  });
}
```

## Variables

- `LogLevelNames`
- `defaultLoggerConfig`
- `logger`

