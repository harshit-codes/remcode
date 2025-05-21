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

export function vectorizeCommand(program: Command): void {
  program
    .command('vectorize')
    .description('Vectorize a codebase')
    .argument('<source>', 'Source codebase (GitHub URL or local path)')
    .option('-a, --analysis <path>', 'Path to analysis report', './codebase_analysis.json')
    .option('-o, --output <path>', 'Output path for vectorization report', './vectorization_report.md')
    .option('-c, --config <path>', 'Path to config file')
    .option('-p, --pinecone-key <key>', 'Pinecone API key')
    .option('-e, --pinecone-env <env>', 'Pinecone environment')
    .option('-i, --index <name>', 'Pinecone index name')
    .option('-m, --model <name>', 'Embedding model to use', 'graphcodebert')
    .option('-b, --batch-size <number>', 'Batch size for processing', '16')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--timeout <seconds>', 'Maximum time for vectorization in seconds', '7200')
    .option('--cache <path>', 'Path to cache directory', './.remcode-cache')
    .action(async (source, options) => {
      const spinner = ora('Preparing vectorization').start();
      
      try {
        // Load configuration and analysis
        const config = loadConfig(options.config);
        const analysisPath = path.resolve(process.cwd(), options.analysis);
        
        if (!fs.existsSync(analysisPath)) {
          throw new Error(`Analysis file not found: ${analysisPath}`);
        }
        
        const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
        
        // Resolve the source (GitHub or local)
        const resolvedSource = await resolveSource(source, {
          token: options.token || process.env.GITHUB_TOKEN,
          cache: options.cache
        });
        
        // Initialize vectorization components
        const chunkingManager = new ChunkingManager(analysis.vectorization_recommendations.chunking_strategy);
        
        const embeddingManager = new EmbeddingManager({
          primary: options.model || analysis.vectorization_recommendations.embedding_models.primary,
          fallback: analysis.vectorization_recommendations.embedding_models.fallback,
          batchSize: parseInt(options.batchSize)
        });
        
        const pineconeKey = options.pineconeKey || process.env.PINECONE_API_KEY;
        const pineconeEnv = options.pineconeEnv || process.env.PINECONE_ENVIRONMENT;
        
        if (!pineconeKey || !pineconeEnv) {
          throw new Error('Pinecone API key and environment are required');
        }
        
        const indexName = options.index || `remcode-${path.basename(resolvedSource.name)}`;
        
        const storageManager = new PineconeStorage({
          apiKey: pineconeKey,
          environment: pineconeEnv,
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
            const embeddings = await embeddingManager.embedChunks(chunks);
            
            // Store in vector database
            await storageManager.storeVectors(embeddings);
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
        
        spinner.succeed(`Vectorization complete. Report saved to ${options.output}`);
      } catch (error) {
        spinner.fail('Vectorization failed');
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        process.exit(1);
      }
    });
}
