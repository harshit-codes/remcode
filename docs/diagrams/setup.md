# setup Entity Relationship Diagram

```mermaid
classDiagram
  class SetupDetector {
    repoPath: string
    detectSetupNeeds(): Promise<SetupStatus>
    Date()
    catch()
    String()
    Error()
    hasGitRepository(): boolean
    catch()
    String()
    hasRemcodeFile(): boolean
    catch()
    String()
    hasGitHubWorkflow(): boolean
    catch()
    String()
    getGitRemoteInfo(): Promise<GitRemoteInfo>
    execAsync()
    if()
    if()
    if()
    execAsync()
    catch()
    String()
    validateRemcodeConfig(): boolean
    catch()
    String()
    getConfigVersion(): string | undefined
    catch()
    getWorkflowVersion(): Promise<string | undefined>
    catch()
    getRemcodeVersion(): string
    if()
    catch()
    String()
    checkRequiredSecrets(): Promise<boolean>
    getSetupReason(): SetupReason
    if()
    if()
    if()
    if()
    if()
    if()
  }
  class GitRemoteInfo {
    <<interface>>
    exists: boolean
    url: string
    owner: string
    repo: string
    isGitHub: boolean
    defaultBranch: string
  }
  class SetupStatus {
    <<interface>>
    needsSetup: boolean
    hasRemcodeFile: boolean
    hasGitRepo: boolean
    hasGitHubRepo: boolean
    hasWorkflow: boolean
    hasRequiredSecrets: boolean
    hasValidConfig: boolean
    reason: SetupReason
    gitInfo: GitRemoteInfo
    configVersion: string
    workflowVersion: string
    remcodeVersion: string
    detectionTimestamp: string
  }
  class SetupInitializer {
    detector: SetupDetector
    prerequisites: Prerequisites
    secretsManager: SecretsManager
    workflowGenerator: WorkflowGenerator
    configManager: RemcodeConfigManager
    repoPath: string
    SetupDetector()
    Prerequisites()
    SecretsManager()
    WorkflowGenerator()
    RemcodeConfigManager()
    initializeRepository(): Promise<SetupResult>
    if()
    if()
    Error()
    secrets()
    if()
    if()
    Error()
    workflow()
    if()
    if()
    Error()
    catch()
    String()
    Date()
    checkSetupNeeds(): Promise<SetupStatus>
    updateSetup(): Promise<SetupResult>
    cleanupSetup(): Promise<boolean>
    catch()
    String()
  }
  class SetupOptions {
    <<interface>>
    owner: string
    repo: string
    token: string
    defaultBranch: string
    skipSecrets: boolean
    skipWorkflow: boolean
    forceUpdate: boolean
    workflowType: WorkflowTemplateType
    customSecrets: Record<string, string>
  }
  class SetupResult {
    <<interface>>
    success: boolean
    setupStatus: SetupStatus
    prerequisites: PrerequisiteCheck[]
    secretsResult: SecretsOperationSummary
    workflowResult: WorkflowGenerationResult
    configResult: RemcodeConfig
    error: string
    duration: number
  }
  class Prerequisites {
    repoPath: string
    checkAll(): Promise<PrerequisiteCheck[]>
    failed()
    catch()
    String()
    checkGitRepository(): Promise<PrerequisiteCheck>
    if()
    execAsync()
    catch()
    catch()
    String()
    checkGitHubRepository(): Promise<PrerequisiteCheck>
    execAsync()
    if()
    if()
    catch()
    catch()
    String()
    checkNodeVersion(): Promise<PrerequisiteCheck>
    parseInt()
    if()
    catch()
    String()
    checkEnvironmentVariables(): PrerequisiteCheck
    if()
    if()
    catch()
    String()
    checkCleanWorkingDirectory(): Promise<PrerequisiteCheck>
    execAsync()
    if()
    catch()
    catch()
    String()
    checkWritePermissions(): Promise<PrerequisiteCheck>
    if()
    if()
    catch()
    String()
    catch()
    String()
  }
  class PrerequisiteCheck {
    <<interface>>
    passed: boolean
    name: string
    message: string
    details: string
    critical: boolean
  }
  class RemcodeConfigManager {
    repoPath: string
    configPath: string
    createInitialConfig(): Promise<RemcodeConfig>
    if()
    if()
    Error()
    catch()
    String()
    Error()
    readConfig(): RemcodeConfig
    if()
    Error()
    catch()
    String()
    Error()
    updateConfig(): RemcodeConfig
    catch()
    Date()
    if()
    if()
    Error()
    catch()
    String()
    Error()
    updateProcessingStatus(): RemcodeConfig
    Date()
    if()
    if()
    Date()
    catch()
    String()
    Error()
    validateConfig(): ConfigValidationResult
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    buildInitialConfig(): RemcodeConfig
    Date()
    Date()
    Date()
    if()
    isObject()
    if()
    if()
    if()
    upgradeConfig(): void
    if()
    if()
    if()
    if()
    configExists(): boolean
    deleteConfig(): boolean
    if()
    catch()
    String()
  }
  class RepositoryConfig {
    <<interface>>
    name: string
    owner: string
    url: string
    defaultBranch: string
    visibility: 'public' | 'private'
    description: string
  }
  class ProcessingConfig {
    <<interface>>
    lastCommit: string
    lastUpdate: string
    status: ProcessingStatus
    error: string
    lastProcessingDuration: number
  }
  class VectorizationConfig {
    <<interface>>
    provider: VectorProvider
    indexName: string
    namespace: string
    embeddingModel: EmbeddingModel
    embeddingDimension: number
    chunkSize: number
    chunkOverlap: number
    customEndpoint: string
  }
  class StatisticsConfig {
    <<interface>>
    filesProcessed: number
    chunksCreated: number
    vectorsStored: number
    lastUpdated: string
    totalTokens: number
    processingTime: number
  }
  class AdvancedConfig {
    <<interface>>
    ignorePaths: string[]
    includeExtensions: string[]
    excludeExtensions: string[]
    maxFileSize: number
    customPrompts: Record<string, string>
    useCache: boolean
    webhooks: WebhookConfig[]
  }
  class WebhookConfig {
    <<interface>>
    url: string
    events: string[]
    secret: string
    active: boolean
  }
  class RemcodeConfig {
    <<interface>>
    version: string
    initialized: string
    repository: RepositoryConfig
    processing: ProcessingConfig
    vectorization: VectorizationConfig
    statistics: StatisticsConfig
    advanced: AdvancedConfig
    lastModified: string
  }
  class ConfigValidationResult {
    <<interface>>
    valid: boolean
    errors: string[]
    warnings: string[]
  }
  class SecretsManager {
    octokit: Octokit | null = null
    token: string | null = null
    if()
    Octokit()
    configureRepositorySecrets(): Promise<SecretsOperationSummary>
    for()
    catch()
    String()
    if()
    Error()
    getRequiredSecrets(): SecretConfig[]
    setRepositorySecret(): Promise<SecretOperationResult>
    if()
    if()
    Error()
    if()
    catch()
    String()
    encryptSecret(): Promise<string>
    hasRepositorySecret(): Promise<boolean>
    if()
    catch()
    String()
    deleteRepositorySecret(): Promise<boolean>
    if()
    catch()
    String()
  }
  class SecretConfig {
    <<interface>>
    name: string
    value: string
    description: string
    required: boolean
  }
  class SecretOperationResult {
    <<interface>>
    success: boolean
    secretName: string
    error: string
  }
  class SecretsOperationSummary {
    <<interface>>
    total: number
    successful: number
    failed: number
    results: SecretOperationResult[]
  }
  class WorkflowGenerator {
    repoPath: string
    generateWorkflow(): Promise<WorkflowGenerationResult>
    catch()
    String()
    ensureDirectoryExists(): Promise<void>
    if()
    catch()
    String()
    generateWorkflowContent(): string
    Date()
    if()
    switch()
    generateBasicWorkflow(): string
    generateAdvancedWorkflow(): string
    always()
    generateEnterpriseWorkflow(): string
    hashFiles()
    always()
    always()
    always()
  }
  class WorkflowTemplateOptions {
    <<interface>>
    repoName: string
    owner: string
    branches: string[]
    embeddingModel: string
    nodeVersion: string
    cronSchedule: string
    customSecrets: Record<string, string>
    includeSchedule: boolean
    workflowVersion: string
  }
  class WorkflowGenerationResult {
    <<interface>>
    success: boolean
    filePath: string
    error: string
    workflowContent: string
    workflowVersion: string
  }

  %% Inheritance relationships

  %% Usage relationships
  SetupInitializer --> SetupDetector: uses
  SetupOptions --> SetupDetector: uses
  SetupResult --> SetupDetector: uses
  SetupInitializer --> GitRemoteInfo: uses
  SetupOptions --> GitRemoteInfo: uses
  SetupResult --> GitRemoteInfo: uses
  SetupInitializer --> SetupStatus: uses
  SetupOptions --> SetupStatus: uses
  SetupResult --> SetupStatus: uses
  SetupInitializer --> Prerequisites: uses
  SetupOptions --> Prerequisites: uses
  SetupResult --> Prerequisites: uses
  SetupInitializer --> PrerequisiteCheck: uses
  SetupOptions --> PrerequisiteCheck: uses
  SetupResult --> PrerequisiteCheck: uses
  SetupInitializer --> SecretsManager: uses
  SetupOptions --> SecretsManager: uses
  SetupResult --> SecretsManager: uses
  SetupInitializer --> SecretConfig: uses
  SetupOptions --> SecretConfig: uses
  SetupResult --> SecretConfig: uses
  SetupInitializer --> SecretOperationResult: uses
  SetupOptions --> SecretOperationResult: uses
  SetupResult --> SecretOperationResult: uses
  SetupInitializer --> SecretsOperationSummary: uses
  SetupOptions --> SecretsOperationSummary: uses
  SetupResult --> SecretsOperationSummary: uses
  SetupInitializer --> WorkflowGenerator: uses
  SetupOptions --> WorkflowGenerator: uses
  SetupResult --> WorkflowGenerator: uses
  SetupInitializer --> WorkflowTemplateOptions: uses
  SetupOptions --> WorkflowTemplateOptions: uses
  SetupResult --> WorkflowTemplateOptions: uses
  SetupInitializer --> WorkflowGenerationResult: uses
  SetupOptions --> WorkflowGenerationResult: uses
  SetupResult --> WorkflowGenerationResult: uses
  SetupInitializer --> RemcodeConfigManager: uses
  SetupOptions --> RemcodeConfigManager: uses
  SetupResult --> RemcodeConfigManager: uses
  SetupInitializer --> RepositoryConfig: uses
  SetupOptions --> RepositoryConfig: uses
  SetupResult --> RepositoryConfig: uses
  SetupInitializer --> ProcessingConfig: uses
  SetupOptions --> ProcessingConfig: uses
  SetupResult --> ProcessingConfig: uses
  SetupInitializer --> VectorizationConfig: uses
  SetupOptions --> VectorizationConfig: uses
  SetupResult --> VectorizationConfig: uses
  SetupInitializer --> StatisticsConfig: uses
  SetupOptions --> StatisticsConfig: uses
  SetupResult --> StatisticsConfig: uses
  SetupInitializer --> AdvancedConfig: uses
  SetupOptions --> AdvancedConfig: uses
  SetupResult --> AdvancedConfig: uses
  SetupInitializer --> WebhookConfig: uses
  SetupOptions --> WebhookConfig: uses
  SetupResult --> WebhookConfig: uses
  SetupInitializer --> RemcodeConfig: uses
  SetupOptions --> RemcodeConfig: uses
  SetupResult --> RemcodeConfig: uses
  SetupInitializer --> ConfigValidationResult: uses
  SetupOptions --> ConfigValidationResult: uses
  SetupResult --> ConfigValidationResult: uses

  %% Style and notes
  note "Generated from folder: setup" as Note1

  %% File groupings
  note "detector.ts" as Note_detector
  note "initializer.ts" as Note_initializer
  note "prerequisites.ts" as Note_prerequisites
  note "remcode-config.ts" as Note_remcode-config
  note "secrets.ts" as Note_secrets
  note "workflow-generator.ts" as Note_workflow-generator
```
