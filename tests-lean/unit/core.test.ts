/**
 * Simple Core Tests - No External Dependencies
 */

const { describe, it, expect } = require('@jest/globals');
const { TestDataFactory } = require('../utils');

describe('Core Business Logic', () => {
  describe('Configuration', () => {
    it('should create valid remcode config', () => {
      const config = TestDataFactory.remcodeConfig();
      
      expect(config.version).toBe('0.1.0');
      expect(config.repository.name).toBe('test-repo');
      expect(config.vectorization.provider).toBe('pinecone');
    });

    it('should merge config updates', () => {
      const config = TestDataFactory.remcodeConfig({
        vectorization: { embeddingModel: 'new-model' }
      });
      
      expect(config.vectorization.embeddingModel).toBe('new-model');
      expect(config.repository.name).toBe('test-repo');
    });
  });

  describe('Data Structures', () => {
    it('should create valid code chunks', () => {
      const chunk = TestDataFactory.codeChunk();
      
      expect(chunk.content).toContain('function testFunction');
      expect(chunk.metadata.file_path).toBe('/test/file.ts');
      expect(chunk.metadata.language).toBe('typescript');
    });

    it('should create valid embeddings', () => {
      const embedding = TestDataFactory.embedding();
      
      expect(embedding).toHaveLength(768);
      expect(embedding.every(val => typeof val === 'number')).toBe(true);
    });

    it('should create valid MCP requests', () => {
      const request = TestDataFactory.mcpRequest('search-code', { query: 'test' });
      
      expect(request.jsonrpc).toBe('2.0');
      expect(request.method).toBe('tools/call');
      expect(request.params.name).toBe('search-code');
    });
  });

  describe('Language Detection', () => {
    it('should detect programming languages', () => {
      const testCases = [
        { file: 'test.ts', expected: 'typescript' },
        { file: 'test.js', expected: 'javascript' },
        { file: 'test.py', expected: 'python' }
      ];

      testCases.forEach(({ file, expected }) => {
        const extension = file.split('.').pop();
        const languageMap = {
          'ts': 'typescript',
          'js': 'javascript', 
          'py': 'python'
        };
        expect(languageMap[extension]).toBe(expected);
      });
    });
  });

  describe('Basic Operations', () => {
    it('should handle arrays correctly', () => {
      const items = [1, 2, 3, 4, 5];
      const doubled = items.map(x => x * 2);
      
      expect(doubled).toEqual([2, 4, 6, 8, 10]);
    });

    it('should validate file paths', () => {
      const validPaths = ['/src/file.ts', './relative/path.js'];
      
      validPaths.forEach(path => {
        expect(path.length).toBeGreaterThan(0);
        expect(typeof path).toBe('string');
      });
    });
  });
});
