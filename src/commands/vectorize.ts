import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { resolveSource } from '../utils/source';
import { loadConfig } from '../utils/config';
import { ChunkingManager } from '../vectorizers/chunkers/manager';
import { EmbeddingManager } from '../vectorizers/embedders/manager';
import { PineconeStorage } from '../vectorizers/storage/pinecone';
import { getLogger } from '../utils/logger';

const logger = getLogger('VectorizeCommand');

export function vectorizeCommand(program: Command): void {
  program
    .command('vectorize')
    .description('Vectorize a codebase')
    .argument('<source>', 'Source codebase (GitHub URL or local path)')
    .option('-a, --analysis <path>', 'Path to analysis report', './codebase_analysis.json')
    .option('-o, --output <path>', 'Output path for vectorization report', './vectorization_report.md')
    .option('-c, --config <path>', 'Path to config file')
    .option('-p, --pinecone-key <key>', 'Pinecone API key')
    .option('-i, --index <name>', 'Pinecone index name')
    .option('-m, --model <name>', 'Embedding model to use', 'graphcodebert')
    .option('-b, --batch-size <number>', 'Batch size for processing', '16')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--timeout <seconds>', 'Maximum time for vectorization in seconds', '7200')
    .option('--cache <path>', 'Path to cache directory', './.remcode-cache')
    .action(async (source, options) => {
      const spinner = ora('Preparing vectorization').start();
      
      try {
        // Enable verbose logging if requested
        if (options.verbose) {
          logger.info('Verbose logging enabled');
        }
        
        logger.info(`Starting vectorization of ${source}`);
        
        // Load configuration
        const config = loadConfig(options.config);
        logger.debug('Configuration loaded', config);
        
        // Load analysis file
        const analysisPath = path.resolve(process.cwd(), options.analysis);
        logger.info(`Loading analysis from ${analysisPath}`);
        
        if (!fs.existsSync(analysisPath)) {
          throw new Error(`Analysis file not found: ${analysisPath}. Run 'remcode analyze ${source}' first.`);
        }
        
        spinner.text = 'Loading analysis report';
        const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
        
        // Validate analysis file format
        if (!analysis.repository_info || !analysis.vectorization_recommendations) {
          throw new Error('Invalid analysis file format. The file does not contain required analysis data.');
        }
        
        // Resolve the source (GitHub or local)
        spinner.text = 'Resolving source repository';
        logger.info('Resolving source repository location');
        
        const resolvedSource = await resolveSource(source, {
          token: options.token || process.env.GITHUB_TOKEN,
          cache: options.cache
        });
        
        logger.info(`Source resolved to ${resolvedSource.path}`);
        
        
        // Initialize vectorization components
        const chunkingManager = new ChunkingManager(analysis.vectorization_recommendations.chunking_strategy);
        
        const embeddingManager = new EmbeddingManager({
          primary: options.model || analysis.vectorization_recommendations.embedding_models.primary,
          fallback: analysis.vectorization_recommendations.embedding_models.fallback,
          batchSize: parseInt(options.batchSize)
        });
        
        const pineconeKey = options.pineconeKey || process.env.PINECONE_API_KEY;
        
        if (!pineconeKey) {
          throw new Error('Pinecone API key is required');
        }
        
        const indexName = options.index || `remcode-${path.basename(resolvedSource.name)}`;
        
        const storageManager = new PineconeStorage({
          apiKey: pineconeKey,
          indexName: indexName
        });
        
        // Initialize indexes
        spinner.text = 'Initializing vector database';
        await storageManager.initialize();
        
        // Process files based on analysis
        const totalFiles = analysis.file_analysis.length;
        let processedFiles = 0;
        
        // Process priority files first
        const priorityFiles = new Set(analysis.vectorization_recommendations.priority_files);
        const problemFiles = analysis.vectorization_recommendations.problematic_files.map((f: any) => f.file_path);
        const problemFileSet = new Set(problemFiles);
        
        // Group files by processing strategy
        const filesByStrategy = {
          priority: analysis.file_analysis.filter((f: any) => priorityFiles.has(f.file_path)),
          problem: analysis.file_analysis.filter((f: any) => problemFileSet.has(f.file_path)),
          normal: analysis.file_analysis.filter((f: any) => !priorityFiles.has(f.file_path) && !problemFileSet.has(f.file_path))
        };
        
        // Process each group
        for (const [strategy, files] of Object.entries(filesByStrategy)) {
          for (const file of files as any[]) {
            spinner.text = `Vectorizing ${strategy} files: ${++processedFiles}/${totalFiles}`;
            
            // Get the appropriate chunking strategy
            const chunkingStrategy = strategy === 'problem' 
              ? analysis.vectorization_recommendations.problematic_files.find(
                  (p: any) => p.file_path === file.file_path
                ).handling_strategy 
              : file.recommended_chunking;
            
            // Read file content
            const filePath = path.join(resolvedSource.path, file.file_path);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Chunk the file
            const chunks = await chunkingManager.chunkFile(content, chunkingStrategy, file);
            
            // Generate embeddings
            logger.debug(`Generating embeddings for ${chunks.length} chunks from ${file.file_path}`);
            const embeddings = await embeddingManager.embedChunks(chunks);
            
            // Validate embeddings before storage
            const validEmbeddings = embeddings.filter(emb => 
              emb.embedding && Array.isArray(emb.embedding) && emb.embedding.length > 0
            );
            
            if (validEmbeddings.length !== chunks.length) {
              logger.warn(`Some chunks from ${file.file_path} could not be embedded properly`);
            }
            
            if (validEmbeddings.length > 0) {
              // Store valid embeddings in vector database
              logger.debug(`Storing ${validEmbeddings.length} embeddings from ${file.file_path}`);
              await storageManager.storeVectors(validEmbeddings as any);
            }
          }
        }
        
        // Generate report
        spinner.text = 'Generating vectorization report';
        // Create output directory if it doesn't exist
        const outputDir = path.dirname(options.output);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Generate a simple report for now
        const reportContent = `# Remcode Vectorization Report

## Summary
- Repository: ${resolvedSource.name}
- Total files processed: ${totalFiles}
- Embedding model: ${options.model}
- Vector database: Pinecone (${indexName})

## Details
- Priority files: ${analysis.vectorization_recommendations.priority_files.length}
- Problem files: ${analysis.vectorization_recommendations.problematic_files.length}
- Normal files: ${totalFiles - analysis.vectorization_recommendations.priority_files.length - analysis.vectorization_recommendations.problematic_files.length}

## Vectorization Strategy
- Clean modules: ${analysis.vectorization_recommendations.chunking_strategy.clean_modules}
- Complex modules: ${analysis.vectorization_recommendations.chunking_strategy.complex_modules}
- Monolithic files: ${analysis.vectorization_recommendations.chunking_strategy.monolithic_files}

## Next Steps
Your code is now vectorized and ready for semantic search. Use the following command to search:

\`\`\`
remcode search "your query here" --pinecone-key <key> --pinecone-env <env> --index ${indexName}
\`\`\`
`;
        
        fs.writeFileSync(options.output, reportContent);
        
        // Generate a summary for the console output
        const summary = `
${chalk.bold(chalk.blue('Remcode Vectorization Summary'))}

${chalk.bold('Repository:')} ${chalk.cyan(resolvedSource.name)}
${chalk.bold('Files Processed:')} ${chalk.cyan(totalFiles)}
${chalk.bold('Vector Database:')} ${chalk.cyan(`Pinecone (${indexName})`)}
${chalk.bold('Report Location:')} ${chalk.cyan(options.output)}
`;
        
        spinner.succeed(`Vectorization complete`);
        console.log(summary);
        
        // Show next steps
        console.log(chalk.green('\nNext steps:'));
        console.log(`  1. Run ${chalk.cyan(`remcode search "your query" --pinecone-key <key> --index ${indexName}`)} to search your codebase`);
        console.log(`  2. Or start the MCP server with ${chalk.cyan('remcode serve')} for AI assistant integration\n`);
        
        logger.info('Vectorization command completed successfully');
      } catch (error) {
        spinner.fail('Vectorization failed');
        logger.error('Vectorization failed with error', error);
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        
        if (error instanceof Error && error.stack && options.verbose) {
          console.error(chalk.gray(error.stack));
        }
        
        console.log(chalk.yellow('\nTroubleshooting tips:'));
        console.log(' - Ensure your analysis file is valid and was generated with the latest version');
        console.log(' - Check your Pinecone API key and permissions');
        console.log(' - Verify your network connection is stable');
        console.log(' - Try increasing the timeout with --timeout <seconds>');
        console.log(' - Run with --verbose for more detailed error information');
        
        process.exit(1);
      }
    });
}
