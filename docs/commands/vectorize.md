# vectorize.ts

**File Path:** `commands/vectorize.ts`

## Overview

No overview provided.

## Dependencies

- `commander`
- `../utils/source`
- `../utils/config`
- `../vectorizers/pipeline`
- `../utils/logger`

## Functions

### `vectorizeCommand()`

**Function Signature:**

```typescript
export function vectorizeCommand(program: Command): void {
```

**Full Function:**

```typescript
export function vectorizeCommand(program: Command): void {
  program
    .command('vectorize')
    .description('Vectorize a codebase using the new pipeline')
    .argument('<source>', 'Source codebase (GitHub URL or local path)')
    .option('-a, --analysis <path>', 'Path to analysis report', './codebase_analysis.json')
    .option('-o, --output <path>', 'Output path for vectorization report', './vectorization_report.md')
    .option('-c, --config <path>', 'Path to config file')
    .option('-p, --pinecone-key <key>', 'Pinecone API key')
    .option('-i, --index <name>', 'Pinecone index name')
    .option('-n, --namespace <name>', 'Pinecone namespace', 'default')
    .option('-e, --environment <env>', 'Pinecone environment', 'gcp-starter')
    .option('-m, --model <model>', 'Embedding model to use', 'microsoft/graphcodebert-base')
    .option('-f, --fallback <model>', 'Fallback embedding model', 'sentence-transformers/all-MiniLM-L6-v2')
    .option('-b, --batch-size <number>', 'Batch size for processing', '10')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--timeout <seconds>', 'Maximum time for vectorization in seconds', '7200')
    .option('--cache <path>', 'Path to cache directory', './.remcode-cache')
    .action(async (source, options) => {
      const spinner = ora('Initializing vectorization...').start();
      
      try {
        // Load configuration
        const config = loadConfig(options.config);
        
        // Resolve source path
        const resolvedSource = await resolveSource(source);
        const sourcePath = resolvedSource.localPath || source;
        
        if (!fs.existsSync(sourcePath)) {
          throw new Error(`Source path does not exist: ${sourcePath}`);
        }

        // Get API keys
        const pineconeApiKey = options.pineconeKey || 
                              process.env.PINECONE_API_KEY || 
                              config.vectorization?.storage?.pinecone?.apiKey;
        
        const huggingfaceToken = process.env.HUGGINGFACE_TOKEN || 
                                config.vectorization?.embedding?.token;

        if (!pineconeApiKey) {
          throw new Error('Pinecone API key is required. Use --pinecone-key option or set PINECONE_API_KEY environment variable.');
        }

        if (!huggingfaceToken) {
          throw new Error('HuggingFace token is required. Set HUGGINGFACE_TOKEN environment variable.');
        }

        // Determine index name
        const indexName = options.index || 
                         config.vectorization?.storage?.indexes?.moduleName || 
                         `remcode-${path.basename(sourcePath).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

        spinner.text = 'Setting up vectorization pipeline...';

        // Initialize vectorization pipeline
        const pipeline = new VectorizationPipeline({
          pineconeApiKey,
          pineconeIndexName: indexName,
          pineconeNamespace: options.namespace,
          pineconeEnvironment: options.environment,
          huggingfaceToken,
          embeddingModel: options.model,
          fallbackModel: options.fallback,
          batchSize: parseInt(options.batchSize),
          maxFileSize: 1024 * 1024, // 1MB
          includeExtensions: ['.ts', '.js', '.jsx', '.tsx', '.py', '.java', '.go', '.rb', '.php', '.cpp', '.c', '.cs', '.rs'],
          excludeExtensions: ['.min.js', '.bundle.js', '.test.js', '.spec.js', '.d.ts'],
          excludePaths: ['node_modules', '.git', 'dist', 'build', '__pycache__', '.pytest_cache', 'coverage']
        });

        await pipeline.initialize();

        spinner.text = 'Processing codebase...';
        
        // Process the directory
        const result = await pipeline.processDirectory(sourcePath);

        spinner.stop();

        // Display results
        if (result.success) {
          console.log(chalk.green('✅ Vectorization completed successfully!'));
          console.log(chalk.blue(`📁 Files processed: ${result.filesProcessed}`));
          console.log(chalk.blue(`🧩 Chunks created: ${result.chunksCreated}`));
          console.log(chalk.blue(`🔢 Vectors stored: ${result.vectorsStored}`));
          console.log(chalk.blue(`⏱️  Duration: ${Math.round(result.duration / 1000)}s`));
          
          if (result.errors.length > 0) {
            console.log(chalk.yellow(`⚠️  Warnings: ${result.errors.length} files had issues`));
            if (options.verbose) {
              result.errors.forEach(error => console.log(chalk.yellow(`   ${error}`)));
            }
          }
        } else {
          console.log(chalk.red('❌ Vectorization failed'));
          console.log(chalk.red(`📁 Files processed: ${result.filesProcessed}`));
          console.log(chalk.red(`❌ Errors: ${result.errors.length}`));
          result.errors.forEach(error => console.log(chalk.red(`   ${error}`)));
        }

        // Generate report
        await generateVectorizationReport(result, options.output, {
          source: sourcePath,
          indexName,
          namespace: options.namespace,
          model: options.model,
          batchSize: options.batchSize
        });

        // Test search functionality
        if (result.success && result.vectorsStored > 0) {
          console.log(chalk.blue('\n🔍 Testing search functionality...'));
          try {
            const searchResults = await pipeline.searchSimilarCode('function authentication', 3);
            console.log(chalk.green(`✅ Search test successful: found ${searchResults.length} results`));
          } catch (error) {
            console.log(chalk.yellow(`⚠️  Search test failed: ${error instanceof Error ? error.message : String(error)}`));
          }
        }

      } catch (error) {
        spinner.stop();
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`❌ Vectorization failed: ${errorMessage}`));
        logger.error(`Vectorization error: ${errorMessage}`);
        process.exit(1);
      }
    });
}
```

