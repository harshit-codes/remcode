# pipeline.ts

**File Path:** `processing/pipeline.ts`

## Overview

Main processing pipeline that orchestrates incremental code analysis and vectorization

## Dependencies

- `../utils/logger`
- `./change-detector`
- `./file-analyzer`
- `./incremental`
- `./state-manager`
- `./types`

## Classes

### `ProcessingPipeline`

**Class Definition:**

```typescript
export class ProcessingPipeline {
  private repoPath: string;
  private changeDetector: ChangeDetector;
  private fileAnalyzer: FileAnalyzer;
  private incrementalProcessor: IncrementalProcessor;
  private stateManager: StateManager;

  constructor(repoPath: string, options: IncrementalProcessorOptions) {
    this.repoPath = repoPath;
    this.changeDetector = new ChangeDetector(repoPath);
    this.fileAnalyzer = new FileAnalyzer(repoPath);
    this.incrementalProcessor = new IncrementalProcessor(options);
    this.stateManager = new StateManager(repoPath);
    
    logger.info(`Initialized ProcessingPipeline for repository: ${repoPath}`);
  }

  /**
   * Execute the full incremental processing pipeline
   */
  async processIncremental(fromCommit?: string): Promise<ProcessingStats> {
    logger.info('Starting incremental processing pipeline');
    
    try {
      // Step 1: Detect changes since last commit
      const currentCommit = this.changeDetector.getCurrentCommit();
      const lastCommit = fromCommit || await this.getLastProcessedCommit();
      
      logger.info(`Processing changes from ${lastCommit} to ${currentCommit}`);
      
      const changes = await this.changeDetector.getChangedFiles(lastCommit);
      logger.info(`Found ${changes.length} changed files`);
      
      if (changes.length === 0) {
        logger.info('No changes detected, skipping processing');
        return this.createEmptyStats();
      }

      // Step 2: Analyze changed files
      const analyses = await this.fileAnalyzer.analyzeChangedFiles(changes);
      logger.info(`Analyzed ${analyses.length} files`);

      // Step 3: Initialize incremental processor
      await this.incrementalProcessor.initialize();

      // Step 4: Process the changes
      const stats = await this.incrementalProcessor.processChangedFiles(changes, analyses);

      // Step 5: Update state with new commit
      await this.incrementalProcessor.updateProcessingState(currentCommit);

      logger.info(`Incremental processing completed successfully`);
      return stats;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Incremental processing failed: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Process all files in the repository (full processing)
   */
  async processAll(): Promise<ProcessingStats> {
    logger.info('Starting full repository processing');
    
    try {
      // Get all code files in the repository
      const allFiles = await this.findAllCodeFiles();
      logger.info(`Found ${allFiles.length} code files for full processing`);

      // Convert to FileChange format for compatibility
      const changes: FileChange[] = allFiles.map(filePath => ({
        path: filePath,
        status: 'added' as const,
        size: 0 // Will be filled by analyzer
      }));

      // Analyze all files
      const analyses = await this.fileAnalyzer.analyzeChangedFiles(changes);
      logger.info(`Analyzed ${analyses.length} files`);

      // Initialize processor
      await this.incrementalProcessor.initialize();

      // Process all files
      const stats = await this.incrementalProcessor.processChangedFiles(changes, analyses);

      // Update state
      const currentCommit = this.changeDetector.getCurrentCommit();
      await this.incrementalProcessor.updateProcessingState(currentCommit);

      logger.info(`Full processing completed successfully`);
      return stats;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Full processing failed: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Get status of the processing pipeline
   */
  async getStatus(): Promise<{
    isInitialized: boolean;
    lastCommit?: string;
    lastProcessed?: string;
    totalFiles?: number;
    totalVectors?: number;
  }> {
    try {
      const state = await this.stateManager.loadState();
      
      if (!state) {
        return { isInitialized: false };
      }

      return {
        isInitialized: true,
        lastCommit: state.processing?.lastCommit,
        lastProcessed: state.processing?.lastUpdated,
        totalFiles: state.vectorization?.chunks || 0,
        totalVectors: state.vectorization?.vectors || 0
      };
    } catch (error) {
      logger.error(`Error getting status: ${error instanceof Error ? error.message : String(error)}`);
      return { isInitialized: false };
    }
  }

  /**
   * Check if there are pending changes to process
   */
  async hasPendingChanges(): Promise<boolean> {
    try {
      const currentCommit = this.changeDetector.getCurrentCommit();
      const lastCommit = await this.getLastProcessedCommit();
      
      if (!lastCommit || lastCommit !== currentCommit) {
        return true;
      }

      return await this.changeDetector.hasChanges(lastCommit, currentCommit);
    } catch (error) {
      logger.error(`Error checking for pending changes: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Get the last processed commit from state
   */
  private async getLastProcessedCommit(): Promise<string> {
    try {
      const state = await this.stateManager.loadState();
      return state?.processing?.lastCommit || '';
    } catch (error) {
      logger.warn(`Could not load last processed commit: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }

  /**
   * Create empty stats for when no processing is needed
   */
  private createEmptyStats(): ProcessingStats {
    return {
      totalFiles: 0,
      addedFiles: 0,
      modifiedFiles: 0,
      deletedFiles: 0,
      totalChunks: 0,
      totalEmbeddings: 0,
      errorCount: 0,
      startTime: new Date(),
      endTime: new Date(),
      durationMs: 0
    };
  }

  /**
   * Find all code files in the repository
   */
  private async findAllCodeFiles(): Promise<string[]> {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.vue',
      '.py', '.rb', '.java', '.go', '.php', 
      '.rs', '.swift', '.cs', '.c', '.cpp',
      '.h', '.hpp', '.kt', '.scala'
    ];

    const allFiles: string[] = [];
    
    try {
      const { execSync } = require('child_process');
      const gitFiles = execSync('git ls-files', { 
        cwd: this.repoPath, 
        encoding: 'utf8' 
      }).split('\n').filter(Boolean);

      for (const file of gitFiles) {
        const ext = require('path').extname(file).toLowerCase();
        if (codeExtensions.includes(ext)) {
          allFiles.push(file);
        }
      }
    } catch (error) {
      logger.error(`Error finding code files: ${error instanceof Error ? error.message : String(error)}`);
    }

    return allFiles;
  }
}
```

**Methods:**

#### `processIncremental()`

Execute the full incremental processing pipeline

```typescript
processIncremental(fromCommit?: string): Promise<ProcessingStats> {
```

#### `processAll()`

Process all files in the repository (full processing)

```typescript
processAll(): Promise<ProcessingStats> {
```

#### `getStatus()`

Get status of the processing pipeline

```typescript
getStatus(): Promise<{
```

#### `hasPendingChanges()`

Check if there are pending changes to process

```typescript
hasPendingChanges(): Promise<boolean> {
```

#### `createEmptyStats()`

Create empty stats for when no processing is needed

```typescript
createEmptyStats(): ProcessingStats {
```

