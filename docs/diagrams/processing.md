# processing Entity Relationship Diagram

```mermaid
classDiagram
  class ChangeDetector {
    repoPath: string
    if()
    Error()
    isGitRepository(): boolean
    execSync()
    catch()
    getCurrentCommit(): string
    execSync()
    catch()
    String()
    Error()
    commitExists(): boolean
    execSync()
    catch()
    getChangedFiles(): Promise<FileChange[]>
    if()
    Error()
    if()
    Error()
    execSync()
    if()
    for()
    if()
    if()
    if()
    file()
    if()
    if()
    catch()
    String()
    Error()
    enrichFileInfo(): FileChange
    if()
    if()
    catch()
    hasChanges(): Promise<boolean>
    execSync()
    catch()
    getModifiedLines(): Promise<number[]>
    execSync()
    if()
    for()
    if()
    if()
    parseInt()
    if()
    if()
    catch()
    String()
    filterCodeFiles(): Promise<FileChange[]>
    getIgnoredPaths(): Promise<string[]>
    if()
    catch()
    String()
  }
  class FileChange {
    <<interface>>
    path: string
    status: 'added' | 'modified' | 'deleted' | 'renamed'
    previousPath: string
    size: number
    extension: string
  }
  class FileAnalyzer {
    repoPath: string
    maxFileSize: number
    analyzeChangedFiles(): Promise<FileAnalysis[]>
    for()
    analyzeFile(): Promise<FileAnalysis>
    if()
    if()
    file(): $
    code()
    if()
    if()
    if()
    catch()
    String()
    analyzeJsTs(): void
    imports()
    while()
    if()
    exports()
    while()
    if()
    classes()
    while()
    if()
    while()
    if()
    catch()
    String()
    analyzePython(): void
    Python()
    while()
    if()
    while()
    if()
    while()
    if()
    catch()
    String()
    code()
    countSourceLines(): number
    if()
    if()
    determineComplexity(): FileAnalysis['complexity']
    if()
    if()
    determineChunkingStrategy(): ChunkingStrategy
    if()
    if()
    if()
    refineChunkingStrategy(): ChunkingStrategy
    if()
    if()
    if()
    detectLanguage(): string
    categorizeFile(): FileAnalysis['category']
    if()
    if()
    files()
    if()
    if()
  }
  class FileAnalysis {
    <<interface>>
    path: string
    category: 'priority' | 'normal' | 'test' | 'config' | 'ignore'
    language: string
    complexity: 'low' | 'medium' | 'high'
    size: number
    sloc: number; // Source lines of code (excluding comments and blank lines)
    imports: string[]
    exports: string[]
    functions: string[]
    classes: string[]
    dependencies: string[]
    chunkingStrategy: ChunkingStrategy
    metadata: Record<string, any>
  }
  class AnalysisOptions {
    <<interface>>
    basePath: string
    skipAST: boolean
    skipDependencies: boolean
    maxFileSizeBytes: number
  }
  class IncrementalProcessor {
    repoPath: string
    stateManager: StateManager
    storage: PineconeStorage | null = null
    chunker: CodeChunker
    embeddingManager: EmbeddingManager
    options: IncrementalProcessorOptions
    stats: ProcessingStats
    StateManager()
    Date()
    initialize(): Promise<void>
    if()
    PineconeStorage()
    catch()
    String()
    Error()
    processChangedFiles(): Promise<ProcessingStats>
    for()
    if()
    for()
    for()
    if()
    if()
    if()
    catch()
    String()
    Date()
    processFile(): Promise<void>
    if()
    if()
    if()
    if()
    catch()
    String()
    deleteVectorsForFile(): Promise<void>
    if()
    if()
    Error()
    catch()
    String()
    updateProcessingState(): Promise<void>
    if()
    Date()
    catch()
    String()
    Error()
  }
  class ProcessingStats {
    <<interface>>
    totalFiles: number
    addedFiles: number
    modifiedFiles: number
    deletedFiles: number
    totalChunks: number
    totalEmbeddings: number
    errorCount: number
    startTime: Date
    endTime: Date
    durationMs: number
  }
  class IncrementalProcessorOptions {
    <<interface>>
    repoPath: string
    pineconeApiKey: string
    pineconeEnvironment: string
    pineconeIndexName: string
    pineconeNamespace: string
    embeddingModel: string
    batchSize: number
    dryRun: boolean
    includeTests: boolean
  }
  class StateManager {
    configPath: string
    filePath: string
    exists(): Promise<boolean>
    catch()
    loadState(): Promise<RemcodeState | null>
    if()
    catch()
    String()
    initializeState(): Promise<RemcodeState>
    Date()
    saveState(): Promise<void>
    if()
    Date()
    catch()
    String()
    Error()
    updateState(): Promise<RemcodeState>
    if()
    catch()
    String()
    Error()
    updateProcessingStatus(): Promise<void>
    Date()
    if()
    updateStatistics(): Promise<void>
    Date()
    updateVectorizationInfo(): Promise<void>
    Date()
    updateRepositoryInfo(): Promise<void>
    updateConfiguration(): Promise<void>
    if()
    if()
    if()
    if()
    isObject(): boolean
  }
  class RemcodeState {
    <<interface>>
    version: string
    created: string
    updated: string
    repository: {
    url: string
    path: string
    branch: string
    commit: string
    processing: {
    status: 'idle' | 'analyzing' | 'vectorizing' | 'updating' | 'completed' | 'failed'
    lastCommit: string
    lastUpdated: string
    stats: any
    vectorization: {
    model: string
    chunks: number
    vectors: number
    lastUpdated: string
    pineconeIndex: string
    pineconeNamespace: string
    configuration: {
    includeTests: boolean
    includeComments: boolean
    chunkStrategy: string
    [key: string]: any
  }

  %% Inheritance relationships

  %% Usage relationships
  FileAnalyzer --> ChangeDetector: uses
  FileAnalysis --> ChangeDetector: uses
  AnalysisOptions --> ChangeDetector: uses
  FileAnalyzer --> FileChange: uses
  FileAnalysis --> FileChange: uses
  AnalysisOptions --> FileChange: uses
  IncrementalProcessor --> ChangeDetector: uses
  ProcessingStats --> ChangeDetector: uses
  IncrementalProcessorOptions --> ChangeDetector: uses
  IncrementalProcessor --> FileChange: uses
  ProcessingStats --> FileChange: uses
  IncrementalProcessorOptions --> FileChange: uses
  IncrementalProcessor --> FileAnalyzer: uses
  ProcessingStats --> FileAnalyzer: uses
  IncrementalProcessorOptions --> FileAnalyzer: uses
  IncrementalProcessor --> FileAnalysis: uses
  ProcessingStats --> FileAnalysis: uses
  IncrementalProcessorOptions --> FileAnalysis: uses
  IncrementalProcessor --> AnalysisOptions: uses
  ProcessingStats --> AnalysisOptions: uses
  IncrementalProcessorOptions --> AnalysisOptions: uses
  IncrementalProcessor --> StateManager: uses
  ProcessingStats --> StateManager: uses
  IncrementalProcessorOptions --> StateManager: uses
  IncrementalProcessor --> RemcodeState: uses
  ProcessingStats --> RemcodeState: uses
  IncrementalProcessorOptions --> RemcodeState: uses

  %% Style and notes
  note "Generated from folder: processing" as Note1

  %% File groupings
  note "change-detector.ts" as Note_change-detector
  note "file-analyzer.ts" as Note_file-analyzer
  note "incremental.ts" as Note_incremental
  note "state-manager.ts" as Note_state-manager
```
