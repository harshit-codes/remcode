#!/usr/bin/env node

/**
 * End-to-End Workflow Testing Script
 * 
 * Tests the complete Remcode workflow:
 * 1. First-time repository setup via MCP
 * 2. GitHub Actions processing pipeline
 * 3. Real embeddings and vectorization
 * 4. Semantic search functionality
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const TEST_REPO_PATH = '/Users/harshitchoudhary/Documents/GitHub/remcode-test';
const MCP_SERVER_URL = 'http://localhost:3008';
const GITHUB_OWNER = 'yashvibansalmin19';
const GITHUB_REPO = 'remcode-test';

/**
 * Make HTTP request to MCP server
 */
async function mcpRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            method: `tools/call`,
            params: {
                name: method,
                arguments: params
            },
            id: Date.now()
        });

        const options = {
            hostname: 'localhost',
            port: 3008,
            path: '/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result.error ? result.error : result.result);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}