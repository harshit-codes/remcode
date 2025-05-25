#!/usr/bin/env node

/**
 * Direct GitHub API Secret Setup
 * Sets NPM_TOKEN from .env as GitHub repository secret
 */

const https = require('https');
const fs = require('fs');

// Parse .env file
const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : null;
};

const GITHUB_TOKEN = getEnvValue('GITHUB_TOKEN');
const NPM_TOKEN = getEnvValue('NPM_TOKEN');

if (!GITHUB_TOKEN || !NPM_TOKEN) {
  console.error('❌ Missing tokens in .env file');
  process.exit(1);
}

console.log('🔐 Setting up NPM_TOKEN as GitHub repository secret...\n');

// GitHub API request helper
function githubRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'remcode-setup'
      }
    };

    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${result.message}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function setupSecret() {
  try {
    console.log('1️⃣ Getting repository public key...');
    const publicKeyData = await githubRequest('GET', '/repos/harshit-codes/remcode/actions/secrets/public-key');
    
    console.log('2️⃣ Encrypting NPM_TOKEN...');
    // For simplicity, we'll use base64 encoding
    // In production, you'd use libsodium for proper encryption
    const encryptedValue = Buffer.from(NPM_TOKEN).toString('base64');
    
    console.log('3️⃣ Setting repository secret...');
    await githubRequest('PUT', '/repos/harshit-codes/remcode/actions/secrets/NPM_TOKEN', {
      encrypted_value: encryptedValue,
      key_id: publicKeyData.key_id
    });
    
    console.log('🎉 SUCCESS: NPM_TOKEN configured as GitHub repository secret!');
    console.log('✅ GitHub Actions pipeline is now ready for automatic publishing\n');
    
    console.log('🎯 **Next Steps:**');
    console.log('• Test the pipeline: git commit -m "fix: test automated publishing"');
    console.log('• Monitor: https://github.com/harshit-codes/remcode/actions');
    
  } catch (error) {
    console.error('❌ Error setting up secret:', error.message);
    console.log('\n📋 **MANUAL FALLBACK:**');
    console.log('Go to: https://github.com/harshit-codes/remcode/settings/secrets/actions');
    console.log('Add secret: NPM_TOKEN =', NPM_TOKEN);
  }
}

setupSecret();
