import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessingPipeline } from '../processing/pipeline';
import { StateManager } from '../processing/state-manager';
import { loadConfig } from '../utils/config';
import { getLogger } from '../utils/logger';
import { IncrementalProcessorOptions } from '../processing/types';

const logger = getLogger('ProcessCommand');

interface ProcessOptions {
  type?: 'auto' | 'full' | 'incremental';
  config?: string;
  force?: boolean;
  dryRun?: boolean;
  timeout?: number;
  verbose?: boolean;
  reportPath?: string;
}

/**
 * processCommand function
 *
 * @description TODO: Add description
 * @param {any} program TODO: Add parameter description
 * @returns {Command): void} TODO: Add return description
 */
export function processCommand(program: Command): void {
  program
    .command('process')
    .description('Process repository for vectorization (used by GitHub Actions)')
    .option('-t, --type <type>', 'Processing type: auto, full, or incremental', 'auto')
    .option('-c, --config <path>', 'Path to .remcode config file')
    .option('-f, --force', 'Force full reprocessing even if incremental is possible')
    .option('-d, --dry-run', 'Show what would be processed without actually processing')
    .option('--timeout <seconds>', 'Maximum processing time in seconds', '3600')
    .option('-v, --verbose', 'Enable verbose output')
    .option('-r, --report <path>', 'Path to save processing report', './processing-report.json')
    .action(async (options: ProcessOptions) => {
      const spinner = ora('Initializing processing pipeline...').start();
      
      try {
        // Get current working directory (should be repository root in GitHub Actions)
        const repoPath = process.cwd();
        
        // Validate repository structure
        if (!fs.existsSync(path.join(repoPath, '.git'))) {
          throw new Error('Not a Git repository. Processing must run in a Git repository.');
        }

        // Load configuration
        const configPath = options.config || path.join(repoPath, '.remcode');
        let config: any = {};
        
        if (fs.existsSync(configPath)) {
          config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          logger.info(`Loaded configuration from ${configPath}`);
        } else {
          logger.warn('No .remcode config found, using environment variables and defaults');
        }

        // Get required environment variables
        const processingOptions = await buildProcessingOptions(config, options);
        
        if (options.dryRun) {
          spinner.stop();
          await showDryRun(repoPath, processingOptions, options);
          return;
        }

        // Initialize state manager
        const stateManager = new StateManager(repoPath);
        
        // Determine processing type
        const processingType = await determineProcessingType(
          options.type, 
          stateManager, 
          options.force
        );
        
        spinner.text = `Starting ${processingType} processing...`;
        logger.info(`Processing type determined: ${processingType}`);

        // Initialize processing pipeline
        const pipeline = new ProcessingPipeline(repoPath, processingOptions);
        
        const startTime = Date.now();
        let result;

        // Execute processing based on type
        if (processingType === 'full') {
          spinner.text = 'Processing all files in repository...';
          result = await pipeline.processAll();
        } else {
          spinner.text = 'Processing changed files incrementally...';
          result = await pipeline.processIncremental();
        }

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);

        spinner.stop();

        // Display results
        console.log(chalk.green('✅ Processing completed successfully!'));
        console.log(chalk.blue(`📊 Processing Type: ${processingType}`));
        console.log(chalk.blue(`📁 Total Files: ${result.totalFiles}`));
        console.log(chalk.blue(`➕ Added Files: ${result.addedFiles}`));
        console.log(chalk.blue(`✏️  Modified Files: ${result.modifiedFiles}`));
        console.log(chalk.blue(`🗑️  Deleted Files: ${result.deletedFiles}`));
        console.log(chalk.blue(`🧩 Total Chunks: ${result.totalChunks}`));
        console.log(chalk.blue(`🔢 Total Embeddings: ${result.totalEmbeddings}`));
        console.log(chalk.blue(`⏱️  Duration: ${duration}s`));
        
        if (result.errorCount > 0) {
          console.log(chalk.yellow(`⚠️  Errors: ${result.errorCount}`));
        }

        // Generate processing report
        await generateProcessingReport(result, options.reportPath, {
          type: processingType,
          repoPath,
          config: processingOptions,
          duration,
          timestamp: new Date().toISOString()
        });

        // Update state with successful processing
        await updateProcessingState(stateManager, result);

        // Set exit code for GitHub Actions
        process.exit(result.errorCount > 0 ? 1 : 0);

      } catch (error: any) {
        spinner.stop();
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`❌ Processing failed: ${errorMessage}`));
        logger.error(`Processing error: ${errorMessage}`, error);
        
        // Generate error report
        await generateErrorReport(error, options.reportPath, {
          repoPath: process.cwd(),
          timestamp: new Date().toISOString()
        });
        
        process.exit(1);
      }
    });
}

/**
 * buildProcessingOptions function
 *
 * @description TODO: Add description
 * @param {any} config TODO: Add parameter description
 * @param {any} options TODO: Add parameter description
 * @returns {any, options: ProcessOptions): Promise<IncrementalProcessorOptions>} TODO: Add return description
 */
