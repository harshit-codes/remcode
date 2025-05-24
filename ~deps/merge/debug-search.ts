import { PineconeStorage } from '../src/vectorizers/storage/pinecone';
import { EmbeddingManager } from '../src/vectorizers/embedders/manager';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugSearch() {
  console.log('🔍 Debugging Pinecone search...');
  
  const storage = new PineconeStorage({
    apiKey: process.env.PINECONE_API_KEY!,
    indexName: 'remcode-test',
    namespace: 'test'
  });
  
  await storage.initialize();
  
  // Check index stats
  console.log('\n📊 Index stats:');
  const stats = await storage.getIndexStats('test');
  console.log(JSON.stringify(stats, null, 2));
  
  // Try a simple query with low threshold
  console.log('\n🔍 Testing simple query...');
  const embedder = new EmbeddingManager({
    primary: 'BAAI/bge-base-en-v1.5',
    fallback: 'BAAI/bge-small-en-v1.5',
    token: process.env.HUGGINGFACE_TOKEN!,
    batchSize: 1
  });
  
  const testQuery = 'authentication';
  const chunks = await embedder.embedChunks([{
    content: testQuery,
    metadata: { file_path: 'query', strategy: 'test', chunk_type: 'query' }
  }]);
  
  console.log('Query embedding dimension:', chunks[0].embedding?.length);
  
  // Search with very low threshold
  const results = await storage.queryVectors(
    chunks[0].embedding!,
    10,
    undefined,
    'test'
  );
  
  console.log('Raw results:', results.length);
  for (const result of results.slice(0, 3)) {
    console.log({
      id: result.id,
      score: result.score,
      metadata: result.metadata
    });
  }
}

debugSearch().catch(console.error);
