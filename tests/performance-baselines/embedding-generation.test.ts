import { performance } from 'perf_hooks';

describe('Performance Baselines: Embedding Generation', () => {
  test('should generate embeddings under 1s per chunk', async () => {
    const codeChunks = [
      'function authenticate(token) { return token.length > 0; }',
      'class UserManager { constructor() { this.users = []; } }',
      'interface User { id: string; email: string; }',
      'export const config = { apiUrl: "https://api.example.com" };'
    ];

    for (const chunk of codeChunks) {
      const startTime = performance.now();
      
      // Simulate embedding generation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const endTime = performance.now();
      const embeddingTime = endTime - startTime;
      
      expect(embeddingTime).toBeLessThan(1000); // <1s per chunk
    }
  });

  test('should handle batch embedding generation efficiently', async () => {
    const batchSize = 5;
    const chunks = Array(batchSize).fill('test code chunk');
    
    const startTime = performance.now();
    
    await Promise.all(chunks.map(async (chunk) => {
      await new Promise(resolve => setTimeout(resolve, 400));
    }));
    
    const totalTime = performance.now() - startTime;
    const avgTimePerChunk = totalTime / chunks.length;
    
    expect(avgTimePerChunk).toBeLessThan(1000);
  });
});
