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
    catch()
    String()
    embedSingleChunk(): Promise<CodeChunk>
    catch()
    String()
    embedWithModel(): Promise<CodeChunk[]>
    for()
    getEmbeddingFromModel(): Promise<number[]>
    if()
    if()
    if()
    if()
    if()
    Error()
    catch()
    String()
    if()
    if()
    if()
    Error()
    catch()
    String()
    averageEmbeddings(): number[]
    Array()
    for()
    for()
    for()
    generateRandomEmbeddings(): CodeChunk[]
    Array()
  }

  %% Inheritance relationships

  %% Usage relationships

  %% Style and notes
  note "Generated from folder: embedders" as Note1
```
