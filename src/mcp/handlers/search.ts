import { Request, Response } from 'express';
import { getLogger } from '../../utils/logger';
import { SemanticSearch } from '../../search/semantic';

const logger = getLogger('SearchMCPHandler');

export class SearchMCPHandler {
  private semanticSearch: SemanticSearch;

  constructor() {
    this.semanticSearch = new SemanticSearch();
  }

  async handleSearchCode(req: Request, res: Response, params?: any): Promise<void> {
    const { query, topK = 10, filters } = params || req.body;

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    try {
      const results = await this.semanticSearch.search(query, topK, filters);
      res.status(200).json({ results, totalResults: results.length });
    } catch (error) {
      logger.error(`Search failed: ${error}`);
      res.status(500).json({ error: 'Search failed' });
    }
  }

  async handleGetCodeContext(req: Request, res: Response, params?: any): Promise<void> {
    const { filePath, startLine, endLine } = params || req.body;

    try {
      // Stub implementation
      res.status(200).json({ 
        context: {
          filePath,
          lines: `${startLine}-${endLine}`,
          content: 'Mock context content'
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Context extraction failed' });
    }
  }
}
