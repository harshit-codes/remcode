import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

/**
 * Default configuration
 */
const defaultConfig = {
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
      }
    }
  }
};

/**
 * Load configuration from a file or use default configuration
 */
export function loadConfig(configPath?: string): any {
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
        break;
      }
    }
  }

  if (configPath && fs.existsSync(configPath)) {
    try {
      const ext = path.extname(configPath).toLowerCase();
      
      if (ext === '.json') {
        const content = fs.readFileSync(configPath, 'utf8');
        return { ...defaultConfig, ...JSON.parse(content) };
      } else if (ext === '.yml' || ext === '.yaml') {
        const content = fs.readFileSync(configPath, 'utf8');
        return { ...defaultConfig, ...yaml.parse(content) };
      } else if (ext === '.js') {
        // Note: This works for CommonJS modules, but not for ES modules
        const config = require(path.resolve(process.cwd(), configPath));
        return { ...defaultConfig, ...config };
      } else {
        console.warn(`Unsupported config file format: ${ext}`);
        return defaultConfig;
      }
    } catch (error) {
      console.warn(`Failed to load config file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return defaultConfig;
    }
  }

  return defaultConfig;
}

/**
 * Save configuration to a file
 */
export function saveConfig(config: any, configPath: string): void {
  try {
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
  } catch (error) {
    throw new Error(`Failed to save config file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
