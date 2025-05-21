/**
 * MCP Server Command
 * 
 * Command to start the Model Context Protocol (MCP) server,
 * which allows AI assistants to interact with remcode
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { MCPServer } from '../mcp';
import { getLogger } from '../utils/logger';

const logger = getLogger('MCP-Command');

export function serveCommand(program: Command): void {
  program
    .command('serve')
    .description('Start the MCP server for AI assistant integration')
    .option('-p, --port <port>', 'Port to listen on', '3000')
    .option('-h, --host <host>', 'Host to bind to', 'localhost')
    .option('--pinecone-key <key>', 'Pinecone API key')
    .option('--pinecone-env <env>', 'Pinecone environment')
    .option('--github-token <token>', 'GitHub token')
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
          pineconeEnvironment: options.pineconeEnv || process.env.PINECONE_ENVIRONMENT,
          githubToken: options.githubToken || process.env.GITHUB_TOKEN,
          corsOrigins: options.corsOrigins || process.env.MCP_CORS_ORIGINS
        });
        
        // Start the server
        await server.start();
        
        spinner.succeed(chalk.green(`MCP server started on http://${options.host}:${options.port}`));
        
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
        logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });
}