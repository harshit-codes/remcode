# utils Entity Relationship Diagram

```mermaid
classDiagram
  class RemcodeConfig {
    <<interface>>
    ignore: string[]
    analysis: {
    depth: number
    quality: {
    enabled: boolean
    complexityThreshold: number
    dependencies: {
    enabled: boolean
    includeExternal: boolean
    vectorization: {
    chunking: {
    moduleLevelSize: number
    functionLevelSize: number
    overlapFactor: number
    embedding: {
    model: string
    fallbackModel: string
    batchSize: number
    storage: {
    provider: 'pinecone' | 'local' | 'custom'
    indexes: {
    moduleName: string
    functionName: string
    pinecone: {
    apiKey: string
    environment: string
    namespace: string
    github: {
    token: string
    cacheDir: string
    server: {
    port: number
    host: string
  }
  class LogRecord {
    <<interface>>
    timestamp: Date
    level: LogLevel
    name: string
    message: string
    metadata: Record<string, any>
    error: Error
  }
  class Logger {
    <<interface>>
    trace(message: string, metadata?: Record<string, any>): void
    debug(message: string, metadata?: Record<string, any>): void
    info(message: string, metadata?: Record<string, any>): void
    warn(message: string, metadata?: Record<string, any>): void
    error(message: string, error?: Error, metadata?: Record<string, any>): void
    fatal(message: string, error?: Error, metadata?: Record<string, any>): void
    log(level: LogLevel, message: string, error?: Error, metadata?: Record<string, any>): void
    child(name: string): Logger
    withMetadata(metadata: Record<string, any>): Logger
  }
  class LoggerConfig {
    <<interface>>
    level: LogLevel
    colors: boolean
    timestamp: boolean
    logToFile: boolean
    logFilePath: string
    logFormat: 'text' | 'json'
  }
  class ParsedSource {
    <<interface>>
    type: SourceType
    owner: string
    repo: string
    branch: string
    path: string
    url: string
    localPath: string
    originalSource: string
  }

  %% Inheritance relationships

  %% Usage relationships
  RemcodeConfig --> LogRecord: uses
  RemcodeConfig --> Logger: uses
  RemcodeConfig --> LoggerConfig: uses
  ParsedSource --> LogRecord: uses
  ParsedSource --> Logger: uses
  ParsedSource --> LoggerConfig: uses

  %% Style and notes
  note "Generated from folder: utils" as Note1

  %% File groupings
  note "config.ts" as Note_config
  note "logger.ts" as Note_logger
  note "source.ts" as Note_source
```
