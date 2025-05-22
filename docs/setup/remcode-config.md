# remcode-config.ts

**File Path:** `setup/remcode-config.ts`

## Overview

Available embedding models

## Dependencies

- `../utils/logger`

## Classes

### `RemcodeConfigManager`

**Class Definition:**

```typescript
export class RemcodeConfigManager {
  private repoPath: string;
  private configPath: string;
  private readonly currentVersion: string = '0.2.0';

  /**
   * Constructor
   * @param repoPath Path to the repository
   */
  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
    this.configPath = path.join(this.repoPath, '.remcode');
    logger.debug(`RemcodeConfigManager initialized for path: ${repoPath}`);
  }

  /**
   * Create initial configuration file
   * @param owner Repository owner
   * @param repo Repository name
   * @param options Additional configuration options
   * @returns The created configuration
   */
  async createInitialConfig(
    owner: string, 
    repo: string, 
    options: Partial<RemcodeConfig> = {}
  ): Promise<RemcodeConfig> {
    logger.info('Creating initial .remcode configuration');
    
    try {
      // Check if config already exists
      if (fs.existsSync(this.configPath)) {
        logger.warn('.remcode configuration already exists, updating instead');
        return this.updateConfig(options);
      }
      
      // Build initial configuration
      const config: RemcodeConfig = this.buildInitialConfig(owner, repo, options);
      
      // Validate configuration
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }
      
      // Write configuration to file
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      logger.info('Initial configuration created successfully');
      
      return config;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create initial configuration: ${errorMessage}`);
      throw new Error(`Failed to create .remcode configuration: ${errorMessage}`);
    }
  }

  /**
   * Read configuration from file
   * @returns The current configuration
   */
  readConfig(): RemcodeConfig {
    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error('Configuration file does not exist');
      }
      
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      const config = JSON.parse(configContent) as RemcodeConfig;
      
      return config;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to read configuration: ${errorMessage}`);
      throw new Error(`Failed to read .remcode configuration: ${errorMessage}`);
    }
  }

  /**
   * Update configuration with new values
   * @param updates Configuration updates
   * @returns The updated configuration
   */
  updateConfig(updates: Partial<RemcodeConfig> = {}): RemcodeConfig {
    try {
      // Read current configuration or create default if it doesn't exist
      let config: RemcodeConfig;
      
      try {
        config = this.readConfig();
      } catch (error) {
        // If config doesn't exist, create a default one
        logger.warn('Configuration file does not exist, creating default');
        const owner = updates.repository?.owner || 'unknown';
        const repo = updates.repository?.name || 'remcode-repo';
        config = this.buildInitialConfig(owner, repo, {});
      }
      
      // Apply updates using deep merge
      const updatedConfig = this.deepMerge(config, updates);
      
      // Update version and last modified
      updatedConfig.lastModified = new Date().toISOString();
      
      // Check if we need to upgrade the config format
      if (semver.lt(config.version, this.currentVersion)) {
        logger.info(`Upgrading config from ${config.version} to ${this.currentVersion}`);
        this.upgradeConfig(updatedConfig);
      }
      
      // Validate configuration
      const validation = this.validateConfig(updatedConfig);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }
      
      // Write updated configuration to file
      fs.writeFileSync(this.configPath, JSON.stringify(updatedConfig, null, 2));
      logger.info('Configuration updated successfully');
      
      return updatedConfig;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to update configuration: ${errorMessage}`);
      throw new Error(`Failed to update .remcode configuration: ${errorMessage}`);
    }
  }

  /**
   * Update processing status and statistics
   * @param status New processing status
   * @param stats Updated statistics
   * @param commit Last processed commit hash
   * @returns The updated configuration
   */
  updateProcessingStatus(
    status: ProcessingStatus,
    stats?: Partial<StatisticsConfig>,
    commit?: string
  ): RemcodeConfig {
    try {
      const config = this.readConfig();
      
      // Update processing information
      config.processing.status = status;
      config.processing.lastUpdate = new Date().toISOString();
      
      if (commit) {
        config.processing.lastCommit = commit;
      }
      
      // Update statistics if provided
      if (stats) {
        config.statistics = {
          ...config.statistics,
          ...stats,
          lastUpdated: new Date().toISOString()
        };
      }
      
      // Write updated configuration to file
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      logger.info(`Processing status updated to ${status}`);
      
      return config;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to update processing status: ${errorMessage}`);
      throw new Error(`Failed to update processing status: ${errorMessage}`);
    }
  }

  /**
   * Validate configuration
   * @param config Configuration to validate
   * @returns Validation result
   */
  validateConfig(config: RemcodeConfig): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields
    if (!config.version) errors.push('Missing version');
    if (!config.repository) errors.push('Missing repository configuration');
    if (!config.processing) errors.push('Missing processing configuration');
    if (!config.vectorization) errors.push('Missing vectorization configuration');
    if (!config.statistics) errors.push('Missing statistics configuration');
    
    // Repository validation
    if (config.repository) {
      if (!config.repository.name) errors.push('Missing repository name');
      if (!config.repository.owner) errors.push('Missing repository owner');
    }
    
    // Vectorization validation
    if (config.vectorization) {
      // Check if provider is valid
      const validProviders = Object.values(VectorProvider);
      if (!validProviders.includes(config.vectorization.provider as VectorProvider)) {
        errors.push(`Invalid vector provider: ${config.vectorization.provider}`);
      }
      
      // Check embedding model
      const validModels = Object.values(EmbeddingModel);
      if (!validModels.includes(config.vectorization.embeddingModel as EmbeddingModel)) {
        warnings.push(`Unknown embedding model: ${config.vectorization.embeddingModel}`);
      }
      
      // Check dimension
      if (config.vectorization.embeddingDimension <= 0) {
        errors.push('Embedding dimension must be a positive number');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Build initial configuration
   * @param owner Repository owner
   * @param repo Repository name
   * @param options Additional configuration options
   * @returns Initial configuration
   */
  private buildInitialConfig(
    owner: string, 
    repo: string, 
    options: Partial<RemcodeConfig>
  ): RemcodeConfig {
    const defaultBranch = options.repository?.defaultBranch || 'main';
    
    // Create base configuration
    const baseConfig: RemcodeConfig = {
      version: this.currentVersion,
      initialized: new Date().toISOString(),
      repository: {
        name: repo,
        owner,
        url: `https://github.com/${owner}/${repo}`,
        defaultBranch
      },
      processing: {
        lastCommit: '',
        lastUpdate: '',
        status: ProcessingStatus.PENDING
      },
      vectorization: {
        provider: VectorProvider.PINECONE,
        indexName: `remcode-${repo.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        namespace: 'main',
        embeddingModel: EmbeddingModel.GRAPHCODEBERT,
        embeddingDimension: 768,
        chunkSize: 1000,
        chunkOverlap: 200
      },
      statistics: {
        filesProcessed: 0,
        chunksCreated: 0,
        vectorsStored: 0,
        lastUpdated: new Date().toISOString()
      },
      advanced: {
        ignorePaths: [
          'node_modules/**',
          '.git/**',
          'dist/**',
          'build/**',
          '**/*.min.js',
          '**/*.map'
        ],
        includeExtensions: [
          '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php',
          '.html', '.css', '.md', '.json', '.yaml', '.yml'
        ],
        maxFileSize: 1000000, // 1MB
        useCache: true
      },
      lastModified: new Date().toISOString()
    };
    
    // Merge with provided options
    return this.deepMerge(baseConfig, options);
  }

  /**
   * Deep merge two objects
   * @param target Target object
   * @param source Source object
   * @returns Merged object
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        const sourceValue = source[key as keyof typeof source];
        if (sourceValue !== undefined) {
          if (isObject(sourceValue)) {
            if (!(key in target)) {
              output[key as keyof T] = sourceValue as any;
            } else {
              output[key as keyof T] = this.deepMerge(
                target[key as keyof T],
                sourceValue as any
              );
            }
          } else {
            output[key as keyof T] = sourceValue as any;
          }
        }
      });
    }
    
    return output;
  }

  /**
   * Upgrade configuration to the latest version
   * @param config Configuration to upgrade
   */
  private upgradeConfig(config: RemcodeConfig): void {
    // Store the original version for logging
    const originalVersion = config.version;
    
    // Upgrade from 0.1.0 to 0.2.0
    if (semver.satisfies(config.version, '0.1.0')) {
      // Add advanced section if it doesn't exist
      if (!config.advanced) {
        config.advanced = {
          ignorePaths: [
            'node_modules/**',
            '.git/**',
            'dist/**',
            'build/**',
            '**/*.min.js',
            '**/*.map'
          ],
          includeExtensions: [
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php',
            '.html', '.css', '.md', '.json', '.yaml', '.yml'
          ],
          maxFileSize: 1000000,
          useCache: true
        };
      }
      
      // Add new fields to vectorization
      if (!config.vectorization.chunkSize) {
        config.vectorization.chunkSize = 1000;
      }
      
      if (!config.vectorization.chunkOverlap) {
        config.vectorization.chunkOverlap = 200;
      }
      
      // Update version
      config.version = '0.2.0';
    }
    
    // Set to current version
    config.version = this.currentVersion;
    
    logger.info(`Configuration upgraded from ${originalVersion} to ${config.version}`);
  }

  /**
   * Check if configuration exists
   * @returns True if configuration exists
   */
  configExists(): boolean {
    return fs.existsSync(this.configPath);
  }

  /**
   * Delete configuration file
   * @returns True if configuration was deleted
   */
  deleteConfig(): boolean {
    try {
      if (this.configExists()) {
        fs.unlinkSync(this.configPath);
        logger.info('Configuration file deleted');
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to delete configuration: ${errorMessage}`);
      return false;
    }
  }
}
```

**Methods:**

#### `createInitialConfig()`

Create initial configuration file
@param owner Repository owner
@param repo Repository name
@param options Additional configuration options
@returns The created configuration

```typescript
createInitialConfig(
```

#### `buildInitialConfig()`

Build initial configuration
@param owner Repository owner
@param repo Repository name
@param options Additional configuration options
@returns Initial configuration

```typescript
buildInitialConfig(
```

#### `upgradeConfig()`

Upgrade configuration to the latest version
@param config Configuration to upgrade

```typescript
upgradeConfig(config: RemcodeConfig): void {
    // Store the original version for logging
```

## Interfaces

### `RepositoryConfig`

**Interface Definition:**

```typescript
export interface RepositoryConfig {
  name: string;
  owner: string;
  url: string;
  defaultBranch: string;
  visibility?: 'public' | 'private';
  description?: string;
}
```

### `ProcessingConfig`

**Interface Definition:**

```typescript
export interface ProcessingConfig {
  lastCommit: string;
  lastUpdate: string;
  status: ProcessingStatus;
  error?: string;
  lastProcessingDuration?: number;
}
```

### `VectorizationConfig`

**Interface Definition:**

```typescript
export interface VectorizationConfig {
  provider: VectorProvider;
  indexName: string;
  namespace: string;
  embeddingModel: EmbeddingModel;
  embeddingDimension: number;
  chunkSize?: number;
  chunkOverlap?: number;
  customEndpoint?: string;
}
```

### `StatisticsConfig`

**Interface Definition:**

```typescript
export interface StatisticsConfig {
  filesProcessed: number;
  chunksCreated: number;
  vectorsStored: number;
  lastUpdated?: string;
  totalTokens?: number;
  processingTime?: number;
}
```

### `AdvancedConfig`

**Interface Definition:**

```typescript
export interface AdvancedConfig {
  ignorePaths?: string[];
  includeExtensions?: string[];
  excludeExtensions?: string[];
  maxFileSize?: number;
  customPrompts?: Record<string, string>;
  useCache?: boolean;
  webhooks?: WebhookConfig[];
}
```

### `WebhookConfig`

**Interface Definition:**

```typescript
export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
}
```

### `RemcodeConfig`

**Interface Definition:**

```typescript
export interface RemcodeConfig {
  version: string;
  initialized: string;
  repository: RepositoryConfig;
  processing: ProcessingConfig;
  vectorization: VectorizationConfig;
  statistics: StatisticsConfig;
  advanced?: AdvancedConfig;
  lastModified?: string;
}
```

### `ConfigValidationResult`

**Interface Definition:**

```typescript
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

