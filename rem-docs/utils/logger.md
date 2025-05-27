# logger.ts

**File Path**: `utils/logger.ts`

## Description

Log levels

## Interfaces

- `LogRecord`
- `Logger`
- `LoggerConfig`

## Functions

- `configureLogger`
- `createLogger`
- `getLogger`
- `logError`
- `getLogLevel`
- `setLogLevel`
- `enableFileLogging`
- `disableFileLogging`

## Constants

- `LogLevelNames`
- `defaultLoggerConfig`
- `logger`

## Documentation Comments

### Comment 1

Log level names for display

### Comment 2

Log record structure

### Comment 3

Logger interface

### Comment 4

Logger configuration

### Comment 5

Default logger configuration

### Comment 6

Global logger configuration

### Comment 7

Configure global logger settings

### Comment 8

Format a log record for output

### Comment 9

Write a log record to the configured outputs

### Comment 10

Create a logger instance

### Comment 11

Global logger instance

### Comment 12

Get a logger instance for a specific component

### Comment 13

Log an error with stack trace

### Comment 14

Get the current log level

### Comment 15

Set the current log level

### Comment 16

Enable file logging

### Comment 17

Disable file logging

## Code Overview

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Key exports:
export interface LogRecord { ... }
export interface Logger { ... }
export interface LoggerConfig { ... }
export function configureLogger(...) { ... }
export function createLogger(...) { ... }
export function getLogger(...) { ... }
export function logError(...) { ... }
export function getLogLevel(...) { ... }
export function setLogLevel(...) { ... }
export function enableFileLogging(...) { ... }
export function disableFileLogging(...) { ... }
```

## File Statistics

- **Lines of Code**: 321
- **File Size**: 8424 bytes
- **Last Modified**: 2025-05-24T12:28:30.745Z

