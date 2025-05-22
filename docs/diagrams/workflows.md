# workflows Entity Relationship Diagram

```mermaid
classDiagram
  class WorkflowGenerator {
    templates: WorkflowTemplates
    repoPath: string
    WorkflowTemplates()
    generateRemcodeWorkflow(): Promise<WorkflowGenerationResult>
    catch()
    String()
    configuration()
    generateScheduledWorkflow(): Promise<WorkflowGenerationResult>
    catch()
    String()
    generateAdvancedWorkflow(): Promise<WorkflowGenerationResult>
    catch()
    String()
    name()
    generateCustomWorkflow(): Promise<WorkflowGenerationResult>
    catch()
    String()
    generateAllWorkflows(): Promise<Map<string, WorkflowGenerationResult>>
    updateWorkflow(): Promise<WorkflowGenerationResult>
    if()
    Error()
    catch()
    String()
    ensureWorkflowDirectory(): Promise<string>
    if()
    catch()
    String()
    Error()
  }
  class WorkflowGenerationResult {
    <<interface>>
    success: boolean
    filePath: string
    error: string
    workflowContent: string
  }
  class WorkflowMonitor {
    githubActions: GitHubActions
    defaultOptions: MonitoringOptions
    GitHubClient()
    GitHubActions()
    getWorkflowStatus(): Promise<WorkflowStatusResponse>
    if()
    catch()
    String()
    String()
    if()
    if()
    if()
    catch()
    String()
    if()
    if()
    catch()
    String()
    monitorWorkflowCompletion(): Promise<WorkflowStatusResponse>
    while()
    if()
    if()
    if()
    if()
    if()
    if()
    Promise()
    if()
    getWorkflowRunLogs(): Promise<Buffer | null>
    catch()
    String()
    findWorkflowByName(): Promise<number | null>
    name()
    if()
    catch()
    String()
    triggerWorkflow(): Promise<number | null>
    name()
    if()
    if()
    if()
    Promise()
    if()
    run()
    catch()
    String()
    check()
    hasSuccessfulWorkflow(): Promise<boolean>
    Date()
    for()
    Date()
    return()
    if()
    catch()
    String()
    getWorkflowRunsDetailed(): Promise<Array<WorkflowStatusResponse>>
    for()
    if()
    if()
    catch()
    String()
    if()
    if()
    catch()
    String()
    logStatusToFile(): Promise<void>
    if()
    Date()
    Date()
    catch()
    String()
  }
  class WorkflowStatusResponse {
    <<interface>>
    status: WorkflowRunStatus
    conclusion: WorkflowRunConclusion
    createdAt: string
    updatedAt: string
    runId: number
    url: string
    message: string
    timedOut: boolean
    jobSummary: { [key: string]: string }
    steps: Array<{ name: string; status: string; conclusion?: string }>
  }
  class MonitoringOptions {
    <<interface>>
    timeoutMs: number
    pollIntervalMs: number
    detailed: boolean
    logErrors: boolean
    logToFile: boolean
    logDirectory: string
  }
  class WorkflowTemplates {
    getWorkflowTemplate(): string
    switch()
    if()
    Error()
    getRemcodeWorkflowTemplate(): string
    Date()
    getRemcodeScheduledWorkflowTemplate(): string
    Date()
    if()
    getRemcodeAdvancedWorkflowTemplate(): string
    Date()
    always()
    always()
    getRemcodeCachedWorkflowTemplate(): string
    Date()
    hashFiles()
    always()
    getRemcodeWithNotificationsTemplate(): string
    Date()
    if()
    success()
    failure()
    if()
    always()
    getCustomWorkflowTemplate(): string
    if()
  }
  class WorkflowScheduleConfig {
    <<interface>>
    enabled: boolean
    cron: string
    branches: string[]
  }
  class WorkflowNotificationConfig {
    <<interface>>
    slack: {
    enabled: boolean
    webhook: string
    channel: string
    email: {
    enabled: boolean
    recipients: string[]
  }
  class WorkflowEnvironmentConfig {
    <<interface>>
    nodeVersion: string
    useCache: boolean
    runnerOS: 'ubuntu-latest' | 'windows-latest' | 'macos-latest'
    npmVersion: string
    extraPackages: string[]
  }
  class WorkflowTemplateOptions {
    <<interface>>
    repoName: string
    branches: string[]
    schedule: WorkflowScheduleConfig
    notifications: WorkflowNotificationConfig
    environment: WorkflowEnvironmentConfig
    secrets: Record<string, string>
    parameters: Record<string, any>
    version: string
    customTemplate: string
  }

  %% Inheritance relationships

  %% Usage relationships
  WorkflowGenerator --> WorkflowTemplates: uses
  WorkflowGenerationResult --> WorkflowTemplates: uses
  WorkflowGenerator --> WorkflowScheduleConfig: uses
  WorkflowGenerationResult --> WorkflowScheduleConfig: uses
  WorkflowGenerator --> WorkflowNotificationConfig: uses
  WorkflowGenerationResult --> WorkflowNotificationConfig: uses
  WorkflowGenerator --> WorkflowEnvironmentConfig: uses
  WorkflowGenerationResult --> WorkflowEnvironmentConfig: uses
  WorkflowGenerator --> WorkflowTemplateOptions: uses
  WorkflowGenerationResult --> WorkflowTemplateOptions: uses

  %% Style and notes
  note "Generated from folder: workflows" as Note1

  %% File groupings
  note "generator.ts" as Note_generator
  note "monitor.ts" as Note_monitor
  note "templates.ts" as Note_templates
```
