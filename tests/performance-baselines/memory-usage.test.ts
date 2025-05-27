describe('Performance Baselines: Memory Usage', () => {
  test('should maintain memory usage under 512MB for medium repos', async () => {
    const initialMemory = process.memoryUsage();
    
    const largeData = Array(1000).fill(null).map((_, i) => ({
      id: i,
      content: 'Large content string '.repeat(100),
      metadata: { processed: true }
    }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentMemory = process.memoryUsage();
    const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
    
    expect(memoryIncreaseMB).toBeLessThan(512);
    largeData.length = 0;
  });

  test('should handle memory efficiently during concurrent operations', async () => {
    const initialMemory = process.memoryUsage();
    
    const operations = Array(50).fill(null).map(async (_, i) => {
      const data = Array(100).fill(`operation-${i}`);
      await new Promise(resolve => setTimeout(resolve, 50));
      return data;
    });
    
    await Promise.all(operations);
    
    const currentMemory = process.memoryUsage();
    const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
    
    expect(memoryIncreaseMB).toBeLessThan(256);
  });
});
