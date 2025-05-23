import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SemanticSearch } from '../../search/semantic';
import { ContextExtractor } from '../../search/context-extractor';
import { SimilarityAnalyzer } from '../../search/similarity';
import { UnifiedSearch } from '../../search/unified-search';

const logger = getLogger('SearchMCPHandler');

export class SearchMCPHandler {
  private semanticSearch: SemanticSearch;
  private contextExtractor: ContextExtractor;
  private similarityAnalyzer: SimilarityAnalyzer;
  private unifiedSearch: UnifiedSearch;

  constructor() {
    this.semanticSearch = new SemanticSearch({
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'remcode-default',
      pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
      pineconeNamespace: process.env.PINECONE_NAMESPACE || 'default',
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
      embeddingModel: 'microsoft/graphcodebert-base',
      fallbackModel: 'sentence-transformers/all-MiniLM-L6-v2'
    });
    
    this.contextExtractor = new ContextExtractor();
    this.similarityAnalyzer = new SimilarityAnalyzer({
      semanticSearch: this.semanticSearch,
      enableSemanticSearch: true,
      enableSyntaxAnalysis: true,
      enablePatternDetection: true
    });
    
    // Initialize unified search
    this.unifiedSearch = new UnifiedSearch(this.semanticSearch, {
      includeContext: true,
      contextLines: 3,
      includeFileStats: true,
      maxContentLength: 5000,
      enableCaching: true,
      cacheTimeout: 300000 // 5 minutes
    });
  }

  /**
   * Unified search handler that automatically processes queries
   */
  async handleSearch(req: Request, res: Response, params?: any): Promise<void> {
    const { query, topK = 10, filters, options } = params || req.body;

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    try {
      const startTime = Date.now();
      
      // Use unified search for intelligent query processing
      const searchResult = await this.unifiedSearch.search(query, topK, filters);
      
      // Format response with enhanced metadata
      const response = {
        success: true,
        query: {
          original: searchResult.query.originalQuery,
          processed: searchResult.query.processedQuery,
          type: searchResult.query.queryType,
          intent: searchResult.query.intent,
          confidence: searchResult.query.confidence
        },
        results: searchResult.results.map(result => ({
          filePath: result.metadata.filePath,
          score: result.score,
          content: result.actualContent || result.content,
          highlights: result.highlights,
          metadata: {
            ...result.metadata,
            relevance: result.relevanceExplanation,
            fileStats: result.fileStats
          },
          context: {
            before: result.contextBefore,
            after: result.contextAfter
          }
        })),
        totalResults: searchResult.totalResults,
        searchTime: searchResult.searchTime,
        cached: searchResult.cached,
        filters: searchResult.filters,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error(`Unified search failed: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ 
        success: false,
        error: 'Search failed', 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Legacy search handler (deprecated - use handleSearch instead)
   */
  async handleSearchCode(req: Request, res: Response, params?: any): Promise<void> {
    logger.warn('Using deprecated search_code handler. Please use the unified search handler instead.');
    return this.handleSearch(req, res, params);
  }

  async handleGetCodeContext(req: Request, res: Response, params?: any): Promise<void> {
    const { filePath, startLine, endLine } = params || req.body;

    if (!filePath) {
      res.status(400).json({ error: 'File path is required' });
      return;
    }

    try {
      const context = await this.contextExtractor.extractContext(
        filePath, 
        startLine || 0, 
        endLine || startLine || 10
      );
      
      res.status(200).json({ 
        success: true,
        context,
        filePath,
        range: { startLine: startLine || 0, endLine: endLine || startLine || 10 },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Context extraction failed: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ 
        success: false,
        error: 'Context extraction failed', 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  async handleFindSimilarPatterns(req: Request, res: Response, params?: any): Promise<void> {
    const { codeSnippet, threshold = 0.8 } = params || req.body;

    if (!codeSnippet) {
      res.status(400).json({ error: 'Code snippet is required' });
      return;
    }

    try {
      const similarityResult = await this.similarityAnalyzer.findSimilarPatterns(codeSnippet, threshold);
      
      res.status(200).json({ 
        success: true,
        ...similarityResult,
        threshold,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Similarity analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ 
        success: false,
        error: 'Similarity analysis failed', 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }
}
