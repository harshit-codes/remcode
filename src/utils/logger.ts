import chalk from 'chalk';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * Global log level
 */
let globalLogLevel = LogLevel.INFO;

/**
 * Set the global log level
 */
export function setLogLevel(level: LogLevel): void {
  globalLogLevel = level;
}

/**
 * Get the global log level
 */
export function getLogLevel(): LogLevel {
  return globalLogLevel;
}

/**
 * Create a logger instance
 */
export function createLogger(name: string): Logger {
  return {
    debug(message: string, ...args: any[]): void {
      if (globalLogLevel <= LogLevel.DEBUG) {
        console.log(chalk.gray(`[DEBUG] ${name}: ${message}`), ...args);
      }
    },
    
    info(message: string, ...args: any[]): void {
      if (globalLogLevel <= LogLevel.INFO) {
        console.log(chalk.blue(`[INFO] ${name}: ${message}`), ...args);
      }
    },
    
    warn(message: string, ...args: any[]): void {
      if (globalLogLevel <= LogLevel.WARN) {
        console.log(chalk.yellow(`[WARN] ${name}: ${message}`), ...args);
      }
    },
    
    error(message: string, ...args: any[]): void {
      if (globalLogLevel <= LogLevel.ERROR) {
        console.error(chalk.red(`[ERROR] ${name}: ${message}`), ...args);
      }
    }
  };
}

/**
 * Get a logger instance for a module
 */
export function getLogger(name: string): Logger {
  return createLogger(name);
}
