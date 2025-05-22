# serve.ts

**File Path:** `commands/serve.ts`

## Overview

MCP Server Command

Command to start the Model Context Protocol (MCP) server,
which allows AI assistants to interact with remcode

## Dependencies

- `commander`
- `../mcp`
- `../utils/logger`

## Functions

### `serveCommand()`

**Function Signature:**

```typescript
export function serveCommand(program: Command): void {
```

**Full Function:**

```typescript
export function serveCommand(program: Command): void {
  program
    .command('serve')
    .description('Start the MCP server for AI assistant integration')
    .option('-p, --port <port>', 'Port to listen on', '3000')
    .option('-h, --host <host>', 'Host to bind to', 'localhost')
    .option('--pinecone-key <key>', 'Pinecone API key')
    .option('--github-token <token>', 'GitHub token')
    .option('--huggingface-token <token>', 'HuggingFace API token')
    .option('--cors-origins <origins>', 'Allowed CORS origins (comma-separated)')
    .option('-v, --verbose', 'Enable verbose output')
    .action(async (options) => {
      const spinner = ora('Starting MCP server').start();
      
      try {
        // Initialize MCP server
        const server = new MCPServer({
          port: parseInt(options.port),
          host: options.host,
          pineconeApiKey: options.pineconeKey || process.env.PINECONE_API_KEY,
          githubToken: options.githubToken || process.env.GITHUB_TOKEN,
          huggingfaceToken: options.huggingfaceToken || process.env.HUGGINGFACE_TOKEN,
          corsOrigins: options.corsOrigins || process.env.MCP_CORS_ORIGINS
        });

        // Validate required tokens
        if (!server.options.githubToken) {
          spinner.fail('GitHub token is required');
          console.error(chalk.red('Error: GitHub token is required for MCP server operation'));
          console.error(chalk.yellow('Set GITHUB_TOKEN environment variable or use --github-token option'));
          process.exit(1);
        }

        if (!server.options.pineconeApiKey) {
          spinner.fail('Pinecone API key is required');
          console.error(chalk.red('Error: Pinecone API key is required for vector operations'));
          console.error(chalk.yellow('Set PINECONE_API_KEY environment variable or use --pinecone-key option'));
          process.exit(1);
        }

        if (!server.options.huggingfaceToken) {
          spinner.fail('HuggingFace token is required');
          console.error(chalk.red('Error: HuggingFace token is required for embedding generation'));
          console.error(chalk.yellow('Set HUGGINGFACE_TOKEN environment variable or use --huggingface-token option'));
          process.exit(1);
        }
        
        // Enable verbose logging if requested
        if (options.verbose) {
          logger.info('Verbose logging enabled');
        }
        
        logger.info(`Starting MCP server on http://${options.host}:${options.port}`);
        
        // Set up a timeout for server start
        const startTimeout = 30000; // 30 seconds
        const startTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Server failed to start within ${startTimeout/1000} seconds`)), startTimeout);
        });
        
        // Start the server with timeout
        spinner.text = 'Initializing MCP server and connecting to services';
        try {
          await Promise.race([server.start(), startTimeoutPromise]);
          logger.info('MCP server started successfully');
          spinner.succeed(chalk.green(`MCP server started on http://${options.host}:${options.port}`));
        } catch (startError) {
          throw new Error(`Failed to start MCP server: ${startError instanceof Error ? startError.message : String(startError)}`);
        }
        
        // Print tool information
        console.log('');
        console.log(chalk.cyan('Available MCP Tools:'));
        console.log('');
        console.log(chalk.yellow('Pinecone Tools:'));
        console.log('  • pinecone_query        - Search for vectors in Pinecone');
        console.log('  • pinecone_upsert       - Upload vectors to Pinecone');
        console.log('  • pinecone_delete       - Delete vectors from Pinecone');
        console.log('  • pinecone_list_indexes - List available Pinecone indexes');
        console.log('');
        console.log(chalk.yellow('GitHub Tools:'));
        console.log('  • github_get_repo       - Get repository metadata');
        console.log('  • github_list_files     - List files in a repository');
        console.log('  • github_get_file       - Get file contents');
        console.log('  • github_search_code    - Search code in repositories');
        console.log('');
        console.log(chalk.yellow('HuggingFace Tools:'));
        console.log('  • huggingface_embed_code  - Generate embeddings for code');
        console.log('  • huggingface_embed_query - Generate embeddings for queries');
        console.log('  • huggingface_list_models - List available embedding models');
        console.log('');
        console.log(chalk.cyan('Send MCP requests to:'));
        console.log(`  POST http://${options.host}:${options.port}/v1/mcp`);
        console.log('');
        console.log(chalk.cyan('Example Request:'));
        console.log(`  {
    "tool": "pinecone_query",
    "parameters": {
      "text": "function that handles authentication",
      "topK": 5
    }
  }`);
        console.log('');
        console.log(chalk.magenta('Press Ctrl+C to stop the server'));
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
          console.log(chalk.yellow('\nShutting down MCP server...'));
          server.stop();
          process.exit(0);
        });
      } catch (error) {
        spinner.fail('Failed to start MCP server');
        logger.error('Server startup failed with error', error);
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        
        if (error instanceof Error && error.stack && options.verbose) {
          console.error(chalk.gray(error.stack));
        }
        
        console.log(chalk.yellow('\nTroubleshooting tips:'));
        console.log(' - Check that the Pinecone API key is valid and has appropriate permissions');
        console.log(' - Ensure the GitHub token has the necessary scopes');
        console.log(' - Verify that the HuggingFace token is valid');
        console.log(' - Make sure the specified port is available and not in use');
        console.log(' - Run with --verbose for more detailed error information');
        
        process.exit(1);
      }
    });
}
```

