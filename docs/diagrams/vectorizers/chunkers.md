# chunkers Entity Relationship Diagram

```mermaid
classDiagram
  class ExampleClass {
    value: string
    getValue(): string
    setValue(): void
  }
  class ChunkingManager {
    strategy: ChunkingStrategy
    languageMap: Record<string, SupportedTextSplitterLanguage | undefined>
    TypeScript()
    chunkFile(): Promise<CodeChunk[]>
    if()
    switch()
    catch()
    String()
    chunkByFunction(): Promise<CodeChunk[]>
    while()
    if()
    if()
    chunkByClass(): Promise<CodeChunk[]>
    while()
    if()
    if()
    chunkAsFile(): Promise<CodeChunk[]>
    chunkBySlidingWindow(): Promise<CodeChunk[]>
    if()
    TokenTextSplitter()
    Document()
    fallbackChunking(): CodeChunk[]
    for()
    if()
    determineChunkSize(): number
    if()
    if()
  }

  %% Inheritance relationships

  %% Usage relationships
  ExampleClass --> ChunkingManager: uses

  %% Style and notes
  note "Generated from folder: chunkers" as Note1

  %% File groupings
  note "manager.test.ts" as Note_manager.test
  note "manager.ts" as Note_manager
```
