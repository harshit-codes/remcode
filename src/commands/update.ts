import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { loadConfig } from '../utils/config';
import { ChunkingManager } from '../vectorizers/chunkers/manager';
import { EmbeddingManager } from '../vectorizers/embedders/manager';
import { PineconeStorage } from '../vectorizers/storage/pinecone';
import { getLogger } from '../utils/logger';

const logger = getLogger('UpdateCommand');

interface RemcodeConfig {
  version: string;
  initialized?: string;
  repository?: {
    name: string;
    owner: string;
    url: string;
  };
  resources: {
    pinecone: {
      index: string;
      namespace?: string;
    };
    huggingface: {
      model: string;
      embedding_dimension: number;
    };
  };
  lastCommit: string;
  lastUpdate: string;
  branch?: string;
  stats: {
    filesProcessed: number;
    chunksCreated: number;
    vectorsStored: number;
  };
}

export function updateCommand(program: Command): void {
  program
    .command('update')
    .description('Update remcode vectorization based on recent changes')
    .option('--since-commit <commit>', 'Process changes since specific commit')
    .option('--index <n>', 'Pinecone index name (overrides .remcode config)')
    .option('--force', 'Force update even if no changes detected')
    .option('--dry-run', 'Show what would be updated without making changes')
    .option('-v, --verbose', 'Enable verbose output')
    .action(async (options) => {
      const spinner = ora('Initializing incremental update').start();      
      try {
        // Load configuration
        const config = loadConfig();
        
        // Load .remcode file
        const remcodePath = './.remcode';
        if (!fs.existsSync(remcodePath)) {
          spinner.fail('.remcode file not found');
          console.error(chalk.red('Error: .remcode file not found. Run initialization first or use GitHub Actions.'));
          process.exit(1);
        }

        let remcodeConfig: RemcodeConfig;
        try {
          remcodeConfig = JSON.parse(fs.readFileSync(remcodePath, 'utf8'));
        } catch (error) {
          spinner.fail('Invalid .remcode file');
          console.error(chalk.red('Error: Invalid .remcode file format'));
          process.exit(1);
        }

        // Validate required configuration
        if (!remcodeConfig.resources?.pinecone?.index) {
          spinner.fail('Invalid .remcode configuration');
          console.error(chalk.red('Error: Missing Pinecone index configuration in .remcode'));
          process.exit(1);
        }

        // Determine commit range
        const currentCommit = execSync('git rev-parse HEAD').toString().trim();
        const sinceCommit = options.sinceCommit || remcodeConfig.lastCommit;

        if (!sinceCommit) {
          spinner.fail('No baseline commit found');
          console.error(chalk.red('Error: No baseline commit found. Use --since-commit or ensure .remcode has lastCommit'));
          process.exit(1);
        }

        if (sinceCommit === currentCommit && !options.force) {
          spinner.succeed('No changes detected');
          console.log(chalk.green('✅ Codebase is up to date'));
          return;
        }

        // Get changed files
        spinner.text = 'Identifying changed files';
        let changedFilesOutput: string;
        
        try {
          changedFilesOutput = execSync(
            `git diff --name-status ${sinceCommit} ${currentCommit}`
          ).toString().trim();
        } catch (error) {
          spinner.fail('Failed to get file changes');
          console.error(chalk.red(`Error: Could not get changes since ${sinceCommit}`));
          console.error(chalk.red('Ensure the commit exists and is accessible'));
          process.exit(1);
        }

        console.log(chalk.green('✅ Incremental update completed successfully'));
        
      } catch (error) {
        spinner.fail('Update failed');
        logger.error(`Update failed: ${error instanceof Error ? error.message : String(error)}`);
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        process.exit(1);
      }
    });
}
