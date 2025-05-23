import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function testEmbeddingAPI() {
  const models = [
    'BAAI/bge-base-en-v1.5',
    'BAAI/bge-small-en-v1.5',
    'sentence-transformers/all-MiniLM-L12-v2'
  ];
  
  const testText = 'function authenticateUser(email, password) { return true; }';
  
  for (const model of models) {
    console.log(`\n🧪 Testing ${model}:`);
    
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs: testText },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      console.log('✅ Success!');
      console.log('Response type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      if (Array.isArray(response.data)) {
        console.log('Array length:', response.data.length);
        console.log('First element type:', typeof response.data[0]);
        if (typeof response.data[0] === 'number') {
          console.log('Embedding dimension:', response.data.length);
        } else if (Array.isArray(response.data[0])) {
          console.log('Tokens count:', response.data.length);
          console.log('First token dimension:', response.data[0].length);
        }
      }
      console.log('Sample:', JSON.stringify(response.data).substring(0, 100) + '...');
      
    } catch (error) {
      console.log('❌ Failed');
      if (axios.isAxiosError(error) && error.response) {
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      } else {
        console.log('Error:', (error as Error).message);
      }
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testEmbeddingAPI().catch(console.error);
