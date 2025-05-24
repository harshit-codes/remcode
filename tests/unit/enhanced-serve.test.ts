/**
 * Unit Tests for Enhanced Serve Command Features
 * 
 * Tests token management, port selection, and enhanced UX features
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { TokenManager } from '../../src/utils/token-manager';
import { PortManager } from '../../src/utils/port-manager';
import fs from 'fs';
import path from 'path';
import { createServer } from 'net';

describe('Enhanced Serve Command Features', () => {
  const testDir = path.join(__dirname, '../fixtures/temp-test');
  let tokenManager: TokenManager;

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    tokenManager = new TokenManager(testDir);
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('TokenManager', () => {
    test('should load existing tokens from .env file', () => {
      // Create test .env file
      const envContent = `
# Test environment
GITHUB_TOKEN=test-github-token
PINECONE_API_KEY=pcsk_test-pinecone-key
HUGGINGFACE_TOKEN=hf_test-huggingface-token
OTHER_VAR=other-value
`;
      fs.writeFileSync(path.join(testDir, '.env'), envContent);

      const tokens = tokenManager.loadExistingTokens();
      
      expect(tokens.GITHUB_TOKEN).toBe('test-github-token');
      expect(tokens.PINECONE_API_KEY).toBe('pcsk_test-pinecone-key');
      expect(tokens.HUGGINGFACE_TOKEN).toBe('hf_test-huggingface-token');
      expect(tokens.OTHER_VAR).toBeUndefined(); // Should not load non-token vars
    });

    test('should return empty object when no .env file exists', () => {
      const tokens = tokenManager.loadExistingTokens();
      expect(tokens).toEqual({});
    });

    test('should convert CLI options to tokens correctly', () => {
      const options = {
        githubToken: 'cli-github-token',
        pineconeKey: 'cli-pinecone-key',
        huggingfaceToken: 'cli-huggingface-token'
      };

      const tokens = TokenManager.cliOptionsToTokens(options);
      
      expect(tokens.GITHUB_TOKEN).toBe('cli-github-token');
      expect(tokens.PINECONE_API_KEY).toBe('cli-pinecone-key');
      expect(tokens.HUGGINGFACE_TOKEN).toBe('cli-huggingface-token');
    });

    test('should save tokens to .env file preserving other variables', async () => {
      // Create existing .env with other variables
      const existingContent = `
# Existing config
LOG_LEVEL=debug
MCP_PORT=3000
GITHUB_TOKEN=old-token
`;
      fs.writeFileSync(path.join(testDir, '.env'), existingContent);

      const tokens = {
        GITHUB_TOKEN: 'new-github-token',
        PINECONE_API_KEY: 'new-pinecone-key',
        HUGGINGFACE_TOKEN: 'new-huggingface-token'
      };

      await tokenManager.saveTokensToEnv(tokens);

      const savedContent = fs.readFileSync(path.join(testDir, '.env'), 'utf8');
      
      // Check that tokens are saved
      expect(savedContent).toContain('GITHUB_TOKEN=new-github-token');
      expect(savedContent).toContain('PINECONE_API_KEY=new-pinecone-key');
      expect(savedContent).toContain('HUGGINGFACE_TOKEN=new-huggingface-token');
      
      // Check that other variables are preserved
      expect(savedContent).toContain('LOG_LEVEL=debug');
      expect(savedContent).toContain('MCP_PORT=3000');
    });
  });

  describe('PortManager', () => {
    test('should detect available port correctly', async () => {
      // Test with a high port number likely to be available
      const testPort = 9876;
      const isAvailable = await PortManager.isPortAvailable(testPort);
      expect(isAvailable).toBe(true);
    });

    test('should detect busy port correctly', async () => {
      // Create a server to occupy a port
      const testPort = 9877;
      const server = createServer();
      
      await new Promise<void>((resolve) => {
        server.listen(testPort, '127.0.0.1', () => {
          // Add small delay to ensure server is fully listening
          setTimeout(resolve, 100);
        });
      });

      try {
        const isAvailable = await PortManager.isPortAvailable(testPort);
        expect(isAvailable).toBe(false);
      } finally {
        await new Promise<void>((resolve) => {
          server.close(() => resolve());
        });
      }
    });

    test('should find available port with auto-increment', async () => {
      // Start a server on a test port
      const testPort = 9878;
      const server = createServer();
      
      await new Promise<void>((resolve) => {
        server.listen(testPort, '127.0.0.1', () => {
          setTimeout(resolve, 100);
        });
      });

      try {
        const result = await PortManager.findAvailablePort(testPort, 5);
        
        expect(result.available).toBe(true);
        expect(result.port).toBeGreaterThan(testPort); // Should auto-increment
        expect(result.autoSelected).toBe(true);
      } finally {
        await new Promise<void>((resolve) => {
          server.close(() => resolve());
        });
      }
    });

    test('should return preferred port if available', async () => {
      const testPort = 9879;
      const result = await PortManager.findAvailablePort(testPort, 5);
      
      expect(result.available).toBe(true);
      expect(result.port).toBe(testPort);
      expect(result.autoSelected).toBe(false);
    });
  });
});
