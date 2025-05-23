import * as path from 'path';
import { SemanticSearch } from '../src/search/semantic';
import { ContextExtractor } from '../src/search/context-extractor';
import { SimilarityAnalyzer } from '../src/search/similarity';
import { QueryProcessor } from '../src/search/query-processor';
import { VectorizationPipeline } from '../src/vectorizers/pipeline';
import { getLogger } from '../src/utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();
const logger = getLogger('Phase2Demo');

class Phase2DemoTest {
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
      batchSize: 5
    });
  }

  async runPhase2Demo(): Promise<void> {
    logger.info('🎉 PHASE 2: SEMANTIC SEARCH ENGINE - COMPLETE DEMO');
    
    try {
      await this.setupTestData();
      await this.demonstrateSemanticSearch();
      await this.demonstrateContextExtraction();
      await this.demonstrateSimilarityAnalysis();
      await this.demonstrateQueryProcessing();
      await this.demonstrateEndToEndWorkflow();
      
      logger.info('🎉 Phase 2 Demo completed successfully! All components working!');
    } catch (error) {
      logger.error(`❌ Demo failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async setupTestData(): Promise<void> {
    logger.info('📊 Setting up test data with multiple files...');
    
    await this.vectorPipeline.initialize();
    
    const files = ['auth-service.ts', 'user-manager.tsx', 'data-processor.py'];
    
    for (const file of files) {
      const filePath = path.join(this.testDataPath, file);
      const chunks = await this.vectorPipeline.processFile(filePath, file);
      logger.info(`✅ Processed ${file}: ${chunks.length} chunks`);
    }
  }

  private async demonstrateSemanticSearch(): Promise<void> {
    logger.info('🔍 Demonstrating Semantic Search...');
    
    await this.semanticSearch.initialize();
    
    const queries = [
      'authentication',
      'user management',
      'password',
      'React component',
      'data processing',
      'async function'
    ];
    
    console.log('\n=== SEMANTIC SEARCH RESULTS ===');
    for (const query of queries) {
      const results = await this.semanticSearch.search(query, 3);
      console.log(`\n🔍 Query: "${query}"`);
      console.log(`   Results: ${results.length}`);
      
      for (const result of results) {
        console.log(`   📄 ${result.metadata.filePath} (score: ${result.score.toFixed(3)})`);
        console.log(`      ${result.content.replace(/\n/g, ' ').substring(0, 80)}...`);
      }
    }
  }

  private async demonstrateContextExtraction(): Promise<void> {
    logger.info('📝 Demonstrating Context Extraction...');
    
    const authServicePath = path.join(this.testDataPath, 'auth-service.ts');
    const context = await this.contextExtractor.extractContext(authServicePath, 20, 30);
    
    console.log('\n=== CONTEXT EXTRACTION DEMO ===');
    console.log('File: auth-service.ts (lines 20-30)');
    console.log('Class Context:', context.classContext);
    console.log('Related Functions:', context.relatedFunctions.slice(0, 3));
    console.log('Imports:', context.imports.length);
    console.log('Target Content Preview:');
    console.log(context.targetContent.split('\n').slice(0, 3).join('\n') + '...');
  }

  private async demonstrateSimilarityAnalysis(): Promise<void> {
    logger.info('🔗 Demonstrating Similarity Analysis...');
    
    const codeSnippet = `
    async function authenticateUser(email: string, password: string) {
      const user = await findUser(email);
      if (!user) throw new Error('Not found');
      return { success: true, token: generateToken(user) };
    }`;
    
    const similarity = await this.similarityAnalyzer.findSimilarPatterns(codeSnippet, 0.6);
    
    console.log('\n=== SIMILARITY ANALYSIS DEMO ===');
    console.log('Input: Authentication function snippet');
    console.log('Pattern Type:', similarity.patternType);
    console.log('Confidence:', similarity.confidence.toFixed(3));
    console.log('Similarity Reasons:');
    similarity.similarityReasons.forEach(reason => console.log(`  - ${reason}`));
    console.log('Similar Code Found:', similarity.similarCode.length, 'matches');
  }

  private async demonstrateQueryProcessing(): Promise<void> {
    logger.info('⚙️ Demonstrating Query Processing...');
    
    const queries = [
      'find user authentication code',
      '"JWT token"',
      'how does password validation work',
      'regex: async.*User'
    ];
    
    console.log('\n=== QUERY PROCESSING DEMO ===');
    for (const query of queries) {
      const processed = await this.queryProcessor.processQuery(query);
      console.log(`\nQuery: "${query}"`);
      console.log(`  Type: ${processed.queryType}, Intent: ${processed.intent}`);
      console.log(`  Confidence: ${processed.confidence.toFixed(3)}`);
      console.log(`  Processed: "${processed.processedQuery}"`);
    }
  }

  private async demonstrateEndToEndWorkflow(): Promise<void> {
    logger.info('🌟 Demonstrating End-to-End Search Workflow...');
    
    console.log('\n=== END-TO-END WORKFLOW DEMO ===');
    console.log('Scenario: Developer wants to find authentication-related code');
    
    // 1. Process query
    const userQuery = 'show me authentication functions with error handling';
    const processedQuery = await this.queryProcessor.processQuery(userQuery);
    console.log(`\n1. Query Processing:`);
    console.log(`   Original: "${userQuery}"`);
    console.log(`   Type: ${processedQuery.queryType}, Intent: ${processedQuery.intent}`);
    console.log(`   Processed: "${processedQuery.processedQuery}"`);
    
    // 2. Semantic search
    const searchResults = await this.semanticSearch.search(processedQuery.processedQuery, 5);
    console.log(`\n2. Semantic Search: Found ${searchResults.length} results`);
    
    // 3. Extract context for top result
    if (searchResults.length > 0) {
      const topResult = searchResults[0];
      console.log(`\n3. Top Result Context:`);
      console.log(`   File: ${topResult.metadata.filePath}`);
      console.log(`   Score: ${topResult.score.toFixed(3)}`);
      console.log(`   Content: ${topResult.content.substring(0, 150)}...`);
      
      // Extract more context
      const startLine = topResult.metadata.startLine || 0;
      const endLine = topResult.metadata.endLine || startLine + 10;
      const context = await this.contextExtractor.extractContext(
        topResult.metadata.filePath, 
        Math.max(0, startLine - 2), 
        endLine + 2
      );
      
      console.log(`\n4. Enhanced Context:`);
      console.log(`   Class: ${context.classContext}`);
      console.log(`   Related Functions: ${context.relatedFunctions.slice(0, 3).join(', ')}`);
    }
    
    console.log('\n✅ Complete workflow: Query → Search → Context → Results');
  }
}

// Run the demo
const demo = new Phase2DemoTest();
demo.runPhase2Demo().catch(console.error);
