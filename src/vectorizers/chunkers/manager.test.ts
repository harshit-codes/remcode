import { ChunkingManager } from './manager';

// Set up basic test
const sampleStrategy = {
  clean_modules: 'function_level',
  complex_modules: 'sliding_window_with_overlap',
  monolithic_files: 'file_level'
};

// Sample TypeScript code for testing
const sampleTypeScriptCode = `
import { something } from 'somewhere';

/**
 * A simple example class
 */
export class ExampleClass {
  private value: string;
  
  constructor(value: string) {
    this.value = value;
  }
  
  /**
   * Gets the value
   */
  getValue(): string {
    return this.value;
  }
  
  /**
   * Sets the value
   */
  setValue(newValue: string): void {
    this.value = newValue;
  }
}

/**
 * A standalone function
 */
export function doSomething(input: string): string {
  return 'Modified: ' + input;
}
`;

// Main test function
async function runTests() {
  console.log('Running ChunkingManager tests...');
  
  const chunkingManager = new ChunkingManager(sampleStrategy);
  
  // Test function-level chunking
  console.log('\n--- Testing function-level chunking ---');
  const functionChunks = await chunkingManager.chunkFile(
    sampleTypeScriptCode,
    'function_level',
    { file_path: 'example.ts' }
  );
  console.log(`Found ${functionChunks.length} chunks`);
  functionChunks.forEach((chunk, index) => {
    console.log(`\nChunk #${index + 1}:`);
    console.log(`Type: ${chunk.metadata.chunk_type}`);
    if (chunk.metadata.function_name) {
      console.log(`Function: ${chunk.metadata.function_name}`);
    }
    console.log(`Lines: ${chunk.metadata.start_line}-${chunk.metadata.end_line}`);
    console.log(`Content length: ${chunk.content.length} chars`);
  });
  
  // Test class-level chunking
  console.log('\n--- Testing class-level chunking ---');
  const classChunks = await chunkingManager.chunkFile(
    sampleTypeScriptCode,
    'class_level',
    { file_path: 'example.ts' }
  );
  console.log(`Found ${classChunks.length} chunks`);
  classChunks.forEach((chunk, index) => {
    console.log(`\nChunk #${index + 1}:`);
    console.log(`Type: ${chunk.metadata.chunk_type}`);
    if (chunk.metadata.class_name) {
      console.log(`Class: ${chunk.metadata.class_name}`);
    }
    console.log(`Lines: ${chunk.metadata.start_line}-${chunk.metadata.end_line}`);
    console.log(`Content length: ${chunk.content.length} chars`);
  });
  
  // Test sliding window chunking
  console.log('\n--- Testing sliding window chunking ---');
  const slidingChunks = await chunkingManager.chunkFile(
    sampleTypeScriptCode,
    'sliding_window',
    { file_path: 'example.ts' }
  );
  console.log(`Found ${slidingChunks.length} chunks`);
  slidingChunks.forEach((chunk, index) => {
    console.log(`\nChunk #${index + 1}:`);
    console.log(`Type: ${chunk.metadata.chunk_type}`);
    console.log(`Strategy: ${chunk.metadata.strategy}`);
    console.log(`Lines: ${chunk.metadata.start_line}-${chunk.metadata.end_line}`);
    console.log(`Content length: ${chunk.content.length} chars`);
  });
  
  // Test file-level chunking
  console.log('\n--- Testing file-level chunking ---');
  const fileChunks = await chunkingManager.chunkFile(
    sampleTypeScriptCode,
    'file_level',
    { file_path: 'example.ts' }
  );
  console.log(`Found ${fileChunks.length} chunks`);
  fileChunks.forEach((chunk, index) => {
    console.log(`\nChunk #${index + 1}:`);
    console.log(`Type: ${chunk.metadata.chunk_type}`);
    console.log(`Strategy: ${chunk.metadata.strategy}`);
    console.log(`Lines: ${chunk.metadata.start_line}-${chunk.metadata.end_line}`);
    console.log(`Content length: ${chunk.content.length} chars`);
  });
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed:', error);
});
