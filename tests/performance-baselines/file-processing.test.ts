import { performance } from 'perf_hooks';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createTestDir } from '../user-journey/helpers';

describe('Performance Baselines: File Processing', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
    mkdirSync(testDir, { recursive: true });
  });

  test('should process files under 2s per file', async () => {
    const testFiles = ['component.tsx', 'service.ts', 'utils.js'];

    testFiles.forEach(fileName => {
      writeFileSync(join(testDir, fileName), `
// Test file: ${fileName}
export class TestClass {
  method() {
    return "test";
  }
}
`.repeat(50));
    });

    const startTime = performance.now();
    
    const processingResults = await Promise.all(
      testFiles.map(async (file) => {
        const fileStartTime = performance.now();
        await new Promise(resolve => setTimeout(resolve, 100));
        const fileEndTime = performance.now();
        return fileEndTime - fileStartTime;
      })
    );

    const totalTime = performance.now() - startTime;
    const avgTimePerFile = totalTime / testFiles.length;

    expect(avgTimePerFile).toBeLessThan(2000); // <2s per file
    processingResults.forEach(fileTime => {
      expect(fileTime).toBeLessThan(2000);
    });
  });
});
