import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Import chalk with compatibility for both CommonJS and ES modules
let chalk: any;
try {
  chalk = require('chalk');
} catch (error) {
  // Fallback for when chalk is not available or in ES module format
  chalk = {
    gray: (text: string) => text,
    magenta: (text: string) => text,
    blue: (text: string) => text,
    yellow: (text: string) => text,
    red: (text: string) => text,
    white: (text: string) => text,
    bgRed: { white: (text: string) => text }
  };
}

/**
 * Log levels
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  SILENT = 6
}

/**
 * Log level names for display
 */
export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.TRACE]: 'TRACE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
  [LogLevel.SILENT]: 'SILENT'
};

/**
 * Log record structure
 */
export interface LogRecord {
  timestamp: Date;
  level: LogLevel;
  name: string;
  message: string;
  metadata?: Record<string, any>;
  error?: Error;
}

/**
 * Logger interface
 */
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

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  colors: boolean;
  timestamp: boolean;
  logToFile: boolean;
  logFilePath?: string;
  logFormat?: 'text' | 'json';
}

/**
 * Default logger configuration
 */
export const defaultLoggerConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  colors: process.stdout.isTTY,
  timestamp: true,
  logToFile: false,
  logFormat: 'text'
};

/**
 * Global logger configuration
 */
let globalConfig: LoggerConfig = { ...defaultLoggerConfig };

/**
 * Configure global logger settings
 */
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

/**
 * Format a log record for output
 */
function formatLogRecord(record: LogRecord, config: LoggerConfig): string {
  if (config.logFormat === 'json') {
    return JSON.stringify({
      timestamp: record.timestamp.toISOString(),
      level: LogLevelNames[record.level],
      name: record.name,
      message: record.message,
      ...record.metadata,
      ...(record.error ? {
        error: {
          name: record.error.name,
          message: record.error.message,
          stack: record.error.stack
        }
      } : {})
    });
  }
  
  // Text format
  let output = '';
  
  if (config.timestamp) {
    const timestamp = record.timestamp.toISOString();
    output += config.colors ? chalk.gray(timestamp) + ' ' : timestamp + ' ';
  }
  
  const levelName = LogLevelNames[record.level];
  if (config.colors) {
    let levelColor: any;
    switch (record.level) {
      case LogLevel.TRACE: levelColor = chalk.magenta; break;
      case LogLevel.DEBUG: levelColor = chalk.gray; break;
      case LogLevel.INFO: levelColor = chalk.blue; break;
      case LogLevel.WARN: levelColor = chalk.yellow; break;
      case LogLevel.ERROR: levelColor = chalk.red; break;
      case LogLevel.FATAL: levelColor = chalk.bgRed.white; break;
      default: levelColor = chalk.white;
    }
    output += `[${levelColor(levelName)}] `;
  } else {
    output += `[${levelName}] `;
  }
  
  output += `${record.name}: ${record.message}`;
  
  if (record.metadata && Object.keys(record.metadata).length > 0) {
    output += ' ' + util.inspect(record.metadata, { colors: config.colors, depth: 4 });
  }
  
  if (record.error) {
    output += '\n' + (config.colors ? chalk.red(record.error.stack || record.error.message) : (record.error.stack || record.error.message));
  }
  
  return output;
}

/**
 * Write a log record to the configured outputs
 */
function writeLogRecord(record: LogRecord, config: LoggerConfig): void {
  // Skip if level is below configured level
  if (record.level < config.level) return;
  
  const formattedLog = formatLogRecord(record, config);
  
  // Write to console
  if (record.level >= LogLevel.ERROR) {
    console.error(formattedLog);
  } else if (record.level >= LogLevel.WARN) {
    console.warn(formattedLog);
  } else {
    console.log(formattedLog);
  }
  
  // Write to file if enabled
  if (config.logToFile && config.logFilePath) {
    try {
      fs.appendFileSync(
        config.logFilePath,
        formattedLog + '\n', 
        'utf8'
      );
    } catch (error) {
      console.error(`Failed to write to log file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(name: string, baseMetadata: Record<string, any> = {}): Logger {
  const createLogMethod = (level: LogLevel) => {
    return (message: string, errorOrMetadata?: Error | Record<string, any>, metadata?: Record<string, any>) => {
      let error: Error | undefined;
      let combinedMetadata: Record<string, any> | undefined;
      
      // Handle flexible parameters
      if (errorOrMetadata instanceof Error) {
        error = errorOrMetadata;
        combinedMetadata = { ...baseMetadata, ...metadata };
      } else if (errorOrMetadata && typeof errorOrMetadata === 'object') {
        combinedMetadata = { ...baseMetadata, ...errorOrMetadata };
      } else {
        combinedMetadata = { ...baseMetadata };
      }
      
      const record: LogRecord = {
        timestamp: new Date(),
        level,
        name,
        message,
        metadata: combinedMetadata,
        error
      };
      
      writeLogRecord(record, globalConfig);
    };
  };
  
  return {
    trace: createLogMethod(LogLevel.TRACE),
    debug: createLogMethod(LogLevel.DEBUG),
    info: createLogMethod(LogLevel.INFO),
    warn: createLogMethod(LogLevel.WARN),
    error: createLogMethod(LogLevel.ERROR),
    fatal: createLogMethod(LogLevel.FATAL),
    log: (level: LogLevel, message: string, error?: Error, metadata?: Record<string, any>) => {
      const combinedMetadata = { ...baseMetadata, ...metadata };
      const record: LogRecord = {
        timestamp: new Date(),
        level,
        name,
        message,
        metadata: combinedMetadata,
        error
      };
      writeLogRecord(record, globalConfig);
    },
    child: (childName: string) => createLogger(`${name}:${childName}`, baseMetadata),
    withMetadata: (additionalMetadata: Record<string, any>) => {
      return createLogger(name, { ...baseMetadata, ...additionalMetadata });
    }
  };
}

/**
 * Global logger instance
 */
export const logger = createLogger('Remcode');

/**
 * Get a logger instance for a specific component
 */
export function getLogger(component: string): Logger {
  return createLogger(component);
}

/**
 * Log an error with stack trace
 */
export function logError(error: Error, context?: string): void {
  const component = context || 'Error';
  const logger = getLogger(component);
  logger.error('An error occurred', error);
}

/**
 * Get the current log level
 */
export function getLogLevel(): LogLevel {
  return globalConfig.level;
}

/**
 * Set the current log level
 */
export function setLogLevel(level: LogLevel): void {
  globalConfig.level = level;
}

/**
 * Enable file logging
 */
export function enableFileLogging(filePath: string, format: 'text' | 'json' = 'text'): void {
  configureLogger({
    logToFile: true,
    logFilePath: filePath,
    logFormat: format
  });
}

/**
 * Disable file logging
 */
export function disableFileLogging(): void {
  configureLogger({
    logToFile: false
  });
}
