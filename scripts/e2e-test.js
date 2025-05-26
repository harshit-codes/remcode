#!/usr/bin/env node

/**
 * Simple E2E Test for Remcode Workflow
 */

const http = require('http');

// Configuration
const MCP_SERVER_URL = 'http://localhost:3008';

/**
 * Make MCP request
 */
async function mcpRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            method: `tools/call`,
            params: { name: method, arguments: params },
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

module.exports = { mcpRequest };