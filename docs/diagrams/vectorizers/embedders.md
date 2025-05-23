# embedders Entity Relationship Diagram

```mermaid
classDiagram
  class EmbeddingManager {
    options: EmbeddingManagerOptions
    hfClient: HfInference | null = null
    if()
    HfInference()
    embedChunks(): Promise<CodeChunk[]>
    if()
    if()
    for()
    catch()
    String()
    if()
    Promise()
    catch()
    String()
    embedSingleChunk(): Promise<CodeChunk>
    embedSingleChunkWithFallback(): Promise<CodeChunk>
    if()
    catch()
    String()
    Array()
    getEmbeddingFromModel(): Promise<number[]>
    getEmbeddingViaDirectAPI(): Promise<number[]>
    for()
    if()
    if()
    catch()
    if()
    String()
    if()
    Error()
    Promise()
    Error()
    processEmbeddingResult(): number[]
    if()
    embeddings()
    if()
    if()
    if()
    Error()
    preprocessText(): string
    limits()
    if()
    getDimensionForModel(): number
    averageEmbeddings(): number[]
    if()
    Error()
    Array()
    for()
    for()
    for()
    generateRandomEmbeddings(): CodeChunk[]
    Array()
    getModelInfo(): ModelInfo
    getAvailableModels(): ModelInfo[]
  }

  %% Inheritance relationships

  %% Usage relationships

  %% Style and notes
  note "Generated from folder: embedders" as Note1
```
