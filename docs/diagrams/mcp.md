# mcp Entity Relationship Diagram

```mermaid
classDiagram
  class EnhancedToolsRegistry {
    toolsMap: Map<string, EnhancedMCPTool>
    categoriesMap: Map<ToolCategory, EnhancedMCPTool[]>
    Map()
    Map()
    getInstance(): EnhancedToolsRegistry
    if()
    EnhancedToolsRegistry()
    initializeTools(): void
    if()
    getAllTools(): EnhancedMCPTool[]
    getToolByName(): EnhancedMCPTool | undefined
    getToolsByCategory(): EnhancedMCPTool[]
  }
  class EnhancedToolsRegistry {
    toolsMap: Map<string, EnhancedMCPTool>
    categoriesMap: Map<ToolCategory, EnhancedMCPTool[]>
    Map()
    Map()
    getInstance(): EnhancedToolsRegistry
    if()
    EnhancedToolsRegistry()
    initializeTools(): void
    if()
    getAllTools(): EnhancedMCPTool[]
    getToolByName(): EnhancedMCPTool | undefined
    getToolsByCategory(): EnhancedMCPTool[]
    getToolsByTag(): EnhancedMCPTool[]
    getToolsByPriority(): EnhancedMCPTool[]
    convertToMCPSpec(): any
    getCategoryStats(): Record<string, number>
    getToolSummary(): any
  }
  class EnhancedToolsRegistry {
    toolsMap: Map<string, EnhancedMCPTool>
    categoriesMap: Map<ToolCategory, EnhancedMCPTool[]>
    Map()
    Map()
    getInstance(): EnhancedToolsRegistry
    if()
    EnhancedToolsRegistry()
    initializeTools(): void
    if()
    getAllTools(): EnhancedMCPTool[]
    getToolByName(): EnhancedMCPTool | undefined
    getToolsByCategory(): EnhancedMCPTool[]
    getToolsByTag(): EnhancedMCPTool[]
    getToolsByPriority(): EnhancedMCPTool[]
    convertToMCPSpec(): any
  }
  class MCPToolRecommendationEngine {
    getToolsByCategory(): EnhancedMCPTool[]
    getToolsByPriority(): EnhancedMCPTool[]
    getToolsByUsageContext(): EnhancedMCPTool[]
    recommendToolsForNewUser(): EnhancedMCPTool[]
    recommendFollowUpTools(): string[]
    getToolByName(): EnhancedMCPTool | undefined
  }
  class EnhancedMCPTool {
    <<interface>>
    name: string
    displayName: string
    description: string
    detailedDescription: string
    category: MCPToolCategory
    priority: MCPToolPriority
    usageContexts: MCPUsageContext[]
    parameters: {
    [key: string]: {
    type: string
    description: string
    required: boolean
    default: any
    examples: string[]
    constraints: string
    returns: {
    description: string
    schema: any
    examples: any[]
    examples: {
    title: string
    description: string
    request: any
    expectedResponse: string
    prerequisites: string[]
    relatedTools: string[]
    performanceHints: string[]
    troubleshooting: {
    commonIssues: string[]
    solutions: string[]
    bestPractices: string[]
    aiGuidance: {
    whenToUse: string
    whenNotToUse: string
    followUpSuggestions: string[]
  }
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

  %% File groupings
  note "enhanced-tools-registry.ts" as Note_enhanced-tools-registry
  note "enhanced-tools.ts" as Note_enhanced-tools
  note "index.ts" as Note_index
```
