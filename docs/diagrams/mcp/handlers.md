# handlers Entity Relationship Diagram

```mermaid
classDiagram
  class GitHubMCPHandler {
    options: GitHubMCPOptions
    handleRequest(): Promise<void>
    if()
    switch()
    catch()
    String()
    handleToolRequest(): Promise<void>
    if()
    switch()
    catch()
    String()
    makeGitHubRequest(): Promise<any>
    catch()
    if()
    Error()
    handleGetRepo(): Promise<void>
    if()
    catch()
    String()
    handleListFiles(): Promise<void>
    if()
    catch()
    String()
    handleGetFile(): Promise<void>
    if()
    if()
    if()
    catch()
    String()
    handleSearchCode(): Promise<void>
    if()
    if()
    catch()
    String()
  }
  class GitHubMCPOptions {
    <<interface>>
    token: string
  }
  class HuggingFaceMCPHandler {
    options: HuggingFaceMCPOptions
    initialized: boolean = false
    initialize(): Promise<void>
    if()
    catch()
    String()
    handleRequest(): Promise<void>
    if()
    switch()
    catch()
    String()
    handleToolRequest(): Promise<void>
    if()
    switch()
    catch()
    String()
    getEmbeddings(): Promise<number[]>
    if()
    arrays()
    if()
    Array()
    for()
    for()
    for()
    if()
    Error()
    catch()
    String()
    handleEmbedCode(): Promise<void>
    if()
    if()
    for()
    catch()
    String()
    handleEmbedQuery(): Promise<void>
    if()
    catch()
    String()
    handleListModels(): Promise<void>
    catch()
    String()
  }
  class HuggingFaceMCPOptions {
    <<interface>>
    token: string
  }
  class PineconeMCPHandler {
    pineconeStorage: PineconeStorage | null = null
    options: PineconeMCPOptions
    initialize(): Promise<void>
    if()
    PineconeStorage()
    catch()
    String()
    handleRequest(): Promise<void>
    if()
    switch()
    catch()
    String()
    handleToolRequest(): Promise<void>
    if()
    switch()
    catch()
    String()
    handleQuery(): Promise<void>
    if()
    Array()
    catch()
    String()
    handleUpsert(): Promise<void>
    if()
    catch()
    String()
    handleDelete(): Promise<void>
    if()
    catch()
    String()
    handleListIndexes(): Promise<void>
    catch()
    String()
  }
  class PineconeMCPOptions {
    <<interface>>
    apiKey: string
  }
  class ProcessingMCPHandler {
    stateManager: StateManager
    workflowMonitor: WorkflowMonitor
    workflowGenerator: WorkflowGenerator
    StateManager()
    WorkflowMonitor()
    WorkflowGenerator()
    handleTriggerReprocessing(): Promise<void>
    reprocessing()
    if()
    if()
    if()
    if()
    Error()
    catch()
    String()
    catch()
    String()
    handleGetProcessingStatus(): Promise<void>
    if()
    parseInt()
    catch()
    String()
    catch()
    String()
    handleGetProcessingHistory(): Promise<void>
    if()
    parseInt(): limit
    catch()
    String()
  }
  class ProcessingOptions {
    <<interface>>
    type: 'full' | 'incremental' | 'vectorize' | 'analyze'
    force: boolean
    repository: string
    owner: string
    repo: string
    branch: string
    token: string
  }
  class RemcodeMCPHandler {
    swePrompts: SWEPrompts
    sweScenarios: SWEScenarios
    SWEPrompts()
    SWEScenarios()
    handleDefaultPrompt(): Promise<void>
    catch()
    handleGetScenarios(): Promise<void>
    catch()
  }
  class RepositoryMCPHandler {
    githubRepository: GitHubRepository
    GitHubClient()
    GitHubRepository()
    handleGetRepositoryStatus(): Promise<void>
    if()
    Date()
    catch()
    handleListRepositories(): Promise<void>
    catch()
  }
  class SearchMCPHandler {
    semanticSearch: SemanticSearch
    contextExtractor: ContextExtractor
    similarityAnalyzer: SimilarityAnalyzer
    SemanticSearch()
    ContextExtractor()
    SimilarityAnalyzer()
    handleSearchCode(): Promise<void>
    if()
    if()
    Date()
    catch()
    String()
    String()
    handleGetCodeContext(): Promise<void>
    if()
    Date()
    catch()
    String()
    String()
    handleFindSimilarPatterns(): Promise<void>
    if()
    Date()
    catch()
    String()
    String()
  }
  class SetupMCPHandler {
    setupDetector: SetupDetector
    setupInitializer: SetupInitializer
    prerequisites: Prerequisites
    configManager: RemcodeConfigManager
    secretsManager: SecretsManager
    workflowGenerator: WorkflowGenerator
    SetupDetector()
    SetupInitializer()
    Prerequisites()
    RemcodeConfigManager()
    SecretsManager()
    WorkflowGenerator()
    handleSetupRepository(): Promise<void>
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    catch()
    String()
    if()
    if()
    if()
    if()
    catch()
    String()
    if()
    if()
    for()
    catch()
    String()
    catch()
    String()
    catch()
    String()
    handleCheckPrerequisites(): Promise<void>
    catch()
    String()
    handleConfigureRepository(): Promise<void>
    if()
    catch()
    String()
    handleSetupSecrets(): Promise<void>
    if()
    if()
    Error()
    for()
    catch()
    String()
    catch()
    String()
    handleGenerateWorkflows(): Promise<void>
    if()
    switch()
    if()
    if()
    workflow()
    if()
    if()
    catch()
    String()
  }
  class SetupOptions {
    <<interface>>
    owner: string
    repo: string
    token: string
    branch: string
    configOverrides: Record<string, any>
    workflowType: string
    skipWorkflows: boolean
    skipSecrets: boolean
    confirm: boolean
  }

  %% Inheritance relationships

  %% Usage relationships

  %% Style and notes
  note "Generated from folder: handlers" as Note1

  %% File groupings
  note "github.ts" as Note_github
  note "huggingface.ts" as Note_huggingface
  note "pinecone.ts" as Note_pinecone
  note "processing.ts" as Note_processing
  note "remcode.ts" as Note_remcode
  note "repository.ts" as Note_repository
  note "search.ts" as Note_search
  note "setup.ts" as Note_setup
```
