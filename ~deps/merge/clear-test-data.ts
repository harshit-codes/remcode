import { PineconeStorage } from '../src/vectorizers/storage/pinecone';
import * as dotenv from 'dotenv';

dotenv.config();

async function clearTestData() {
  const storage = new PineconeStorage({
    apiKey: process.env.PINECONE_API_KEY!,
    indexName: 'remcode-test',
    namespace: 'test'
  });
  
  await storage.initialize();
  console.log('Clearing test namespace...');
  await storage.deleteVectors(undefined, true, undefined, 'test');
  console.log('✅ Test data cleared');
}

clearTestData().catch(console.error);
