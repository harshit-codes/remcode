# analyzers Entity Relationship Diagram

```mermaid
classDiagram
  class DependencyAnalyzer {
    repoPath: string
    analyze(): Promise<DependencyAnalysis>
    map()
    if()
    for()
    if()
    if()
    if()
    if()
    findCodeFiles(): Promise<string[]>
    isCorePath(): boolean
    isEntryPoint(): boolean
    identifyKeyFiles(): string[]
    if()
    if()
    if()
    analyzeFile(): Promise<
    if()
    if()
    catch()
    String()
    parseJSImports(): void
    while()
    if()
    if()
    if()
    while()
    if()
    if()
    if()
    parseJSExports(): void
    while()
    while()
    if()
    parsePythonImports(): void
    while()
    if()
    imports()
    if()
    if()
    if()
    imports()
    if()
    if()
    resolveRelativePath(): string | null
    if()
    if()
    for()
    if()
    for()
    if()
    for()
    if()
    resolveRelativePythonPath(): string | null
    prefix()
    while()
    if()
    if()
    if()
  }
  class RepositoryAnalyzer {
    repoPath: string
    options: Required<RepositoryAnalyzerOptions>
    extensionToLanguage: Map<string, string>
    Map()
    for()
    for()
    analyze(): Promise<RepositoryAnalysis>
    findFiles(): Promise<string[]>
    catch()
    String()
    analyzeRepositoryInfo(): Promise<RepositoryInfo>
    for()
    if()
    catch()
    String()
    for()
    detectBuildSystems(): Promise<string[]>
    Set()
    for()
    if()
    if()
    for()
    if()
    getPrimaryLanguages(): Promise<string[]>
    for()
    languages()
    analyzeModules(): Promise<ModuleInfo[]>
    for()
    if()
    if()
    Set()
    if()
    for()
    if()
    if()
    if()
    if()
    if()
    score()
    analyzeFiles(): Promise<FileInfo[]>
    for()
    if()
    if()
    if()
    if()
    if()
    catch()
    String()
    getModulePath(): string | null
    if()
    countClassesAndFunctions(): 
    if()
    if()
    if()
  }

  %% Inheritance relationships

  %% Usage relationships

  %% Style and notes
  note "Generated from folder: analyzers" as Note1

  %% File groupings
  note "dependency.ts" as Note_dependency
  note "repository.ts" as Note_repository
```
