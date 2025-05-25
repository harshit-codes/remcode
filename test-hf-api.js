const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/harshitchoudhary/Documents/remcode/remcode-test/.env' });

async function testHuggingFaceAPI() {
  const token = process.env.HUGGINGFACE_TOKEN;
  const modelId = 'microsoft/codebert-base';
  const text = 'function test() { return "hello"; }';
  
  console.log('🔧 Testing HuggingFace API...');
  console.log(`Model: ${modelId}`);
  console.log(`Text: ${text}`);
  console.log(`Token: ${token.substring(0, 10)}...`);
  
  try {
    // Test 1: CodeBERT with feature extraction endpoint (as per EmbeddingManager)
    const requestBody1 = { 
      inputs: text,
      options: { wait_for_model: true }
    };
    const apiUrl1 = `https://api-inference.huggingface.co/pipeline/feature-extraction/${modelId}`;
    
    console.log(`\n🚀 Test 1: CodeBERT Feature Extraction`);
    console.log(`URL: ${apiUrl1}`);
    console.log(`Body: ${JSON.stringify(requestBody1)}`);
    
    const response1 = await axios.post(
      apiUrl1,
      requestBody1,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log(`✅ Success! Status: ${response1.status}`);
    console.log(`Response type: ${Array.isArray(response1.data) ? 'Array' : typeof response1.data}`);
    if (Array.isArray(response1.data)) {
      console.log(`Array length: ${response1.data.length}`);
      if (response1.data.length > 0) {
        console.log(`First element type: ${Array.isArray(response1.data[0]) ? 'Array' : typeof response1.data[0]}`);
        if (Array.isArray(response1.data[0])) {
          console.log(`Embedding dimension: ${response1.data[0].length}`);
        }
      }
    }
    
  } catch (error1) {
    console.log(`❌ Test 1 Failed:`, error1.response?.status, error1.response?.data);
    
    // Test 2: Standard API endpoint
    try {
      const requestBody2 = { 
        inputs: text,
        options: { wait_for_model: true }
      };
      const apiUrl2 = `https://api-inference.huggingface.co/models/${modelId}`;
      
      console.log(`\n🚀 Test 2: Standard API Endpoint`);
      console.log(`URL: ${apiUrl2}`);
      console.log(`Body: ${JSON.stringify(requestBody2)}`);
      
      const response2 = await axios.post(
        apiUrl2,
        requestBody2,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      console.log(`✅ Success! Status: ${response2.status}`);
      console.log(`Response:`, JSON.stringify(response2.data).substring(0, 200) + '...');
      
    } catch (error2) {
      console.log(`❌ Test 2 Failed:`, error2.response?.status, error2.response?.data);
      
      // Test 3: BGE model (known to work)
      try {
        const bgeModel = 'BAAI/bge-base-en-v1.5';
        const requestBody3 = { 
          inputs: text,
          options: { wait_for_model: true }
        };
        const apiUrl3 = `https://api-inference.huggingface.co/models/${bgeModel}`;
        
        console.log(`\n🚀 Test 3: BGE Model`);
        console.log(`URL: ${apiUrl3}`);
        console.log(`Body: ${JSON.stringify(requestBody3)}`);
        
        const response3 = await axios.post(
          apiUrl3,
          requestBody3,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );
        
        console.log(`✅ Success! Status: ${response3.status}`);
        console.log(`Response type: ${Array.isArray(response3.data) ? 'Array' : typeof response3.data}`);
        if (Array.isArray(response3.data)) {
          console.log(`Embedding dimension: ${response3.data.length}`);
        }
        
      } catch (error3) {
        console.log(`❌ Test 3 Failed:`, error3.response?.status, error3.response?.data);
        console.log(`All tests failed. Check token permissions and model availability.`);
      }
    }
  }
}

testHuggingFaceAPI().catch(console.error);
