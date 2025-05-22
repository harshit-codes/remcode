import { getLogger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

const logger = getLogger('StateManager');

export interface RemcodeState {
  version: string;
  created: string;
  updated: string;
  repository?: {
    url?: string;
    path?: string;
    branch?: string;
    commit?: string;
  };
  processing: {
    status: 'idle' | 'analyzing' | 'vectorizing' | 'updating' | 'completed' | 'failed';
    lastCommit?: string;
    lastUpdated?: string;
    stats?: any;
  };
  vectorization: {
    model?: string;
    chunks?: number;
    vectors?: number;
    lastUpdated?: string;
    pineconeIndex?: string;
    pineconeNamespace?: string;
  };
  configuration: {
    includeTests?: boolean;
    includeComments?: boolean;
    chunkStrategy?: string;
    [key: string]: any;
  };
}

export class StateManager {
  private configPath: string;
  private filePath: string;

  constructor(repoPath: string = process.cwd()) {
    this.configPath = path.resolve(repoPath);
    this.filePath = path.join(this.configPath, '.remcode');
    logger.debug(`StateManager initialized with path: ${this.filePath}`);
  }

  /**
   * Check if the .remcode file exists
   */
  async exists(): Promise<boolean> {
    try {
      return fs.existsSync(this.filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Load the current state from the .remcode file
   */
  async loadState(): Promise<RemcodeState | null> {
    logger.info('Loading processing state');
    
    try {
      if (!fs.existsSync(this.filePath)) {
        logger.warn('No .remcode file found');
        return null;
      }
      
      const content = fs.readFileSync(this.filePath, 'utf8');
      const state = JSON.parse(content) as RemcodeState;
      
      logger.info('Successfully loaded state from .remcode file');
      return state;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to load state: ${errorMsg}`);
      return null;
    }
  }

  /**
   * Create initial state file if it doesn't exist
   */
  async initializeState(initialState?: Partial<RemcodeState>): Promise<RemcodeState> {
    logger.info('Initializing new .remcode state');
    
    const now = new Date().toISOString();
    const defaultState: RemcodeState = {
      version: '1.0.0',
      created: now,
      updated: now,
      repository: {},
      processing: {
        status: 'idle'
      },
      vectorization: {},
      configuration: {
        includeTests: false,
        includeComments: true,
        chunkStrategy: 'hybrid'
      },
      ...initialState
    };
    
    await this.saveState(defaultState);
    logger.info('Successfully initialized .remcode state');
    
    return defaultState;
  }

  /**
   * Save state to .remcode file
   */
  private async saveState(state: RemcodeState): Promise<void> {
    try {
      // Ensure the config directory exists
      if (!fs.existsSync(path.dirname(this.filePath))) {
        fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      }
      
      // Update the 'updated' timestamp
      state.updated = new Date().toISOString();
      
      // Write to file with pretty formatting
      fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2), 'utf8');
      logger.debug('Successfully saved state to .remcode file');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to save state: ${errorMsg}`);
      throw new Error(`Failed to save state: ${errorMsg}`);
    }
  }

  /**
   * Update the state with new values
   */
  async updateState(updates: Partial<RemcodeState>): Promise<RemcodeState> {
    logger.info('Updating processing state');
    
    try {
      // Load current state or initialize if not exists
      let state = await this.loadState();
      if (!state) {
        state = await this.initializeState();
      }
      
      // Deep merge updates with current state
      const updatedState = this.deepMerge(state, updates);
      
      // Save updated state
      await this.saveState(updatedState);
      logger.info('Successfully updated state');
      
      return updatedState;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to update state: ${errorMsg}`);
      throw new Error(`Failed to update state: ${errorMsg}`);
    }
  }

  /**
   * Update processing status in the state
   */
  async updateProcessingStatus(status: RemcodeState['processing']['status'], lastCommit?: string): Promise<void> {
    logger.info(`Updating processing status: ${status}`);
    
    const updates: Partial<RemcodeState> = {
      processing: {
        status,
        lastUpdated: new Date().toISOString()
      }
    };
    
    if (lastCommit && updates.processing) {
      updates.processing.lastCommit = lastCommit;
    }
    
    await this.updateState(updates);
  }

  /**
   * Update processing statistics
   */
  async updateStatistics(stats: any): Promise<void> {
    logger.info('Updating processing statistics');
    
    // Load current state to preserve required fields
    const currentState = await this.loadState() || await this.initializeState();
    const currentStatus = currentState.processing.status;
    
    const updates: Partial<RemcodeState> = {
      processing: {
        status: currentStatus, // Keep the existing status
        stats,
        lastUpdated: new Date().toISOString()
      }
    };
    
    await this.updateState(updates);
  }

  /**
   * Update vectorization info
   */
  async updateVectorizationInfo(info: Partial<RemcodeState['vectorization']>): Promise<void> {
    logger.info('Updating vectorization information');
    
    const updates: Partial<RemcodeState> = {
      vectorization: {
        ...info,
        lastUpdated: new Date().toISOString()
      }
    };
    
    await this.updateState(updates);
  }

  /**
   * Update repository information
   */
  async updateRepositoryInfo(info: Partial<RemcodeState['repository']>): Promise<void> {
    logger.info('Updating repository information');
    
    const updates: Partial<RemcodeState> = {
      repository: info
    };
    
    await this.updateState(updates);
  }

  /**
   * Update configuration
   */
  async updateConfiguration(config: Partial<RemcodeState['configuration']>): Promise<void> {
    logger.info('Updating configuration');
    
    const updates: Partial<RemcodeState> = {
      configuration: config
    };
    
    await this.updateState(updates);
  }

  /**
   * Helper method to deep merge objects
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    if (!source) return target;
    
    const output = { ...target } as T;
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        const sourceValue = source[key as keyof typeof source];
        const k = key as keyof T;
        
        if (this.isObject(sourceValue)) {
          if (!(key in target)) {
            output[k] = sourceValue as any;
          } else {
            output[k] = this.deepMerge(
              target[k] as Record<string, any>,
              sourceValue as Record<string, any>
            ) as any;
          }
        } else {
          output[k] = sourceValue as any;
        }
      });
    }
    
    return output;
  }

  /**
   * Helper method to check if value is an object
   */
  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}
