/**
 * Global Test Setup
 * Configures the test environment for all lean tests
 */

import { setupTestEnvironment } from './utils';

// Setup test environment before any tests run
beforeAll(() => {
  setupTestEnvironment();
  console.log('🧪 Lean test environment initialized');
});

// Global test timeout (fast tests only)
jest.setTimeout(5000);

// Suppress console logs during tests unless LOG_LEVEL=debug
const originalLog = console.log;
const originalError = console.error;

if (process.env.LOG_LEVEL !== 'debug') {
  console.log = jest.fn();
  console.error = jest.fn();
}

// Restore console methods after tests
afterAll(() => {
  if (process.env.LOG_LEVEL !== 'debug') {
    console.log = originalLog;
    console.error = originalError;
  }
  console.log('✅ Lean test suite completed');
});
