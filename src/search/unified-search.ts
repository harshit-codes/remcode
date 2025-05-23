import { getLogger } from '../utils/logger';
import { SemanticSearch, SearchResult } from './semantic';
import { QueryProcessor, ProcessedQuery, QueryFilters } from './query-processor';
import { ContextExtractor } from './context-extractor';
import { SimilarityAnalyzer } from './similarity';
import * as fs from 'fs/promises';
import * as path from 'path';

const logger = getLogger('UnifiedSearch');

/**
 * Enhanced search result with full content and metadata
 */
export interface EnhancedSearchResult extends SearchResult {
  actualContent?: string;
  highlights?: string[];
  relevanceExplanation?: string;
  fileStats?: {
    size: number;
    lastModified: Date;
    lineCount: number;
  };
  contextBefore?: string;
  contextAfter?: string;
}

/**
 * Options for unified search
 */
export interface UnifiedSearchOptions {
  includeContext?: boolean;
  contextLines?: number;
  includeFileStats?: boolean;
  maxContentLength?: number;
  enableCaching?: boolean;
  cacheTimeout?: number;
}

/**
 * Result of unified search operation
 */
export interface UnifiedSearchResult {
  query: ProcessedQuery;
  results: EnhancedSearchResult[];
  totalResults: number;
  searchTime: number;
  cached: boolean;
  filters: QueryFilters;
}

/**
 * Unified search engine that combines all search capabilities
 */
export class UnifiedSearch {
  private semanticSearch: SemanticSearch;
  private queryProcessor: QueryProcessor;
  private contextExtractor: ContextExtractor;
  private similarityAnalyzer: SimilarityAnalyzer;
  private fileCache: Map<string, { content: string; timestamp: number }>;
  private queryCache: Map<string, UnifiedSearchResult>;
  private options: UnifiedSearchOptions;

  constructor(
    semanticSearch?: SemanticSearch,
    options: UnifiedSearchOptions = {}
  ) {
    this.semanticSearch = semanticSearch || new SemanticSearch();
    this.queryProcessor = new QueryProcessor();
    this.contextExtractor = new ContextExtractor();
    this.similarityAnalyzer = new SimilarityAnalyzer({
      semanticSearch: this.semanticSearch,
      enableSemanticSearch: true,
      enableSyntaxAnalysis: true,
      enablePatternDetection: true
    });
    
    this.fileCache = new Map();
    this.queryCache = new Map();
    
    this.options = {
      includeContext: options.includeContext !== false,
      contextLines: options.contextLines || 3,
      includeFileStats: options.includeFileStats !== false,
      maxContentLength: options.maxContentLength || 5000,
      enableCaching: options.enableCaching !== false,
      cacheTimeout: options.cacheTimeout || 300000 // 5 minutes
    };
  }

  /**
   * Perform unified search with automatic query processing and enhancement
   */
  async search(
    query: string,
    topK: number = 10,
    additionalFilters?: QueryFilters
  ): Promise<UnifiedSearchResult> {
    const startTime = Date.now();
    logger.info(`Unified search for: "${query}"`);

    // Check cache first
    const cacheKey = `${query}-${topK}-${JSON.stringify(additionalFilters || {})}`;
    if (this.options.enableCaching && this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey)!;
      if (Date.now() - cached.searchTime < this.options.cacheTimeout!) {
        logger.info('Returning cached search results');
        return { ...cached, cached: true };
      }
    }

