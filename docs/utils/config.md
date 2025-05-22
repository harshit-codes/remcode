# config.ts

**File Path:** `utils/config.ts`

## Overview

Configuration interface with strong typing

## Dependencies

- `./logger`

## Interfaces

### `RemcodeConfig`

**Interface Definition:**

```typescript
export interface RemcodeConfig {
  ignore: string[];
  analysis: {
    depth: number;
    quality: {
      enabled: boolean;
      complexityThreshold: number;
    };
    dependencies: {
      enabled: boolean;
      includeExternal: boolean;
    };
  };
  vectorization: {
    chunking: {
      moduleLevelSize: number;
      functionLevelSize: number;
      overlapFactor: number;
    };
    embedding: {
      model: string;
      fallbackModel: string;
      batchSize: number;
    };
    storage: {
      provider: 'pinecone' | 'local' | 'custom';
      indexes: {
        moduleName: string;
        functionName: string;
      };
      pinecone?: {
        apiKey?: string;
        environment?: string;
        namespace?: string;
      };
    };
  };
  github?: {
    token?: string;
    cacheDir?: string;
  };
  server?: {
    port: number;
    host: string;
  };
}
```

## Functions

### `loadConfig()`

**Function Signature:**

```typescript
export function loadConfig(configPath?: string): RemcodeConfig {
```

**Full Function:**

```typescript
export function loadConfig(configPath?: string): RemcodeConfig {
  logger.debug(`Loading configuration${configPath ? ` from ${configPath}` : ''}`);
  
  // Final config will combine: default config + file config + env vars
  let fileConfig: Partial<RemcodeConfig> = {};
  
  // Step 1: Find config file if not specified
  if (!configPath) {
    // Look for config files in the current directory
    const possibleConfigPaths = [
      '.remcode.yml',
      '.remcode.yaml',
      '.remcode.json',
      'remcode.config.js'
    ];

    for (const possiblePath of possibleConfigPaths) {
      if (fs.existsSync(possiblePath)) {
        configPath = possiblePath;
        logger.debug(`Found config file: ${possiblePath}`);
        break;
      }
    }
  }

  // Step 2: Load config from file if it exists
  if (configPath && fs.existsSync(configPath)) {
    try {
      const ext = path.extname(configPath).toLowerCase();
      
      if (ext === '.json') {
        const content = fs.readFileSync(configPath, 'utf8');
        fileConfig = JSON.parse(content);
        logger.debug('Loaded configuration from JSON file');
      } else if (ext === '.yml' || ext === '.yaml') {
        const content = fs.readFileSync(configPath, 'utf8');
        fileConfig = yaml.parse(content);
        logger.debug('Loaded configuration from YAML file');
      } else if (ext === '.js') {
        // Note: This works for CommonJS modules, but not for ES modules
        fileConfig = require(path.resolve(process.cwd(), configPath));
        logger.debug('Loaded configuration from JS file');
      } else {
        logger.warn(`Unsupported config file format: ${ext}`);
      }
    } catch (error) {
      logger.warn(`Failed to load config file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else if (configPath) {
    logger.warn(`Config file not found: ${configPath}`);
  } else {
    logger.info('No config file found, using default configuration');
  }
  
  // Step 3: Merge with environment variables
  const envConfig = loadEnvironmentConfig();
  
  // Step 4: Merge everything, with environment variables taking precedence
  const mergedConfig = deepMerge(defaultConfig, fileConfig);
  const finalConfig = deepMerge(mergedConfig, envConfig);
  
  logger.debug('Configuration loaded successfully');
  return finalConfig;
}
```

### `saveConfig()`

**Function Signature:**

```typescript
export function saveConfig(config: Partial<RemcodeConfig>, configPath: string): void {
```

**Full Function:**

```typescript
export function saveConfig(config: Partial<RemcodeConfig>, configPath: string): void {
  logger.debug(`Saving configuration to ${configPath}`);
  
  try {
    // Ensure directory exists
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const ext = path.extname(configPath).toLowerCase();
    let content: string;
    
    if (ext === '.json') {
      content = JSON.stringify(config, null, 2);
    } else if (ext === '.yml' || ext === '.yaml') {
      content = yaml.stringify(config);
    } else {
      throw new Error(`Unsupported config file format: ${ext}`);
    }
    
    fs.writeFileSync(configPath, content, 'utf8');
    logger.info(`Configuration saved to ${configPath}`);
  } catch (error) {
    const errorMessage = `Failed to save config file: ${error instanceof Error ? error.message : 'Unknown error'}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}
```

### `getConfigValue()`

**Function Signature:**

```typescript
export function getConfigValue<T>(config: RemcodeConfig, path: string, defaultValue?: T): T | undefined {
```

**Full Function:**

```typescript
export function getConfigValue<T>(config: RemcodeConfig, path: string, defaultValue?: T): T | undefined {
  const parts = path.split('.');
  let current: any = config;
  
  for (const part of parts) {
    if (current === undefined || current === null) {
      return defaultValue;
    }
    current = current[part];
  }
  
  return current !== undefined ? current : defaultValue;
}
```

### `validateConfig()`

**Function Signature:**

```typescript
export function validateConfig(config: RemcodeConfig): {
```

**Full Function:**

```typescript
export function validateConfig(config: RemcodeConfig): { valid: boolean; errors: string[] }
```

