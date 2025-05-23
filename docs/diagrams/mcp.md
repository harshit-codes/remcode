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

  %% Inheritance relationships

  %% Usage relationships

  %% Style and notes
  note "Generated from folder: mcp" as Note1
```
