# search Entity Relationship Diagram

```mermaid
classDiagram
  class ContextExtractor {
    number()
    number()
    extractContext(): Promise<CodeContext>
    if()
    Error()
    context()
    for()
    if()
    for()
    if()
    catch()
    String()
    structure()
    getFileStructure(): Promise<FileStructure>
    if()
    catch()
    String()
    parseTypescript(): FileStructure
    parse()
    catch()
    String()
    parseGenericFile(): FileStructure
    for()
    if()
    if()
    traverseAst(): void
    if()
    if()
    switch()
    for()
    if()
    if()
    if()
    processImport(): void
    if()
    if()
    for()
    if()
    if()
    processExport(): void
    if()
    if()
    if()
    for()
    if()
    if()
    for()
    if()
    processClass(): void
    if()
    if()
    for()
    if()
    if()
    if()
    processMethod(): void
    if()
    processFunction(): void
    if()
    extractParams(): string[]
    if()
    for()
    if()
    if()
    if()
    if()
    if()
  }
  class CodeContext {
    <<interface>>
    targetContent: string
    surroundingLines: string[]
    relatedFunctions: string[]
    imports: string[]
    classContext: string
    moduleContext: string
    fileStructure: FileStructure
  }
  class FileStructure {
    <<interface>>
    classes: ClassInfo[]
    functions: FunctionInfo[]
    exports: string[]
    imports: ImportInfo[]
  }
  class ClassInfo {
    <<interface>>
    name: string
    methods: FunctionInfo[]
    properties: string[]
    startLine: number
    endLine: number
  }
  class FunctionInfo {
    <<interface>>
    name: string
    params: string[]
    startLine: number
    endLine: number
    isMethod: boolean
    parentClass: string
  }
  class ImportInfo {
    <<interface>>
    source: string
    imported: string[]
    startLine: number
  }
  class QueryProcessor {
    patternRules: PatternRule[] = [
    processQuery(): Promise<ProcessedQuery>
    normalizeQuery(): string
    determineQueryMetadata(): 
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    for()
    if()
    if()
    if()
    if()
    extractFilters(): Promise<QueryFilters>
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    optimizeQuery(): Promise<string>
    switch()
    optimizeForSemanticSearch(): Promise<string>
    for()
    RegExp()
    if()
    if()
    optimizeForExactSearch(): string
    if()
    optimizeForPatternSearch(): string
    if()
    optimizeForContextSearch(): string
    if()
    if()
    calculateConfidence(): number
    if()
    if()
    length()
    if()
    presence()
  }
  class ProcessedQuery {
    <<interface>>
    originalQuery: string
    processedQuery: string
    queryType: QueryType
    intent: QueryIntent
    filters: QueryFilters
    expectedResultType: ResultType
    confidence: number; // 0-1 confidence in the interpretation
  }
  class QueryFilters {
    <<interface>>
    language: string | string[]
    fileType: string | string[]
    complexity: 'low' | 'medium' | 'high' | 'any'
    path: string
    author: string
    dateRange: {
    from: Date
    to: Date
    minTokens: number
    maxTokens: number
    hasComments: boolean
    hasTests: boolean
    includePatterns: string[]
    excludePatterns: string[]
  }
  class SemanticSearch {
    storage: PineconeStorage | null = null
    embeddingManager: EmbeddingManager | null = null
    options: SemanticSearchOptions
    initialized: boolean = false
    initialize(): Promise<void>
    if()
    Error()
    if()
    Error()
    PineconeStorage()
    EmbeddingManager()
    catch()
    String()
    Error()
    search(): Promise<SearchResult[]>
    if()
    Error()
    if()
    Error()
    if()
    Error()
    catch()
    String()
    Error()
    searchSimilarCode(): Promise<SearchResult[]>
    searchPatterns(): Promise<SearchResult[]>
    searchFunctionality(): Promise<SearchResult[]>
    formatSearchResults(): SearchResult[]
    getStats(): Promise<any>
    if()
    Error()
    isInitialized(): boolean
  }
  class SemanticSearchOptions {
    <<interface>>
    pineconeApiKey: string
    pineconeIndexName: string
    pineconeEnvironment: string
    pineconeNamespace: string
    huggingfaceToken: string
    embeddingModel: string
    fallbackModel: string
    embeddingDimension: number
    batchSize: number
  }
  class SearchResult {
    <<interface>>
    id: string
    score: number
    content: string
    metadata: {
    filePath: string
    language: string
    chunkType: string
    startLine: number
    endLine: number
    [key: string]: any
  }
  class SimilarityAnalyzer {
    semanticSearch: SemanticSearch | null = null
    embeddingManager: EmbeddingManager | null = null
    options: SimilarityOptions
    patterns: Record<CodePattern, {
    ensureInitialized(): Promise<void>
    if()
    if()
    SemanticSearch()
    threshold()
    findSimilarPatterns(): Promise<SimilarityResult>
    is()
    if()
    catch()
    String()
    calculateOverallConfidence(): number
    if()
    if()
    score()
    compareCodeSimilarity(): Promise<number>
    similarity()
    similarity()
    if()
    if()
    similarity()
    if()
    if()
    catch()
    String()
    if()
    identifyCodePatterns(): Promise<string[]>
    if()
    Error()
    if()
    catch()
    String()
    analyzeRepositoryPatterns(): Promise<Map<string, string[]>>
    if()
    Error()
    for()
    if()
    catch()
    String()
    Map()
    detectPatterns(): string[]
    if()
    for()
    for()
    if()
    if()
    detectPatternType(): PatternType
    if()
    if()
    if()
    generateSimilarityReasons(): string[]
    for()
    if()
    for()
    if()
    if()
    if()
    if()
    if()
    extractTokens(): string[]
    calculateTokenSimilarity(): number
    if()
    Set()
    Set()
    for()
    if()
    calculatePatternSimilarity(): number
    if()
    Set()
    Set()
    for()
    if()
    normalizeCode(): string
    findCodeFiles(): string[]
    Set()
    for()
    if()
    if()
    if()
    cosineSimilarity(): number
    if()
    Error()
    for()
    if()
  }
  class SimilarityResult {
    <<interface>>
    targetCode: string
    similarCode: SearchResult[]
    similarityReasons: string[]
    patternType: PatternType
    patternName: string
    confidence: number
  }
  class SimilarityOptions {
    <<interface>>
    semanticSearch: SemanticSearch
    embeddingManager: EmbeddingManager
    minSimilarity: number
    enableSemanticSearch: boolean
    enableSyntaxAnalysis: boolean
    enablePatternDetection: boolean
  }
  class UnifiedSearch {
    semanticSearch: SemanticSearch
    queryProcessor: QueryProcessor
    contextExtractor: ContextExtractor
    similarityAnalyzer: SimilarityAnalyzer
    fileCache: Map<string, { content: string
    queryCache: Map<string, UnifiedSearchResult>
    options: UnifiedSearchOptions
    SemanticSearch()
    QueryProcessor()
    ContextExtractor()
    SimilarityAnalyzer()
    Map()
    Map()
    search(): Promise<UnifiedSearchResult>
    if()
    if()
    if()
    switch()
    if()
    catch()
    String()
    performExactSearch(): Promise<SearchResult[]>
    performPatternSearch(): Promise<SearchResult[]>
    RegExp()
    performContextSearch(): Promise<SearchResult[]>
    context()
    enhanceSearchResults(): Promise<EnhancedSearchResult[]>
    if()
    if()
    if()
    if()
    if()
    if()
    catch()
    getFileContent(): Promise<string | null>
    if()
    if()
    catch()
    getFileStats(): Promise<any>
    catch()
    generateHighlights(): string[]
    for()
    for()
    if()
    generateRelevanceExplanation(): string
    if()
    if()
    if()
    if()
    if()
    if()
    switch()
    if()
    if()
    applyIntentBasedFiltering(): EnhancedSearchResult[]
    switch()
    sortResultsByRelevance(): EnhancedSearchResult[]
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    if()
    cleanCache(): void
    for()
    if()
    for()
    if()
  }
  class EnhancedSearchResult {
    <<interface>>
    actualContent: string
    highlights: string[]
    relevanceExplanation: string
    fileStats: {
    size: number
    lastModified: Date
    lineCount: number
    contextBefore: string
    contextAfter: string
  }
  class UnifiedSearchOptions {
    <<interface>>
    includeContext: boolean
    contextLines: number
    includeFileStats: boolean
    maxContentLength: number
    enableCaching: boolean
    cacheTimeout: number
  }
  class UnifiedSearchResult {
    <<interface>>
    query: ProcessedQuery
    results: EnhancedSearchResult[]
    totalResults: number
    searchTime: number
    cached: boolean
    filters: QueryFilters
  }

  %% Inheritance relationships
  EnhancedSearchResult --|> SearchResult: extends

  %% Usage relationships
  SimilarityAnalyzer --> SemanticSearch: uses
  SimilarityResult --> SemanticSearch: uses
  SimilarityOptions --> SemanticSearch: uses
  SimilarityAnalyzer --> SemanticSearchOptions: uses
  SimilarityResult --> SemanticSearchOptions: uses
  SimilarityOptions --> SemanticSearchOptions: uses
  SimilarityAnalyzer --> SearchResult: uses
  SimilarityResult --> SearchResult: uses
  SimilarityOptions --> SearchResult: uses
  UnifiedSearch --> SemanticSearch: uses
  EnhancedSearchResult --> SemanticSearch: uses
  UnifiedSearchOptions --> SemanticSearch: uses
  UnifiedSearchResult --> SemanticSearch: uses
  UnifiedSearch --> SemanticSearchOptions: uses
  EnhancedSearchResult --> SemanticSearchOptions: uses
  UnifiedSearchOptions --> SemanticSearchOptions: uses
  UnifiedSearchResult --> SemanticSearchOptions: uses
  UnifiedSearch --> SearchResult: uses
  EnhancedSearchResult --> SearchResult: uses
  UnifiedSearchOptions --> SearchResult: uses
  UnifiedSearchResult --> SearchResult: uses
  UnifiedSearch --> QueryProcessor: uses
  EnhancedSearchResult --> QueryProcessor: uses
  UnifiedSearchOptions --> QueryProcessor: uses
  UnifiedSearchResult --> QueryProcessor: uses
  UnifiedSearch --> ProcessedQuery: uses
  EnhancedSearchResult --> ProcessedQuery: uses
  UnifiedSearchOptions --> ProcessedQuery: uses
  UnifiedSearchResult --> ProcessedQuery: uses
  UnifiedSearch --> QueryFilters: uses
  EnhancedSearchResult --> QueryFilters: uses
  UnifiedSearchOptions --> QueryFilters: uses
  UnifiedSearchResult --> QueryFilters: uses
  UnifiedSearch --> ContextExtractor: uses
  EnhancedSearchResult --> ContextExtractor: uses
  UnifiedSearchOptions --> ContextExtractor: uses
  UnifiedSearchResult --> ContextExtractor: uses
  UnifiedSearch --> CodeContext: uses
  EnhancedSearchResult --> CodeContext: uses
  UnifiedSearchOptions --> CodeContext: uses
  UnifiedSearchResult --> CodeContext: uses
  UnifiedSearch --> FileStructure: uses
  EnhancedSearchResult --> FileStructure: uses
  UnifiedSearchOptions --> FileStructure: uses
  UnifiedSearchResult --> FileStructure: uses
  UnifiedSearch --> ClassInfo: uses
  EnhancedSearchResult --> ClassInfo: uses
  UnifiedSearchOptions --> ClassInfo: uses
  UnifiedSearchResult --> ClassInfo: uses
  UnifiedSearch --> FunctionInfo: uses
  EnhancedSearchResult --> FunctionInfo: uses
  UnifiedSearchOptions --> FunctionInfo: uses
  UnifiedSearchResult --> FunctionInfo: uses
  UnifiedSearch --> ImportInfo: uses
  EnhancedSearchResult --> ImportInfo: uses
  UnifiedSearchOptions --> ImportInfo: uses
  UnifiedSearchResult --> ImportInfo: uses
  UnifiedSearch --> SimilarityAnalyzer: uses
  EnhancedSearchResult --> SimilarityAnalyzer: uses
  UnifiedSearchOptions --> SimilarityAnalyzer: uses
  UnifiedSearchResult --> SimilarityAnalyzer: uses
  UnifiedSearch --> SimilarityResult: uses
  EnhancedSearchResult --> SimilarityResult: uses
  UnifiedSearchOptions --> SimilarityResult: uses
  UnifiedSearchResult --> SimilarityResult: uses
  UnifiedSearch --> SimilarityOptions: uses
  EnhancedSearchResult --> SimilarityOptions: uses
  UnifiedSearchOptions --> SimilarityOptions: uses
  UnifiedSearchResult --> SimilarityOptions: uses

  %% Style and notes
  note "Generated from folder: search" as Note1

  %% File groupings
  note "context-extractor.ts" as Note_context-extractor
  note "query-processor.ts" as Note_query-processor
  note "semantic.ts" as Note_semantic
  note "similarity.ts" as Note_similarity
  note "unified-search.ts" as Note_unified-search
```