    try {
      // Initialize semantic search if needed
      if (!this.semanticSearch.isInitialized()) {
        await this.semanticSearch.initialize();
      }

      // Process the query to extract intent and optimize
      const processedQuery = await this.queryProcessor.processQuery(query);
      
      // Merge filters
      const filters = {
        ...processedQuery.filters,
        ...additionalFilters
      };

      // Route to appropriate search method based on query type
      let searchResults: SearchResult[];
      
      switch (processedQuery.queryType) {
        case 'exact':
          searchResults = await this.performExactSearch(processedQuery.processedQuery, topK, filters);
          break;
        case 'pattern':
          searchResults = await this.performPatternSearch(processedQuery.processedQuery, topK, filters);
          break;
        case 'context':
          searchResults = await this.performContextSearch(processedQuery.processedQuery, topK, filters);
          break;
        case 'semantic':
        default:
          searchResults = await this.semanticSearch.search(processedQuery.processedQuery, topK, filters);
          break;
      }

      // Enhance results with actual content and additional metadata
      const enhancedResults = await this.enhanceSearchResults(searchResults, processedQuery);

      // Apply additional filtering based on query intent
      const filteredResults = this.applyIntentBasedFiltering(enhancedResults, processedQuery);

      // Sort results by relevance
      const sortedResults = this.sortResultsByRelevance(filteredResults, processedQuery);

      const result: UnifiedSearchResult = {
        query: processedQuery,
        results: sortedResults.slice(0, topK),
        totalResults: sortedResults.length,
        searchTime: Date.now() - startTime,
        cached: false,
        filters
      };

      // Cache the result
      if (this.options.enableCaching) {
        this.queryCache.set(cacheKey, result);
        // Clean old cache entries
        this.cleanCache();
      }

      logger.info(`Search completed in ${result.searchTime}ms with ${result.totalResults} results`);
      return result;

    } catch (error) {
      logger.error(`Unified search failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Perform exact match search
   */
  private async performExactSearch(
    query: string,
    topK: number,
    filters?: QueryFilters
  ): Promise<SearchResult[]> {
    logger.info('Performing exact match search');
    
    // For exact search, we need to search for the exact string
    // Remove quotes if present
    const cleanQuery = query.replace(/['"]/g, '');
    
    // Use semantic search but boost exact matches
    const results = await this.semanticSearch.search(`"${cleanQuery}"`, topK * 2, filters);
    
    // Filter for exact matches in content
    return results.filter(result => {
      const content = result.content.toLowerCase();
      return content.includes(cleanQuery.toLowerCase());
    });
  }

  /**
   * Perform pattern-based search
   */
  private async performPatternSearch(
    query: string,
    topK: number,
    filters?: QueryFilters
  ): Promise<SearchResult[]> {
    logger.info('Performing pattern search');
    
    // Use semantic search to find potentially matching code
    const results = await this.semanticSearch.searchPatterns(query, topK * 2);
    
    // Apply pattern matching on the results
    const pattern = new RegExp(query, 'gi');
    return results.filter(result => pattern.test(result.content));
  }

  /**
   * Perform context-aware search
   */
  private async performContextSearch(
    query: string,
    topK: number,
    filters?: QueryFilters
  ): Promise<SearchResult[]> {
    logger.info('Performing context search');
    
    // For context search, we want to find usage patterns
    const results = await this.semanticSearch.search(query, topK * 2, filters);
    
    // Prioritize results that show usage context (imports, function calls, etc.)
    return results.filter(result => {
      const metadata = result.metadata;
      return metadata.chunkType === 'function' || 
             metadata.chunkType === 'class' ||
             result.content.includes('import') ||
             result.content.includes('require');
    });
  }

  /**
   * Enhance search results with actual file content and metadata
   */
  private async enhanceSearchResults(
    results: SearchResult[],
    processedQuery: ProcessedQuery
  ): Promise<EnhancedSearchResult[]> {
    logger.info(`Enhancing ${results.length} search results`);
    
    const enhancedResults: EnhancedSearchResult[] = [];
    
    // Process in parallel for better performance
    const enhancementPromises = results.map(async (result) => {
      try {
        const enhanced: EnhancedSearchResult = { ...result };
        
        // Get actual file content
        const fileContent = await this.getFileContent(result.metadata.filePath);
        
        if (fileContent) {
          // Extract the actual code content based on line numbers
          if (result.metadata.startLine !== undefined && result.metadata.endLine !== undefined) {
            const lines = fileContent.split('\n');
            const startLine = Math.max(0, result.metadata.startLine);
            const endLine = Math.min(lines.length - 1, result.metadata.endLine);
            
            enhanced.actualContent = lines.slice(startLine, endLine + 1).join('\n');
            
            // Add context if requested
            if (this.options.includeContext) {
              const contextStart = Math.max(0, startLine - this.options.contextLines!);
              const contextEnd = Math.min(lines.length - 1, endLine + this.options.contextLines!);
              
              if (contextStart < startLine) {
                enhanced.contextBefore = lines.slice(contextStart, startLine).join('\n');
              }
              if (contextEnd > endLine) {
                enhanced.contextAfter = lines.slice(endLine + 1, contextEnd + 1).join('\n');
              }
            }
            
            // Add highlights based on query
            enhanced.highlights = this.generateHighlights(
              enhanced.actualContent || result.content,
              processedQuery.processedQuery
            );
          } else {
            // If no line numbers, use the stored content
            enhanced.actualContent = result.content;
          }
          
          // Add file statistics if requested
          if (this.options.includeFileStats) {
            enhanced.fileStats = await this.getFileStats(result.metadata.filePath);
          }
          
          // Generate relevance explanation
          enhanced.relevanceExplanation = this.generateRelevanceExplanation(
            result,
            processedQuery
          );
        }
        
        return enhanced;
      } catch (error) {
        logger.error(`Failed to enhance result for ${result.metadata.filePath}: ${error}`);
        return result as EnhancedSearchResult;
      }
    });
    
    const enhanced = await Promise.all(enhancementPromises);
    return enhanced.filter(r => r !== null);
  }

  /**
   * Get file content with caching
   */
  private async getFileContent(filePath: string): Promise<string | null> {
    // Check cache first
    if (this.fileCache.has(filePath)) {
      const cached = this.fileCache.get(filePath)!;
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached.content;
      }
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Cache the content
      this.fileCache.set(filePath, {
        content,
        timestamp: Date.now()
      });
      
      return content;
    } catch (error) {
      logger.error(`Failed to read file ${filePath}: ${error}`);
      return null;
    }
  }

  /**
   * Get file statistics
   */
  private async getFileStats(filePath: string): Promise<any> {
    try {
      const stats = await fs.stat(filePath);
      const content = await this.getFileContent(filePath);
      
      return {
        size: stats.size,
        lastModified: stats.mtime,
        lineCount: content ? content.split('\n').length : 0
      };
    } catch (error) {
      logger.error(`Failed to get file stats for ${filePath}: ${error}`);
      return null;
    }
  }

  /**
   * Generate highlights for matched content
   */
  private generateHighlights(content: string, query: string): string[] {
    const highlights: string[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const lines = content.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const term of queryTerms) {
        if (lowerLine.includes(term)) {
          highlights.push(line.trim());
          break;
        }
      }
    }
    
    return highlights.slice(0, 5); // Limit to 5 highlights
  }

  /**
   * Generate explanation of why a result is relevant
   */
  private generateRelevanceExplanation(
    result: SearchResult,
    processedQuery: ProcessedQuery
  ): string {
    const explanations: string[] = [];
    
    // Score-based explanation
    if (result.score > 0.9) {
      explanations.push('Very high similarity match');
    } else if (result.score > 0.8) {
      explanations.push('High similarity match');
    } else if (result.score > 0.7) {
      explanations.push('Good similarity match');
    }
    
    // Metadata-based explanations
    const metadata = result.metadata;
    
    if (metadata.functionName) {
      explanations.push(`Function: ${metadata.functionName}`);
    }
    
    if (metadata.className) {
      explanations.push(`Class: ${metadata.className}`);
    }
    
    if (metadata.chunkType) {
      explanations.push(`Type: ${metadata.chunkType}`);
    }
    
    // Query intent-based explanations
    switch (processedQuery.intent) {
      case 'find_implementation':
        if (metadata.chunkType === 'function' || metadata.chunkType === 'class') {
          explanations.push('Contains implementation details');
        }
        break;
      case 'find_usage':
        if (result.content.includes('import') || result.content.includes('require')) {
          explanations.push('Shows usage pattern');
        }
        break;
      case 'find_similar':
        explanations.push('Similar code pattern detected');
        break;
    }
    
    return explanations.join(' | ');
  }

  /**
   * Apply filtering based on query intent
   */
  private applyIntentBasedFiltering(
    results: EnhancedSearchResult[],
    processedQuery: ProcessedQuery
  ): EnhancedSearchResult[] {
    switch (processedQuery.intent) {
      case 'find_implementation':
        // Prioritize function and class definitions
        return results.filter(r => 
          r.metadata.chunkType === 'function' || 
          r.metadata.chunkType === 'class' ||
          r.metadata.chunkType === 'module'
        );
        
      case 'find_usage':
        // Prioritize code that imports or calls functions
        return results.filter(r => 
          r.actualContent?.includes('import') ||
          r.actualContent?.includes('require') ||
          r.actualContent?.includes('(') // function calls
        );
        
      case 'find_definition':
        // Prioritize declarations and definitions
        return results.filter(r => 
          r.actualContent?.includes('function') ||
          r.actualContent?.includes('class') ||
          r.actualContent?.includes('const') ||
          r.actualContent?.includes('let') ||
          r.actualContent?.includes('var')
        );
        
      case 'find_complexity':
      case 'find_bugs':
        // Prioritize complex code with multiple conditions
        return results.filter(r => {
          const content = r.actualContent || r.content;
          const complexityIndicators = (content.match(/if\s*\(/g) || []).length +
                                      (content.match(/for\s*\(/g) || []).length +
                                      (content.match(/while\s*\(/g) || []).length +
                                      (content.match(/catch\s*\(/g) || []).length;
          return complexityIndicators > 2;
        });
        
      default:
        return results;
    }
  }

  /**
   * Sort results by relevance considering multiple factors
   */
  private sortResultsByRelevance(
    results: EnhancedSearchResult[],
    processedQuery: ProcessedQuery
  ): EnhancedSearchResult[] {
    return results.sort((a, b) => {
      // Primary sort by score
      let scoreA = a.score;
      let scoreB = b.score;
      
      // Boost based on query intent
      if (processedQuery.intent === 'find_implementation') {
        if (a.metadata.chunkType === 'function') scoreA += 0.1;
        if (b.metadata.chunkType === 'function') scoreB += 0.1;
      }
      
      // Boost based on result type matching expected type
      if (processedQuery.expectedResultType !== 'any') {
        if (a.metadata.chunkType === processedQuery.expectedResultType) scoreA += 0.05;
        if (b.metadata.chunkType === processedQuery.expectedResultType) scoreB += 0.05;
      }
      
      // Boost based on language match if specified
      if (processedQuery.filters.language) {
        const expectedLang = Array.isArray(processedQuery.filters.language) 
          ? processedQuery.filters.language[0] 
          : processedQuery.filters.language;
        if (a.metadata.language === expectedLang) scoreA += 0.05;
        if (b.metadata.language === expectedLang) scoreB += 0.05;
      }
      
      return scoreB - scoreA;
    });
  }

  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    
    // Clean query cache
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.searchTime > this.options.cacheTimeout!) {
        this.queryCache.delete(key);
      }
    }
    
    // Clean file cache
    for (const [key, value] of this.fileCache.entries()) {
      if (now - value.timestamp > 60000) { // 1 minute
        this.fileCache.delete(key);
      }
    }
  }
}
