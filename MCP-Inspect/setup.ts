/**
 * MCP Inspector Test Setup
 * 
 * Global test configuration and setup for MCP Inspector testing suite
 */

import { beforeAll, afterAll } from '@jest/testing-library/jest-dom';

// Global test timeout
jest.setTimeout(30000);

// Global setup
beforeAll(async () => {
  console.log('🚀 Initializing MCP Inspector Testing Suite - Phase 2');
  
  // Ensure test environment variables are set
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'debug';
  
  // Set mock API keys for testing (if not provided)
  if (!process.env.TEST_PINECONE_API_KEY) {
    process.env.TEST_PINECONE_API_KEY = 'test-pinecone-key';
  }
  
  if (!process.env.TEST_HUGGINGFACE_TOKEN) {
    process.env.TEST_HUGGINGFACE_TOKEN = 'test-hf-token';
  }
  
  if (!process.env.TEST_GITHUB_TOKEN) {
    process.env.TEST_GITHUB_TOKEN = 'test-github-token';
  }
});

// Global cleanup
afterAll(async () => {
  console.log('🧹 Cleaning up MCP Inspector Testing Suite');
  
  // Cleanup any test artifacts
  // Note: In a real implementation, we would clean up any test files,
  // temporary directories, or test data created during testing
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export {};
