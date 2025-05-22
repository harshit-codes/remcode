import * as fs from 'fs';
import * as path from 'path';
import { getLogger } from '../utils/logger';

const logger = getLogger('RemcodeConfigManager');

export interface RemcodeConfig {
  version: string;
  initialized: string;
  repository: {
    name: string;
    owner: string;
    url: string;
    defaultBranch: string;
  };
  processing: {
    lastCommit: string;
    lastUpdate: string;
    status: string;
  };
  vectorization: {
    provider: string;
    indexName: string;
    namespace: string;
    embeddingModel: string;
    embeddingDimension: number;
  };
  statistics: {
    filesProcessed: number;
    chunksCreated: number;
    vectorsStored: number;
  };
}

export class RemcodeConfigManager {
  private repoPath: string;

  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
  }

  async createInitialConfig(owner: string, repo: string): Promise<void> {
    logger.info('Creating initial .remcode configuration');
    
    const config: RemcodeConfig = this.buildInitialConfig(owner, repo);
    const configPath = path.join(this.repoPath, '.remcode');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    logger.info('Initial configuration created');
  }

  private buildInitialConfig(owner: string, repo: string): RemcodeConfig {
    return {
      version: '0.1.0',
      initialized: new Date().toISOString(),
      repository: {
        name: repo,
        owner,
        url: `https://github.com/${owner}/${repo}`,
        defaultBranch: 'main'
      },
      processing: {
        lastCommit: '',
        lastUpdate: '',
        status: 'pending'
      },
      vectorization: {
        provider: 'pinecone',
        indexName: `remcode-${repo}`,
        namespace: 'main',
        embeddingModel: 'microsoft/graphcodebert-base',
        embeddingDimension: 768
      },
      statistics: {
        filesProcessed: 0,
        chunksCreated: 0,
        vectorsStored: 0
      }
    };
  }
}
