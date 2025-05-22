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
  class EnhancedDependencyAnalyzer {
    repoPath: string
    baseDependencyAnalyzer: BaseDependencyAnalyzer
    BaseDependencyAnalyzer()
    analyze(): Promise<EnhancedDependencyAnalysis>
  }
  class DependencyGraphNode {
    <<interface>>
    id: string
    type: 'file' | 'module' | 'function' | 'class'
    name: string
    path: string
    importance: number; // 0-1 scale
    complexity: 'low' | 'medium' | 'high'
    metadata: Record<string, any>
  }
  class DependencyGraphEdge {
    <<interface>>
    source: string
    target: string
    type: 'imports' | 'exports' | 'calls' | 'extends' | 'implements'
    weight: number; // Strength of dependency
  }
  class EnhancedDependencyAnalysis {
    <<interface>>
    nodes: DependencyGraphNode[]
    edges: DependencyGraphEdge[]
    modules: Record<string, {
    files: string[]
    dependencies: string[]
    dependents: string[]
    importance: number
    complexity: 'low' | 'medium' | 'high'
    criticalPaths: Array<{
    path: string[]
    importance: number
    description: string
    recommendations: Array<{
    type: 'refactor' | 'optimize' | 'split' | 'merge'
    target: string
    reason: string
    priority: 'low' | 'medium' | 'high'
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
    determineChunkingStrategy(): ChunkStrategyType
    if()
    if()
    if()
    refineChunkingStrategy(): ChunkStrategyType
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
  class IncrementalProcessor {
    repoPath: string
    stateManager: StateManager
    storage: PineconeStorage | null = null
    chunker: ChunkingManager
    embeddingManager: EmbeddingManager
    options: IncrementalProcessorOptions
    stats: ProcessingStats
    StateManager()
    ChunkingManager()
    EmbeddingManager()
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
  class ProcessingPipeline {
    repoPath: string
    changeDetector: ChangeDetector
    fileAnalyzer: FileAnalyzer
    incrementalProcessor: IncrementalProcessor
    stateManager: StateManager
    ChangeDetector()
    FileAnalyzer()
    IncrementalProcessor()
    StateManager()
    processIncremental(): Promise<ProcessingStats>
    if()
    catch()
    String()
    repository()
    processAll(): Promise<ProcessingStats>
    catch()
    String()
    getStatus(): Promise<
    if()
    catch()
    String()
    hasPendingChanges(): Promise<boolean>
    if()
    catch()
    String()
    getLastProcessedCommit(): Promise<string>
    catch()
    String()
    createEmptyStats(): ProcessingStats
    Date()
    Date()
    findAllCodeFiles(): Promise<string[]>
    require()
    execSync()
    for()
    require()
    if()
    catch()
    String()
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
  class FileChange {
    <<interface>>
    path: string
    status: 'added' | 'modified' | 'deleted' | 'renamed'
    previousPath: string
    size: number
    extension: string
  }
  class FileAnalysis {
    <<interface>>
    path: string
    category: 'priority' | 'normal' | 'test' | 'config' | 'ignore'
    language: string
    complexity: 'low' | 'medium' | 'high'
    size: number
    sloc: number
    imports: string[]
    exports: string[]
    functions: string[]
    classes: string[]
    dependencies: string[]
    chunkingStrategy: ChunkStrategyType
    metadata: Record<string, any>
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
  class AnalysisOptions {
    <<interface>>
    basePath: string
    skipAST: boolean
    skipDependencies: boolean
    maxFileSizeBytes: number
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
  class VectorMetadata {
    <<interface>>
    filePath: string
    language: string
    category: string
    startLine: number
    endLine: number
    functionName: string
    className: string
    chunkType: string
    strategy: string
    repo: string
    changeType: 'added' | 'modified' | 'deleted' | 'renamed'
    [key: string]: any
  }

  %% Inheritance relationships

  %% Usage relationships
  ChangeDetector --> FileChange: uses
  ChangeDetector --> FileAnalysis: uses
  ChangeDetector --> ProcessingStats: uses
  ChangeDetector --> AnalysisOptions: uses
  ChangeDetector --> IncrementalProcessorOptions: uses
  ChangeDetector --> VectorMetadata: uses
  EnhancedDependencyAnalyzer --> FileChange: uses
  DependencyGraphNode --> FileChange: uses
  DependencyGraphEdge --> FileChange: uses
  EnhancedDependencyAnalysis --> FileChange: uses
  EnhancedDependencyAnalyzer --> FileAnalysis: uses
  DependencyGraphNode --> FileAnalysis: uses
  DependencyGraphEdge --> FileAnalysis: uses
  EnhancedDependencyAnalysis --> FileAnalysis: uses
  EnhancedDependencyAnalyzer --> ProcessingStats: uses
  DependencyGraphNode --> ProcessingStats: uses
  DependencyGraphEdge --> ProcessingStats: uses
  EnhancedDependencyAnalysis --> ProcessingStats: uses
  EnhancedDependencyAnalyzer --> AnalysisOptions: uses
  DependencyGraphNode --> AnalysisOptions: uses
  DependencyGraphEdge --> AnalysisOptions: uses
  EnhancedDependencyAnalysis --> AnalysisOptions: uses
  EnhancedDependencyAnalyzer --> IncrementalProcessorOptions: uses
  DependencyGraphNode --> IncrementalProcessorOptions: uses
  DependencyGraphEdge --> IncrementalProcessorOptions: uses
  EnhancedDependencyAnalysis --> IncrementalProcessorOptions: uses
  EnhancedDependencyAnalyzer --> VectorMetadata: uses
  DependencyGraphNode --> VectorMetadata: uses
  DependencyGraphEdge --> VectorMetadata: uses
  EnhancedDependencyAnalysis --> VectorMetadata: uses
  FileAnalyzer --> FileChange: uses
  FileAnalyzer --> FileAnalysis: uses
  FileAnalyzer --> ProcessingStats: uses
  FileAnalyzer --> AnalysisOptions: uses
  FileAnalyzer --> IncrementalProcessorOptions: uses
  FileAnalyzer --> VectorMetadata: uses
  IncrementalProcessor --> StateManager: uses
  IncrementalProcessor --> RemcodeState: uses
  IncrementalProcessor --> FileChange: uses
  IncrementalProcessor --> FileAnalysis: uses
  IncrementalProcessor --> ProcessingStats: uses
  IncrementalProcessor --> AnalysisOptions: uses
  IncrementalProcessor --> IncrementalProcessorOptions: uses
  IncrementalProcessor --> VectorMetadata: uses
  ProcessingPipeline --> ChangeDetector: uses
  ProcessingPipeline --> FileAnalyzer: uses
  ProcessingPipeline --> IncrementalProcessor: uses
  ProcessingPipeline --> StateManager: uses
  ProcessingPipeline --> RemcodeState: uses
  ProcessingPipeline --> FileChange: uses
  ProcessingPipeline --> FileAnalysis: uses
  ProcessingPipeline --> ProcessingStats: uses
  ProcessingPipeline --> AnalysisOptions: uses
  ProcessingPipeline --> IncrementalProcessorOptions: uses
  ProcessingPipeline --> VectorMetadata: uses

  %% Style and notes
  note "Generated from folder: processing" as Note1

  %% File groupings
  note "change-detector.ts" as Note_change-detector
  note "enhanced-dependency-analyzer.ts" as Note_enhanced-dependency-analyzer
  note "file-analyzer.ts" as Note_file-analyzer
  note "incremental.ts" as Note_incremental
  note "pipeline.ts" as Note_pipeline
  note "state-manager.ts" as Note_state-manager
  note "types.ts" as Note_types
```
