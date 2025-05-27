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

/**
 * updateCommand function
 *
 * @description TODO: Add description
 * @param {any} program TODO: Add parameter description
 * @returns {Command): void} TODO: Add return description
 */
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

        if (!changedFilesOutput && !options.force) {
          spinner.succeed('No file changes detected');
          console.log(chalk.green('✅ Codebase is up to date'));
          return;
        }

        // Parse changed files by type (added, modified, deleted)
        const changedFiles = {
          added: [] as string[],
          modified: [] as string[],
          deleted: [] as string[]
        };

        changedFilesOutput.split('\n').forEach(line => {
          if (!line.trim()) return;
          
          const [status, filePath] = line.split(/\s+/);
          // Filter out non-code files or files we don't want to vectorize
          if (!filePath || filePath.includes('node_modules/') || 
              filePath.includes('.git/') ||
              /\.(md|json|lock|log|sqlite|env|config)$/.test(filePath)) {
            return;
          }

          // Categorize by change type
          if (status === 'A') changedFiles.added.push(filePath);
          else if (status === 'M') changedFiles.modified.push(filePath);
          else if (status === 'D') changedFiles.deleted.push(filePath);
        });

        const totalChanges = 
          changedFiles.added.length + 
          changedFiles.modified.length + 
          changedFiles.deleted.length;

        if (totalChanges === 0 && !options.force) {
          spinner.succeed('No relevant code changes detected');
          console.log(chalk.green('✅ Codebase is up to date'));
          return;
        }

        // Log changes if verbose or dry run
        if (options.verbose || options.dryRun) {
          logger.info(`Changes detected: ${totalChanges} files`);
          logger.info(`- Added: ${changedFiles.added.length} files`);
          logger.info(`- Modified: ${changedFiles.modified.length} files`);
          logger.info(`- Deleted: ${changedFiles.deleted.length} files`);
          
          if (options.verbose) {
            logger.info('Added files:', changedFiles.added);
            logger.info('Modified files:', changedFiles.modified);
            logger.info('Deleted files:', changedFiles.deleted);
          }
        }

        if (options.dryRun) {
          spinner.succeed('Dry run completed');
          console.log(chalk.blue('Changes that would be processed:'));
          console.log(chalk.green(`- ${changedFiles.added.length} files to add`));
          console.log(chalk.yellow(`- ${changedFiles.modified.length} files to update`));
          console.log(chalk.red(`- ${changedFiles.deleted.length} files to remove`));
          return;
        }

        // Initialize vector storage
        spinner.text = 'Connecting to vector database';
        const indexName = options.index || remcodeConfig.resources.pinecone.index;
        const pineconeKey = process.env.PINECONE_API_KEY;
        
        if (!pineconeKey) {
          spinner.fail('Pinecone API key not found');
          console.error(chalk.red('Error: PINECONE_API_KEY environment variable is required'));
          process.exit(1);
        }
        
        const storageManager = new PineconeStorage({
          apiKey: pineconeKey,
          indexName: indexName
        });
        
        try {
          await storageManager.initialize();
        } catch (error) {
          spinner.fail('Failed to connect to Pinecone');
          console.error(chalk.red(`Error: Could not connect to Pinecone index '${indexName}'`));
          console.error(chalk.red(error instanceof Error ? error.message : String(error)));
          process.exit(1);
        }
        
        // Initialize embedding and chunking components
        const embeddingModel = remcodeConfig.resources?.huggingface?.model || 'graphcodebert';
        const embeddingManager = new EmbeddingManager({
          primary: embeddingModel,
          fallback: 'codebert',
          batchSize: 16
        });
        
        const chunkingManager = new ChunkingManager({
          clean_modules: 'file_level',
          complex_modules: 'file_level',
          monolithic_files: 'sliding_window'
        });
        
        // Process all changes
        let processedFiles = 0;
        let totalFiles = totalChanges;
        let chunksProcessed = 0;
        let vectorsStored = 0;

        // Process deleted files first (remove from vector store)
        if (changedFiles.deleted.length > 0) {
          spinner.text = `Removing deleted files from vector store (0/${changedFiles.deleted.length})`;
          
          for (let i = 0; i < changedFiles.deleted.length; i++) {
            const filePath = changedFiles.deleted[i];
            spinner.text = `Removing deleted files from vector store (${i+1}/${changedFiles.deleted.length})`;
            
            try {
              // Delete vectors for this file
              await storageManager.deleteVectorsByMetadata({ filePath });
              processedFiles++;
            } catch (error) {
              logger.warn(`Failed to remove vectors for ${filePath}`, error instanceof Error ? error : undefined);
            }
          }
        }
        
        // Process added and modified files
        const filesToProcess = [...changedFiles.added, ...changedFiles.modified];
        
        if (filesToProcess.length > 0) {
          spinner.text = `Processing changed files (0/${filesToProcess.length})`;
          
          for (let i = 0; i < filesToProcess.length; i++) {
            const filePath = filesToProcess[i];
            spinner.text = `Processing changed files (${i+1}/${filesToProcess.length})`;
            
            try {
              // Read the file
              const content = fs.readFileSync(filePath, 'utf8');
              
              // For modified files, first remove old vectors
              if (changedFiles.modified.includes(filePath)) {
                await storageManager.deleteVectorsByMetadata({ filePath });
              }
              
              // Chunk the file
              const chunks = await chunkingManager.chunkFile(content, 'file_level', {
                file_path: filePath
              });
              
              // Generate embeddings
              const embeddings = await embeddingManager.embedChunks(chunks);
              
              // Validate embeddings
              const validEmbeddings = embeddings.filter(emb => 
                emb.embedding && Array.isArray(emb.embedding) && emb.embedding.length > 0
              );
              
              // Store in vector database
              if (validEmbeddings.length > 0) {
                await storageManager.storeVectors(validEmbeddings as any);
                
                chunksProcessed += validEmbeddings.length;
                vectorsStored += validEmbeddings.length;
              }
              
              processedFiles++;
            } catch (error) {
              logger.warn(`Failed to process ${filePath}`, error instanceof Error ? error : undefined);
            }
          }
        }
        
        // Update .remcode configuration with latest commit and stats
        remcodeConfig.lastCommit = currentCommit;
        remcodeConfig.lastUpdate = new Date().toISOString();
        remcodeConfig.stats.filesProcessed += processedFiles;
        remcodeConfig.stats.chunksCreated += chunksProcessed;
        remcodeConfig.stats.vectorsStored += vectorsStored;
        
        // Save updated config
        fs.writeFileSync('./.remcode', JSON.stringify(remcodeConfig, null, 2));
        
        // Generate summary
        spinner.succeed('Incremental update completed successfully');
        
        console.log(chalk.bold(chalk.blue('\nRemcode Update Summary')));
        console.log(chalk.bold('Changes processed:'));
        console.log(`  Added files: ${chalk.green(changedFiles.added.length)}`);
        console.log(`  Modified files: ${chalk.yellow(changedFiles.modified.length)}`);
        console.log(`  Deleted files: ${chalk.red(changedFiles.deleted.length)}`);
        console.log(chalk.bold('\nResults:'));
        console.log(`  Files processed: ${chalk.cyan(processedFiles)}`);
        console.log(`  Chunks created: ${chalk.cyan(chunksProcessed)}`);
        console.log(`  Vectors stored: ${chalk.cyan(vectorsStored)}`);
        console.log(`  Vector database: ${chalk.cyan(indexName)}`);
        console.log(`  Commit updated: ${chalk.cyan(currentCommit.substring(0, 8))}`);
        console.log(chalk.green('\n✅ Codebase vectors updated successfully'));

        
      } catch (error) {
        spinner.fail('Update failed');
        logger.error(`Update failed: ${error instanceof Error ? error.message : String(error)}`);
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        process.exit(1);
      }
    });
}
