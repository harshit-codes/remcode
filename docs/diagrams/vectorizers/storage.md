# storage Entity Relationship Diagram

```mermaid
classDiagram
  class PineconeStorage {
    options: PineconeStorageOptions
    initialized: boolean = false
    client: Pinecone | null = null
    index: any = null
    initialize(): Promise<void>
    if()
    Error()
    Pinecone()
    if()
    catch()
    String()
    Error()
    waitForIndexReady(): Promise<void>
    for()
    if()
    catch()
    String()
    Promise()
    Error()
    storeVectors(): Promise<void>
    if()
    Error()
    uuidv4()
    Pinecone()
    for()
    catch()
    String()
    Error()
    queryVectors(): Promise<any[]>
    if()
    Error()
    catch()
    String()
    Error()
    deleteVectors(): Promise<number>
    if()
    Error()
    if()
    if()
    for()
    if()
    Error()
    catch()
    String()
    Error()
    namespace()
    deleteVectorsByMetadata(): Promise<number>
    if()
    Error()
    if()
    Error()
    catch()
    String()
    Error()
    listIndexes(): Promise<any[]>
    if()
    Error()
    catch()
    String()
    Error()
    getIndexStats(): Promise<any>
    if()
    Error()
    catch()
    String()
    Error()
  }

  %% Inheritance relationships

  %% Usage relationships

  %% Style and notes
  note "Generated from folder: storage" as Note1
```
