#!/usr/bin/env node

/**
 * SSE Endpoint Test Script
 * 
 * Tests the new SSE endpoints to validate functionality
 */

const http = require('http');

const TEST_PORT = 3016;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function testSSEEndpoints() {
  console.log('🧪 Testing SSE Implementation...\n');
  
  // Start server
  console.log('🚀 Starting MCP server...');
  const { spawn } = require('child_process');
  const server = spawn('node', ['bin/remcode.js', 'serve', '--port', TEST_PORT, '--skip-token-collection'], {
    stdio: 'pipe'
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await makeRequest(`${BASE_URL}/health`);
    console.log('   ✅ Health check:', healthResponse.status === 'OK' ? 'PASS' : 'FAIL');
    
    // Test 2: SSE Health
    console.log('2️⃣ Testing SSE health endpoint...');
    const sseHealthResponse = await makeSSERequest(`${BASE_URL}/sse/health`);
    console.log('   ✅ SSE Health:', sseHealthResponse ? 'PASS' : 'FAIL');
    
    // Test 3: SSE Tools List
    console.log('3️⃣ Testing SSE tools list...');
    const sseToolsResponse = await makeSSERequest(`${BASE_URL}/sse/tools`);
    console.log('   ✅ SSE Tools:', sseToolsResponse ? 'PASS' : 'FAIL');
    
    // Test 4: SSE Connection
    console.log('4️⃣ Testing SSE connection...');
    const sseConnectResponse = await makeSSERequest(`${BASE_URL}/sse/connect`);
    console.log('   ✅ SSE Connect:', sseConnectResponse ? 'PASS' : 'FAIL');
    
    // Test 5: Tool execution via SSE
    console.log('5️⃣ Testing SSE tool execution...');
    const toolExecResponse = await makeToolRequest(`${BASE_URL}/sse/mcp`, {
      tool: 'huggingface_list_models',
      parameters: {}
    });
    console.log('   ✅ SSE Tool Exec:', toolExecResponse ? 'PASS' : 'FAIL');
    
    console.log('\n🎉 SSE Implementation Tests Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    server.kill();
    console.log('🛑 Server stopped');
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Request timeout')));
  });
}

function makeSSERequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let receivedData = false;
      
      res.on('data', (chunk) => {
        receivedData = true;
        // For SSE, receiving any data indicates success
        req.destroy(); // Close connection after receiving data
        resolve(true);
      });
      
      res.on('end', () => {
        if (!receivedData) {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(receivedData);
    });
  });
}

function makeToolRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(url, options, (res) => {
      let receivedData = false;
      
      res.on('data', (chunk) => {
        receivedData = true;
        req.destroy();
        resolve(true);
      });
      
      res.on('end', () => {
        if (!receivedData) {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(receivedData);
    });
    
    req.write(postData);
    req.end();
  });
}

// Run tests
if (require.main === module) {
  testSSEEndpoints().catch(console.error);
}
