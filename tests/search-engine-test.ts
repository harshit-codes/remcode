import * as path from 'path';
import { SemanticSearch } from '../src/search/semantic';
import { ContextExtractor } from '../src/search/context-extractor';
import { SimilarityAnalyzer } from '../src/search/similarity';
import { QueryProcessor } from '../src/search/query-processor';
import { VectorizationPipeline } from '../src/vectorizers/pipeline';
import { getLogger } from '../src/utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();
const logger = getLogger('SearchTest');

class SearchEngineTest {
  private semanticSearch: SemanticSearch;
  private contextExtractor: ContextExtractor;
  private similarityAnalyzer: SimilarityAnalyzer;
  private queryProcessor: QueryProcessor;
  private vectorPipeline: VectorizationPipeline;
  private testDataPath: string;

  constructor() {
    this.testDataPath = path.join(__dirname, '../test-data');
    
    this.semanticSearch = new SemanticSearch({
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeIndexName: 'remcode-test',
      pineconeNamespace: 'test',
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
      embeddingModel: 'BAAI/bge-base-en-v1.5',
      fallbackModel: 'BAAI/bge-small-en-v1.5'
    });
    
    this.contextExtractor = new ContextExtractor();
    this.queryProcessor = new QueryProcessor();
    
    this.similarityAnalyzer = new SimilarityAnalyzer({
      semanticSearch: this.semanticSearch
    });
    
    this.vectorPipeline = new VectorizationPipeline({
      pineconeApiKey: process.env.PINECONE_API_KEY!,
      pineconeIndexName: 'remcode-test',
      pineconeNamespace: 'test',
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN!,
      embeddingModel: 'BAAI/bge-base-en-v1.5',
      fallbackModel: 'BAAI/bge-small-en-v1.5',
      batchSize: 5
    });
  }

  async runAllTests(): Promise<void> {
    logger.info('🚀 Starting Phase 2: Semantic Search Engine Tests');
    
    try {
      await this.testVectorization();
      await this.testSemanticSearch();
      await this.testContextExtraction();
      await this.testSimilarityAnalysis();
      await this.testQueryProcessing();
      
      logger.info('✅ All Phase 2 tests completed successfully!');
    } catch (error) {
      logger.error(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async testVectorization(): Promise<void> {
    logger.info('📊 Testing vectorization pipeline...');
    
    await this.vectorPipeline.initialize();
    
    // Test vectorizing our sample files
    const authServicePath = path.join(this.testDataPath, 'auth-service.ts');
    const chunks = await this.vectorPipeline.processFile(authServicePath, 'auth-service.ts');
    
    logger.info(`✅ Vectorized ${chunks.length} chunks from auth-service.ts`);
    console.log('Sample chunk:', {
      content: chunks[0]?.content.substring(0, 100) + '...',
      hasEmbedding: !!chunks[0]?.embedding,
      embeddingDim: chunks[0]?.embedding?.length
    });
  }

  private async testSemanticSearch(): Promise<void> {
    logger.info('🔍 Testing semantic search...');
    
    await this.semanticSearch.initialize();
    
    // Test various search queries
    const queries = [
      'authentication function',
      'JWT token generation',
      'password verification',
      'error handling'
    ];
    
    for (const query of queries) {
      const results = await this.semanticSearch.search(query, 3);
      logger.info(`Query: "${query}" → ${results.length} results`);
      if (results.length > 0) {
        console.log('Top result:', {
          score: results[0].score,
          filePath: results[0].metadata.filePath,
          content: results[0].content.substring(0, 100) + '...'
        });
      }
    }
  }

  private async testContextExtraction(): Promise<void> {
    logger.info('📝 Testing context extraction...');
    
    const authServicePath = path.join(this.testDataPath, 'auth-service.ts');
    const context = await this.contextExtractor.extractContext(authServicePath, 20, 30);
    
    logger.info('✅ Context extraction completed');
    console.log('Extracted context:', {
      targetLines: context.targetContent.split('\n').length,
      surroundingLines: context.surroundingLines.length,
      relatedFunctions: context.relatedFunctions,
      imports: context.imports.length,
      classContext: context.classContext,
      moduleContext: context.moduleContext
    });
  }

  private async testSimilarityAnalysis(): Promise<void> {
    logger.info('🔗 Testing similarity analysis...');
    
    const codeSnippet = `
    async authenticateUser(email: string, password: string): Promise<AuthResult> {
      const user = await User.findByEmail(email);
      if (!user) throw new Error('User not found');
      return { success: true, token: 'jwt-token' };
    }`;
    
    const similarity = await this.similarityAnalyzer.findSimilarPatterns(codeSnippet, 0.7);
    
    logger.info('✅ Similarity analysis completed');
    console.log('Similarity result:', {
      patternType: similarity.patternType,
      confidence: similarity.confidence,
      similarityReasons: similarity.similarityReasons,
      similarCodeCount: similarity.similarCode.length
    });
  }

  private async testQueryProcessing(): Promise<void> {
    logger.info('⚙️ Testing query processing...');
    
    const queries = [
      'find authentication functions',
      '"JWT token"',
      'how does user login work',
      'regex: async.*authenticate'
    ];
    
    for (const query of queries) {
      const processed = await this.queryProcessor.processQuery(query);
      logger.info(`Query: "${query}"`);
      console.log('Processed:', {
        queryType: processed.queryType,
        intent: processed.intent,
        confidence: processed.confidence,
        processedQuery: processed.processedQuery
      });
    }
  }
}

// Run the tests
const tester = new SearchEngineTest();
tester.runAllTests().catch(console.error);
