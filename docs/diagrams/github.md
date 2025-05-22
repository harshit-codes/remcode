# github Entity Relationship Diagram

```mermaid
classDiagram
  class GitHubActions {
    client: GitHubClient
    listWorkflows(): Promise<Workflow[]>
    getWorkflow(): Promise<Workflow>
    getWorkflowRuns(): Promise<WorkflowRun[]>
    if()
    if()
    if()
    triggerWorkflow(): Promise<void>
    getWorkflowStatus(): Promise<WorkflowRun | null>
    catch()
    String()
    getWorkflowJobs(): Promise<WorkflowJob[]>
    downloadWorkflowLogs(): Promise<Buffer>
    cancelWorkflowRun(): Promise<void>
    rerunWorkflow(): Promise<void>
    waitForWorkflowCompletion(): Promise<WorkflowRun>
    while()
    if()
    Error()
    if()
    Error()
    if()
    if()
    Promise()
  }
  class WorkflowRun {
    <<interface>>
    id: number
    name: string
    workflow_id: number
    head_branch: string
    head_sha: string
    status: string
    conclusion: string | null
    created_at: string
    updated_at: string
    html_url: string
    jobs_url: string
    logs_url: string
    run_number: number
    run_attempt: number
    display_title: string
  }
  class Workflow {
    <<interface>>
    id: number
    name: string
    workflow_id: number
    head_branch: string
    head_sha: string
    status: string
    conclusion: string | null
    created_at: string
    updated_at: string
    html_url: string
    jobs_url: string
    logs_url: string
    run_number: number
    run_attempt: number
    display_title: string
  }
  class WorkflowJob {
    <<interface>>
    id: number
    run_id: number
    name: string
    status: string
    conclusion: string | null
    started_at: string | null
    completed_at: string | null
    steps: WorkflowStep[]
  }
  class WorkflowStep {
    <<interface>>
    name: string
    status: string
    conclusion: string | null
    number: number
    started_at: string
    completed_at: string
  }
  class GitHubClient {
    token: string
    baseUrl: string
    axios: AxiosInstance
    maxRetries: number
    retryDelay: number
    if()
    endpoint()
    data()
    makeRequest(): Promise<any>
    uuidv4()
    if()
    makeRequestWithRetry(): Promise<any>
    catch()
    if()
    retry()
    if()
    Promise()
    if()
    if()
    Date()
    getRepository(): Promise<any>
    setRepositorySecret(): Promise<void>
    sodium()
    createWorkflowDispatch(): Promise<void>
    getWorkflowRun(): Promise<any>
    listWorkflowRuns(): Promise<any>
    createOrUpdateFile(): Promise<any>
    if()
    if()
    createRepository(): Promise<any>
    forkRepository(): Promise<any>
  }
  class InternalAxiosRequestConfig {
    <<interface>>
    requestId: string
  }
  class GitHubClientOptions {
    <<interface>>
    token: string
    baseUrl: string
    maxRetries: number
    retryDelay: number
    timeout: number
  }
  class GitHubRepository {
    client: GitHubClient
    validateRepository(): Promise<boolean>
    catch()
    if()
    getRepositoryInfo(): Promise<Repository>
    createRepository(): Promise<Repository>
    listUserRepositories(): Promise<Repository[]>
    repositories()
    URLSearchParams()
    listOrganizationRepositories(): Promise<Repository[]>
    URLSearchParams()
    forkRepository(): Promise<Repository>
    listBranches(): Promise<RepositoryBranch[]>
    getBranch(): Promise<RepositoryBranch>
    createBranch(): Promise<void>
    listContributors(): Promise<RepositoryContributor[]>
    createOrUpdateFile(): Promise<any>
    deleteFile(): Promise<any>
    if()
    getContents(): Promise<any>
    addCollaborator(): Promise<any>
  }
  class RepositoryPermissions {
    <<interface>>
    admin: boolean
    maintain: boolean
    push: boolean
    triage: boolean
    pull: boolean
  }
  class Repository {
    <<interface>>
    admin: boolean
    maintain: boolean
    push: boolean
    triage: boolean
    pull: boolean
  }
  class RepositoryBranch {
    <<interface>>
    name: string
    commit: {
    sha: string
    url: string
    protected: boolean
    protection: any
  }
  class RepositoryContributor {
    <<interface>>
    login: string
    id: number
    avatar_url: string
    html_url: string
    contributions: number
  }
  class CreateRepositoryOptions {
    <<interface>>
    name: string
    description: string
    homepage: string
    private: boolean
    has_issues: boolean
    has_projects: boolean
    has_wiki: boolean
    auto_init: boolean
    gitignore_template: string
    license_template: string
    allow_squash_merge: boolean
    allow_merge_commit: boolean
    allow_rebase_merge: boolean
    delete_branch_on_merge: boolean
  }
  class ForkRepositoryOptions {
    <<interface>>
    organization: string
    name: string
    default_branch_only: boolean
  }

  %% Inheritance relationships

  %% Usage relationships
  GitHubActions --> GitHubClient: uses
  WorkflowRun --> GitHubClient: uses
  Workflow --> GitHubClient: uses
  WorkflowJob --> GitHubClient: uses
  WorkflowStep --> GitHubClient: uses
  GitHubActions --> InternalAxiosRequestConfig: uses
  WorkflowRun --> InternalAxiosRequestConfig: uses
  Workflow --> InternalAxiosRequestConfig: uses
  WorkflowJob --> InternalAxiosRequestConfig: uses
  WorkflowStep --> InternalAxiosRequestConfig: uses
  GitHubActions --> GitHubClientOptions: uses
  WorkflowRun --> GitHubClientOptions: uses
  Workflow --> GitHubClientOptions: uses
  WorkflowJob --> GitHubClientOptions: uses
  WorkflowStep --> GitHubClientOptions: uses
  GitHubRepository --> GitHubClient: uses
  RepositoryPermissions --> GitHubClient: uses
  Repository --> GitHubClient: uses
  RepositoryBranch --> GitHubClient: uses
  RepositoryContributor --> GitHubClient: uses
  CreateRepositoryOptions --> GitHubClient: uses
  ForkRepositoryOptions --> GitHubClient: uses
  GitHubRepository --> InternalAxiosRequestConfig: uses
  RepositoryPermissions --> InternalAxiosRequestConfig: uses
  Repository --> InternalAxiosRequestConfig: uses
  RepositoryBranch --> InternalAxiosRequestConfig: uses
  RepositoryContributor --> InternalAxiosRequestConfig: uses
  CreateRepositoryOptions --> InternalAxiosRequestConfig: uses
  ForkRepositoryOptions --> InternalAxiosRequestConfig: uses
  GitHubRepository --> GitHubClientOptions: uses
  RepositoryPermissions --> GitHubClientOptions: uses
  Repository --> GitHubClientOptions: uses
  RepositoryBranch --> GitHubClientOptions: uses
  RepositoryContributor --> GitHubClientOptions: uses
  CreateRepositoryOptions --> GitHubClientOptions: uses
  ForkRepositoryOptions --> GitHubClientOptions: uses

  %% Style and notes
  note "Generated from folder: github" as Note1

  %% File groupings
  note "actions.ts" as Note_actions
  note "client.ts" as Note_client
  note "repository.ts" as Note_repository
```
