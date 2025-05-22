# logger.ts

**File Path:** `utils/logger.ts`

## Overview

Log levels

## Interfaces

### `LogRecord`

**Properties:**

- `timestamp: Date;`
- `level: LogLevel;`
- `name: string;`
- `message: string;`
- `metadata?: Record<string, any>;`
- `error?: Error;`

### `Logger`

**Properties:**

- `trace(message: string, metadata?: Record<string, any>): void;`
- `debug(message: string, metadata?: Record<string, any>): void;`
- `info(message: string, metadata?: Record<string, any>): void;`
- `warn(message: string, metadata?: Record<string, any>): void;`
- `error(message: string, error?: Error, metadata?: Record<string, any>): void;`
- `fatal(message: string, error?: Error, metadata?: Record<string, any>): void;`
- `log(level: LogLevel, message: string, error?: Error, metadata?: Record<string, any>): void;`
- `child(name: string): Logger;`
- `withMetadata(metadata: Record<string, any>): Logger;`

### `LoggerConfig`

**Properties:**

- `level: LogLevel;`
- `colors: boolean;`
- `timestamp: boolean;`
- `logToFile: boolean;`
- `logFilePath?: string;`
- `logFormat?: 'text' | 'json';`

## Functions

### `configureLogger()`

**Parameters:**

- `config: Partial<LoggerConfig>`

**Returns:** `void`

### `createLogger()`

**Parameters:**

- `name: string`
- `baseMetadata: Record<string`
- `any> = {}`

**Returns:** `Logger`

### `getLogger()`

**Parameters:**

- `component: string`

**Returns:** `Logger`

### `logError()`

**Parameters:**

- `error: Error`
- `context?: string`

**Returns:** `void`

### `getLogLevel()`

**Returns:** `LogLevel`

### `setLogLevel()`

**Parameters:**

- `level: LogLevel`

**Returns:** `void`

### `enableFileLogging()`

**Parameters:**

- `filePath: string`
- `format: 'text' | 'json' = 'text'`

**Returns:** `void`

### `disableFileLogging()`

**Returns:** `void`

## Variables

- `LogLevelNames`
- `defaultLoggerConfig`
- `logger`

