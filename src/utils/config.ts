import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import * as dotenv from 'dotenv';
import { getLogger } from './logger';

const logger = getLogger('Config');

// Load environment variables
dotenv.config();

/**
 * Configuration interface with strong typing
 */
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

/**
 * Default configuration
 */
const defaultConfig: RemcodeConfig = {
  ignore: ['node_modules', 'dist', 'build', '.git', '*.min.js'],
  analysis: {
    depth: 2,
    quality: {
      enabled: true,
      complexityThreshold: 10
    },
    dependencies: {
      enabled: true,
      includeExternal: true
    }
  },
  vectorization: {
    chunking: {
      moduleLevelSize: 750,
      functionLevelSize: 150,
      overlapFactor: 0.2
    },
    embedding: {
      model: 'graphcodebert',
      fallbackModel: 'codebert',
      batchSize: 16
    },
    storage: {
      provider: 'pinecone',
      indexes: {
        moduleName: '{name}-module',
        functionName: '{name}-function'
      },
      pinecone: {
        environment: 'gcp-starter',
        namespace: 'default'
      }
    }
  },
  server: {
    port: 3000,
    host: 'localhost'
  }
};

/**
 * Load configuration from a file or use default configuration
 */
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

/**
 * Load configuration from environment variables
 */
function loadEnvironmentConfig(): Partial<RemcodeConfig> {
  const envConfig: Partial<RemcodeConfig> = {};

  // Process Pinecone-related environment variables
  if (process.env.REMCODE_PINECONE_API_KEY || 
      process.env.REMCODE_PINECONE_ENVIRONMENT || 
      process.env.REMCODE_PINECONE_NAMESPACE) {
    
    // Create a complete vectorization object to avoid TypeScript errors
    envConfig.vectorization = {
      chunking: {
        moduleLevelSize: 750,
        functionLevelSize: 150,
        overlapFactor: 0.2
      },
      embedding: {
        model: 'graphcodebert',
        fallbackModel: 'codebert',
        batchSize: 16
      },
      storage: {
        provider: 'pinecone',
        indexes: {
          moduleName: '{name}-module',
          functionName: '{name}-function'
        },
        pinecone: {}
      }
    };

    // Now we can safely assign to these properties
    if (process.env.REMCODE_PINECONE_API_KEY) {
      (envConfig.vectorization as RemcodeConfig['vectorization']).storage.pinecone = {
        ...(envConfig.vectorization as RemcodeConfig['vectorization']).storage.pinecone,
        apiKey: process.env.REMCODE_PINECONE_API_KEY
      };
    }
    
    if (process.env.REMCODE_PINECONE_ENVIRONMENT) {
      (envConfig.vectorization as RemcodeConfig['vectorization']).storage.pinecone = {
        ...(envConfig.vectorization as RemcodeConfig['vectorization']).storage.pinecone,
        environment: process.env.REMCODE_PINECONE_ENVIRONMENT
      };
    }
    
    if (process.env.REMCODE_PINECONE_NAMESPACE) {
      (envConfig.vectorization as RemcodeConfig['vectorization']).storage.pinecone = {
        ...(envConfig.vectorization as RemcodeConfig['vectorization']).storage.pinecone,
        namespace: process.env.REMCODE_PINECONE_NAMESPACE
      };
    }
  }
  
  // Process GitHub-related environment variables
  if (process.env.GITHUB_TOKEN || process.env.REMCODE_GITHUB_TOKEN) {
    envConfig.github = {
      token: process.env.GITHUB_TOKEN || process.env.REMCODE_GITHUB_TOKEN
    };
  }
  
  // Process server-related environment variables
  if (process.env.REMCODE_SERVER_PORT || process.env.REMCODE_SERVER_HOST) {
    envConfig.server = {
      port: process.env.REMCODE_SERVER_PORT ? parseInt(process.env.REMCODE_SERVER_PORT, 10) : 3000,
      host: process.env.REMCODE_SERVER_HOST || 'localhost'
    };
  }
  
  if (Object.keys(envConfig).length > 0) {
    logger.debug('Loaded configuration from environment variables');
  }
  
  return envConfig;
}

/**
 * Save configuration to a file
 */
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

/**
 * Get a specific configuration value by path
 * Example: getConfigValue(config, 'vectorization.storage.provider')
 */
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

/**
 * Validate configuration against schema
 */
export function validateConfig(config: RemcodeConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!config.vectorization) {
    errors.push('Missing vectorization configuration');
  } else {
    if (!config.vectorization.storage) {
      errors.push('Missing vectorization.storage configuration');
    } else if (!config.vectorization.storage.provider) {
      errors.push('Missing vectorization.storage.provider configuration');
    } else if (config.vectorization.storage.provider === 'pinecone') {
      if (!config.vectorization.storage.pinecone?.apiKey && !process.env.REMCODE_PINECONE_API_KEY && !process.env.PINECONE_API_KEY) {
        errors.push('Missing Pinecone API key. Set it in config or as REMCODE_PINECONE_API_KEY environment variable');
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Deep merge objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  if (!source) return target;
  if (typeof target !== 'object' || typeof source !== 'object') return source as T;
  
  const output = { ...target } as any;
  
  Object.keys(source).forEach(key => {
    const value = (source as any)[key];
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
        typeof output[key] === 'object' && output[key] !== null && !Array.isArray(output[key])) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = value;
    }
  });
  
  return output;
}
