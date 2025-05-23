import { SemanticSearch } from '../src/search/semantic';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugSemanticSearch() {
  console.log('🔍 Debugging SemanticSearch...');
  
  const search = new SemanticSearch({
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeIndexName: 'remcode-test',
    pineconeNamespace: 'test',
    huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
    embeddingModel: 'BAAI/bge-base-en-v1.5',
    fallbackModel: 'BAAI/bge-small-en-v1.5'
  });
  
  await search.initialize();
  
  console.log('\n🔍 Testing semantic search with "authentication"...');
  const results = await search.search('authentication', 10);
  
  console.log(`Results count: ${results.length}`);
  for (const result of results) {
    console.log({
      id: result.id,
      score: result.score,
      content: result.content.substring(0, 100) + '...',
      filePath: result.metadata.filePath
    });
  }
}

debugSemanticSearch().catch(console.error);
