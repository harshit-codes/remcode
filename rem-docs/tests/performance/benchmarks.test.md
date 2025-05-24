# benchmarks.test.ts

**File Path:** `tests/performance/benchmarks.test.ts`

## Overview

Performance Benchmarking Tests

These tests validate that core operations meet performance targets:
- File processing: <2s per file
- Search response: <500ms 
- Embedding generation: <1s per chunk
- Vector storage: <200ms per operation

## Dependencies

- `@jest/globals`
- `../../src/vectorizers/pipeline`
- `../../src/search/semantic`
- `../../src/vectorizers/chunkers/manager`
- `../../src/vectorizers/embedders/manager`
- `../../src/vectorizers/storage/pinecone`
- `perf_hooks`

## Functions

### `testFunction()`

```typescript
export function testFunction()
```

## Variables

- `pipeline`
- `search`
- `chunker`
- `embedder`
- `storage`
- `TEST_FILE_PATH`
- `PERFORMANCE_TARGETS`
- `startTime`
- `endTime`
- `duration`
- `testChunk`
- `data`
- `startTime`
- `endTime`
- `duration`
- `startTime`
- `endTime`
- `duration`
- `memUsage`
- `heapUsed`

