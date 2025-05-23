import { VectorizationPipeline } from '../src/vectorizers/pipeline';
import { SemanticSearch } from '../src/search/semantic';
import { UnifiedSearch } from '../src/search/unified-search';
import { ContextExtractor } from '../src/search/context-extractor';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const testConfig = {
  pineconeApiKey: process.env.PINECONE_API_KEY,
  pineconeIndexName: 'remcode-test',
  pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
  pineconeNamespace: 'integration-test',
  huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
  embeddingModel: 'BAAI/bge-base-en-v1.5',
  fallbackModel: 'BAAI/bge-small-en-v1.5',
  embeddingDimension: 768  // bge-base-en-v1.5 produces 768-dimensional embeddings
};

describe('Phase 2: Integration Test - Complete Search Pipeline', () => {
  let vectorizer: VectorizationPipeline;
  let semanticSearch: SemanticSearch;
  let unifiedSearch: UnifiedSearch;
  let contextExtractor: ContextExtractor;
  
  const testFilesDir = path.join(__dirname, 'test-code-samples');

  beforeAll(async () => {
    // Skip tests if API keys are not available
    if (!testConfig.pineconeApiKey || !testConfig.huggingfaceToken) {
      console.warn('Skipping integration tests - API keys not available');
      return;
    }

    // Create test code samples
    await createTestCodeSamples();

    // Initialize vectorization pipeline
    vectorizer = new VectorizationPipeline({
      pineconeApiKey: testConfig.pineconeApiKey,
      pineconeIndexName: testConfig.pineconeIndexName,
      pineconeNamespace: testConfig.pineconeNamespace,
      huggingfaceToken: testConfig.huggingfaceToken,
      embeddingModel: testConfig.embeddingModel,
      fallbackModel: testConfig.fallbackModel,
      batchSize: 5,
      maxFileSize: 1024 * 1024,
      chunkingStrategy: {
        clean_modules: 'class_level',
        complex_modules: 'function_level',
        monolithic_files: 'sliding_window'
      }
    });

    await vectorizer.initialize();

    // Initialize search components
    semanticSearch = new SemanticSearch({
      ...testConfig,
      pineconeNamespace: testConfig.pineconeNamespace,
      embeddingDimension: testConfig.embeddingDimension
    });

    await semanticSearch.initialize();

    unifiedSearch = new UnifiedSearch(semanticSearch);
    contextExtractor = new ContextExtractor();

    console.log('✅ All components initialized successfully');
  }, 60000);

  afterAll(async () => {
    // Clean up test files
    if (fs.existsSync(testFilesDir)) {
      fs.rmSync(testFilesDir, { recursive: true, force: true });
    }
  });

  test('should vectorize test code and perform successful searches', async () => {
    if (!testConfig.pineconeApiKey || !testConfig.huggingfaceToken) {
      console.warn('Skipping - API keys not available');
      return;
    }

    // 1. Vectorize the test code files
    console.log('📁 Vectorizing test code files...');
    const vectorizationResult = await vectorizer.processDirectory(testFilesDir);
    
    expect(vectorizationResult.success).toBe(true);
    expect(vectorizationResult.filesProcessed).toBeGreaterThan(0);
    expect(vectorizationResult.chunksCreated).toBeGreaterThan(0);
    expect(vectorizationResult.vectorsStored).toBeGreaterThan(0);
    
    console.log(`✅ Vectorization completed:`);
    console.log(`   - Files processed: ${vectorizationResult.filesProcessed}`);
    console.log(`   - Chunks created: ${vectorizationResult.chunksCreated}`);
    console.log(`   - Vectors stored: ${vectorizationResult.vectorsStored}`);

    // Wait a moment for indexing to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Test various search queries
    const testQueries = [
      'authentication function',
      'user management',
      'error handling',
      'async await',
      'database connection',
      'validation logic'
    ];

    for (const query of testQueries) {
      console.log(`🔍 Testing search: "${query}"`);
      
      const searchResult = await unifiedSearch.search(query, 3);
      
      expect(searchResult.query).toBeDefined();
      expect(searchResult.results).toBeDefined();
      expect(Array.isArray(searchResult.results)).toBe(true);
      
      console.log(`   - Query type: ${searchResult.query.queryType}`);
      console.log(`   - Results found: ${searchResult.totalResults}`);
      console.log(`   - Search time: ${searchResult.searchTime}ms`);
      
      if (searchResult.totalResults > 0) {
        const topResult = searchResult.results[0];
        console.log(`   - Top result: ${topResult.metadata.filePath} (score: ${topResult.score.toFixed(3)})`);
      }
    }

    // 3. Test specific code similarity search
    console.log('🔍 Testing code similarity search...');
    const codeSnippet = `
      async function authenticate(username: string, password: string): Promise<User | null> {
        try {
          const hashedPassword = await hashPassword(password);
          const user = await findUserByUsername(username);
          if (user && user.password === hashedPassword) {
            return user;
          }
          return null;
        } catch (error) {
          logger.error('Authentication failed', error);
          throw error;
        }
      }
    `;

    const similarityResults = await semanticSearch.searchSimilarCode(codeSnippet, 5);
    expect(Array.isArray(similarityResults)).toBe(true);
    
    console.log(`   - Similar code results: ${similarityResults.length}`);
    
    // 4. Test context extraction for actual files
    if (vectorizationResult.filesProcessed > 0) {
      console.log('📄 Testing context extraction...');
      const testFiles = fs.readdirSync(testFilesDir).filter(f => f.endsWith('.ts'));
      
      if (testFiles.length > 0) {
        const testFile = path.join(testFilesDir, testFiles[0]);
        const contextResult = await contextExtractor.extractContext(testFile, 0, 10);
        
        expect(contextResult.targetContent).toBeDefined();
        expect(contextResult.fileStructure).toBeDefined();
        
        console.log(`   - Context extracted for ${testFiles[0]}`);
        console.log(`   - Functions found: ${contextResult.fileStructure!.functions.length}`);
        console.log(`   - Classes found: ${contextResult.fileStructure!.classes.length}`);
      }
    }

    console.log('✅ Integration test completed successfully!');
  }, 90000);

  async function createTestCodeSamples(): Promise<void> {
    // Create test directory
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }

    // Sample 1: Authentication service
    const authService = `
import { User } from './types';
import { logger } from './logger';
import { hashPassword, verifyPassword } from './crypto';

export class AuthenticationService {
  private users: Map<string, User> = new Map();

  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const user = this.users.get(username);
      if (!user) {
        logger.warn(\`Authentication attempt for non-existent user: \${username}\`);
        return null;
      }

      const isValid = await verifyPassword(password, user.hashedPassword);
      if (isValid) {
        logger.info(\`User \${username} authenticated successfully\`);
        return user;
      } else {
        logger.warn(\`Invalid password for user: \${username}\`);
        return null;
      }
    } catch (error) {
      logger.error('Authentication error:', error);
      throw new Error('Authentication failed');
    }
  }

  async registerUser(username: string, password: string, email: string): Promise<User> {
    if (this.users.has(username)) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user: User = {
      id: Date.now().toString(),
      username,
      email,
      hashedPassword,
      createdAt: new Date()
    };

    this.users.set(username, user);
    logger.info(\`User registered: \${username}\`);
    return user;
  }

  validateUserInput(username: string, password: string, email?: string): string[] {
    const errors: string[] = [];
    
    if (!username || username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (email && !email.includes('@')) {
      errors.push('Invalid email format');
    }
    
    return errors;
  }
}
`;

    // Sample 2: Database manager
    const dbManager = `
import { Connection, QueryResult } from './database';
import { logger } from './logger';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: Connection | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect(connectionString: string): Promise<void> {
    try {
      this.connection = new Connection(connectionString);
      await this.connection.connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    try {
      const result: QueryResult<T> = await this.connection.query(sql, params);
      logger.debug(\`Query executed: \${sql}\`);
      return result.rows;
    } catch (error) {
      logger.error(\`Query failed: \${sql}\`, error);
      throw error;
    }
  }

  async transaction<T>(callback: (query: Function) => Promise<T>): Promise<T> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    await this.connection.beginTransaction();
    
    try {
      const result = await callback(this.query.bind(this));
      await this.connection.commit();
      return result;
    } catch (error) {
      await this.connection.rollback();
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      logger.info('Database disconnected');
    }
  }
}
`;

    // Sample 3: API client with error handling
    const apiClient = `
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from './logger';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private retryAttempts: number = 3;

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const config = error.config;
        
        if (config.retryCount < this.retryAttempts) {
          config.retryCount = config.retryCount || 0;
          config.retryCount++;
          
          logger.warn(\`Retrying request (attempt \${config.retryCount}): \${config.url}\`);
          await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount));
          
          return this.client(config);
        }
        
        logger.error('API request failed after retries:', error);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(endpoint, { params });
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(endpoint, data);
      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = \`API Error \${error.response.status}: \${error.response.data?.message || 'Unknown error'}\`;
      logger.error(message);
      return new Error(message);
    } else if (error.request) {
      const message = 'Network error: No response received';
      logger.error(message);
      return new Error(message);
    } else {
      logger.error('Request error:', error.message);
      return new Error(\`Request failed: \${error.message}\`);
    }
  }
}
`;

    // Write the sample files
    fs.writeFileSync(path.join(testFilesDir, 'auth-service.ts'), authService);
    fs.writeFileSync(path.join(testFilesDir, 'database-manager.ts'), dbManager);
    fs.writeFileSync(path.join(testFilesDir, 'api-client.ts'), apiClient);

    console.log('✅ Test code samples created');
  }
});