async function buildProcessingOptions(config: any, options: ProcessOptions): Promise<IncrementalProcessorOptions> {
  // Get API keys from environment variables (required in GitHub Actions)
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const huggingfaceToken = process.env.HUGGINGFACE_TOKEN;
  
  if (!pineconeApiKey) {
    throw new Error('PINECONE_API_KEY environment variable is required');
  }
  
  if (!huggingfaceToken) {
    throw new Error('HUGGINGFACE_TOKEN environment variable is required');
  }

  // Build options with precedence: config file → env vars → defaults
  const processingOptions: IncrementalProcessorOptions = {
    repoPath: process.cwd(),
    pineconeApiKey,
    pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || config.vectorization?.pineconeEnvironment || 'gcp-starter',
    pineconeIndexName: process.env.PINECONE_INDEX_NAME || config.vectorization?.indexName || 
                      `remcode-${path.basename(process.cwd()).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
    pineconeNamespace: process.env.PINECONE_NAMESPACE || config.vectorization?.namespace || 'main',
    embeddingModel: process.env.EMBEDDING_MODEL || config.vectorization?.embeddingModel || 'microsoft/graphcodebert-base',
    batchSize: parseInt(process.env.BATCH_SIZE || config.vectorization?.batchSize || '10'),
    dryRun: options.dryRun || false,
    includeTests: process.env.INCLUDE_TESTS === 'true' || config.advanced?.includeTests !== false
  };

  logger.info('Processing options configured', { 
    indexName: processingOptions.pineconeIndexName,
    namespace: processingOptions.pineconeNamespace,
    model: processingOptions.embeddingModel,
    batchSize: processingOptions.batchSize
  });

  return processingOptions;
}

/**
 * determineProcessingType function
 *
 * @description TODO: Add description
 */
async function determineProcessingType(
  requestedType: string | undefined, 
  stateManager: StateManager, 
  force: boolean | undefined
): Promise<'full' | 'incremental'> {
  
  if (force) {
    return 'full';
  }

  if (requestedType === 'full') {
    return 'full';
  }

  if (requestedType === 'incremental') {
    return 'incremental';
  }

  // Auto-detection logic
  const stateExists = await stateManager.exists();
  
  if (!stateExists) {
    logger.info('No state file found, defaulting to full processing');
    return 'full';
  }

  const state = await stateManager.loadState();
  if (!state || !state.processing?.lastCommit) {
    logger.info('No previous commit found in state, defaulting to full processing');
    return 'full';
  }

  logger.info('State file found with previous commit, using incremental processing');
  return 'incremental';
}

/**
 * showDryRun function
 *
 * @description TODO: Add description
 * @param {any} repoPath TODO: Add parameter description
 * @param {any} options TODO: Add parameter description
 * @param {any} cmdOptions TODO: Add parameter description
 * @returns {string, options: IncrementalProcessorOptions, cmdOptions: ProcessOptions): Promise<void>} TODO: Add return description
 */
async function showDryRun(repoPath: string, options: IncrementalProcessorOptions, cmdOptions: ProcessOptions): Promise<void> {
  console.log(chalk.cyan('🔍 DRY RUN - Processing Preview'));
  console.log(chalk.blue(`📁 Repository: ${repoPath}`));
  console.log(chalk.blue(`🔧 Processing Type: ${cmdOptions.type}`));
  console.log(chalk.blue(`📊 Index Name: ${options.pineconeIndexName}`));
  console.log(chalk.blue(`🏷️  Namespace: ${options.pineconeNamespace}`));
  console.log(chalk.blue(`🤖 Embedding Model: ${options.embeddingModel}`));
  console.log(chalk.blue(`📦 Batch Size: ${options.batchSize}`));
  console.log(chalk.blue(`🧪 Include Tests: ${options.includeTests}`));
  console.log(chalk.cyan('\n✅ Configuration is valid. Run without --dry-run to execute processing.'));
}

/**
 * generateProcessingReport function
 *
 * @description TODO: Add description
 */
async function generateProcessingReport(
  result: any, 
  reportPath: string | undefined,
  metadata: any
): Promise<void> {
  const report = {
    success: true,
    metadata,
    results: result,
    generatedAt: new Date().toISOString()
  };

  const finalReportPath = reportPath || './processing-report.json';
  await fs.promises.writeFile(finalReportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(chalk.blue(`📄 Processing report saved to: ${finalReportPath}`));
}

/**
 * generateErrorReport function
 *
 * @description TODO: Add description
 */
async function generateErrorReport(
  error: any,
  reportPath: string | undefined,
  metadata: any
): Promise<void> {
  const report = {
    success: false,
    error: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    },
    metadata,
    generatedAt: new Date().toISOString()
  };

  const finalReportPath = reportPath || './processing-error-report.json';
  await fs.promises.writeFile(finalReportPath, JSON.stringify(report, null, 2), 'utf8');
  console.error(chalk.red(`📄 Error report saved to: ${finalReportPath}`));
}

/**
 * updateProcessingState function
 *
 * @description TODO: Add description
 * @param {any} stateManager TODO: Add parameter description
 * @param {any} result TODO: Add parameter description
 * @returns {StateManager, result: any): Promise<void>} TODO: Add return description
 */
async function updateProcessingState(stateManager: StateManager, result: any): Promise<void> {
  try {
    // TODO: Fix updateStatistics call
    // const stats: Record<string, any> = {
    //   filesProcessed: result.totalFiles || 0,
    //   chunksCreated: result.totalChunks || 0,
    //   vectorsStored: result.totalEmbeddings || 0,
    //   lastProcessingDuration: result.durationMs || 0
    // };
    // await stateManager.updateStatistics(stats as any);
    
    logger.info('Processing state update temporarily disabled');
  } catch (error: any) {
    logger.warn('Failed to update processing state', error);
  }
}
