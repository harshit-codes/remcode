# mcp Entity Relationship Diagram

```mermaid
classDiagram
  class MCPServer {
    app: express.Application
    port: number
    host: string
    options: MCPServerOptions
    pineconeHandler: PineconeMCPHandler
    githubHandler: GitHubMCPHandler
    huggingfaceHandler: HuggingFaceMCPHandler
    setupHandler: SetupMCPHandler
    searchHandler: SearchMCPHandler
    processingHandler: ProcessingMCPHandler
    repositoryHandler: RepositoryMCPHandler
    remcodeHandler: RemcodeMCPHandler
    sweGuidanceMiddleware: SWEGuidanceMiddleware
    express()
    parseInt(): 3000);
    PineconeMCPHandler()
    GitHubMCPHandler()
    HuggingFaceMCPHandler()
    SetupMCPHandler()
    SearchMCPHandler()
    ProcessingMCPHandler()
    RepositoryMCPHandler()
    RemcodeMCPHandler()
    SWEGuidanceMiddleware()
    configureServer(): void
    token()
    branch()
    return()
    filters()
    return()
    process()
    token()
    owner()
    name()
    ID()
    scenario()
    context()
    from()
    type()
    category()
    level()
    context()
    preferences()
    repository()
    owner()
    name()
    return()
    owner()
    name()
    use()
    batch()
    use()
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
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    start(): Promise<void>
    handler()
    if()
    catch()
    String()
    validateApiKeys(): void
    if()
    if()
    if()
    stop(): void
  }
  class MCPServerOptions {
    <<interface>>
    port: number
    host: string
    pineconeApiKey: string
    githubToken: string
    huggingfaceToken: string
    corsOrigins: string
  }
  class SWEGuidanceMiddleware {
    swePrompts: SWEPrompts
    SWEPrompts()
    createInjectionMiddleware()
    return()
    function()
    if()
    response()
    if()
    catch()
    Error()
    next()
    createSelectiveInjectionMiddleware()
    return()
    if()
    next()
  }

  %% Inheritance relationships

  %% Usage relationships
  MCPServer --> SWEGuidanceMiddleware: uses
  MCPServerOptions --> SWEGuidanceMiddleware: uses

  %% Style and notes
  note "Generated from folder: mcp" as Note1

  %% File groupings
  note "index.ts" as Note_index
  note "swe-guidance-middleware.ts" as Note_swe-guidance-middleware
```
