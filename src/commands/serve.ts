/**
 * Enhanced MCP Server Command
 * 
 * Command to start the Model Context Protocol (MCP) server with smart token management
 * and automatic port selection for AI assistant integration
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { MCPServer } from '../mcp';
import { getLogger, configureLogger, LogLevel } from '../utils/logger';
import { PortManager } from '../utils/port-manager';

const logger = getLogger('MCP-Command');

export function serveCommand(program: Command): void {
  program
    .command('serve')
    .description('Start the MCP server for AI assistant integration')
    .option('-p, --port <port>', 'Port to listen on', '3000')
    .option('-h, --host <host>', 'Host to bind to', 'localhost')
    .option('--github-token <token>', 'GitHub Personal Access Token')
    .option('--pinecone-key <key>', 'Pinecone API key')
    .option('--huggingface-token <token>', 'HuggingFace API token')
    .option('--cors-origins <origins>', 'Allowed CORS origins (comma-separated)')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--skip-token-collection', 'Skip interactive token collection')
    .action(async (options) => {
      // Configure logger based on environment and CLI options
      let logLevel = LogLevel.INFO; // Default to INFO
      
      if (options.verbose) {
        logLevel = LogLevel.DEBUG;
      } else if (process.env.LOG_LEVEL) {
        // Support LOG_LEVEL environment variable
        const envLevel = process.env.LOG_LEVEL.toUpperCase();
        switch (envLevel) {
          case 'TRACE': logLevel = LogLevel.TRACE; break;
          case 'DEBUG': logLevel = LogLevel.DEBUG; break;
          case 'INFO': logLevel = LogLevel.INFO; break;
          case 'WARN': logLevel = LogLevel.WARN; break;
          case 'ERROR': logLevel = LogLevel.ERROR; break;
          case 'FATAL': logLevel = LogLevel.FATAL; break;
          case 'SILENT': logLevel = LogLevel.SILENT; break;
          default: 
            console.log(chalk.yellow(`⚠ Unknown LOG_LEVEL: ${process.env.LOG_LEVEL}, using INFO`));
            logLevel = LogLevel.INFO;
        }
      }
      
      // Configure the logger
      configureLogger({ 
        level: logLevel,
        colors: true,
        timestamp: true 
      });
      
      console.log(chalk.cyan('🚀 Starting Remcode MCP Server...\n'));
      console.log(chalk.gray(`🔧 Debug: Log level set to ${logLevel === LogLevel.DEBUG ? 'DEBUG' : logLevel === LogLevel.INFO ? 'INFO' : 'OTHER'}`));
      
      try {
        // Step 1: Smart Port Selection
        const preferredPort = parseInt(options.port);
        const selectedPort = await PortManager.getAvailablePort(preferredPort);
        
        // Step 2: MCP Token Management (Environment Variables Only)
        const mcpTokens = {
          GITHUB_TOKEN: process.env.GITHUB_TOKEN || options.githubToken || '',
          PINECONE_API_KEY: process.env.PINECONE_API_KEY || options.pineconeKey || '',
          HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN || options.huggingfaceToken || ''
        };
        
        // Display token status (without showing actual values for security)
        console.log(chalk.cyan('🔑 Token Status:'));
        console.log(chalk.green(`✓ GITHUB_TOKEN: ${mcpTokens.GITHUB_TOKEN ? 'Provided via MCP environment' : 'Not provided'}`));
        console.log(chalk.green(`✓ PINECONE_API_KEY: ${mcpTokens.PINECONE_API_KEY ? 'Provided via MCP environment' : 'Not provided'}`));
        console.log(chalk.green(`✓ HUGGINGFACE_TOKEN: ${mcpTokens.HUGGINGFACE_TOKEN ? 'Provided via MCP environment' : 'Not provided'}`));
        
        // Step 3: Validate Required Tokens (Graceful Degradation)
        const missingTokens = [];
        if (!mcpTokens.GITHUB_TOKEN || mcpTokens.GITHUB_TOKEN.trim() === '') missingTokens.push('GITHUB_TOKEN');
        if (!mcpTokens.PINECONE_API_KEY || mcpTokens.PINECONE_API_KEY.trim() === '') missingTokens.push('PINECONE_API_KEY');
        if (!mcpTokens.HUGGINGFACE_TOKEN || mcpTokens.HUGGINGFACE_TOKEN.trim() === '') missingTokens.push('HUGGINGFACE_TOKEN');
        
        if (missingTokens.length > 0) {
          console.log(chalk.yellow(`\n⚠️  Missing tokens: ${missingTokens.join(', ')}`));
          console.log(chalk.cyan('💡 Add tokens to your AI assistant MCP configuration:'));
          console.log(chalk.gray('   {'));
          console.log(chalk.gray('     "mcpServers": {'));
          console.log(chalk.gray('       "remcode": {'));
          console.log(chalk.gray('         "command": "npx",'));
          console.log(chalk.gray('         "args": ["remcode"],'));
          console.log(chalk.gray('         "env": {'));
          if (missingTokens.includes('PINECONE_API_KEY')) {
            console.log(chalk.yellow('           "PINECONE_API_KEY": "your_key_here",'));
          }
          if (missingTokens.includes('HUGGINGFACE_TOKEN')) {
            console.log(chalk.yellow('           "HUGGINGFACE_TOKEN": "your_token_here",'));
          }
          if (missingTokens.includes('GITHUB_TOKEN')) {
            console.log(chalk.yellow('           "GITHUB_TOKEN": "your_github_token"'));
          }
          console.log(chalk.gray('         }'));
          console.log(chalk.gray('       }'));
          console.log(chalk.gray('     }'));
          console.log(chalk.gray('   }'));
          console.log(chalk.cyan('\n📚 Get API keys:'));
          console.log(chalk.cyan('   • Pinecone: https://app.pinecone.io/organizations/-/projects/-/keys'));
          console.log(chalk.cyan('   • HuggingFace: https://huggingface.co/settings/tokens'));
          console.log(chalk.cyan('   • GitHub: https://github.com/settings/tokens/new?scopes=repo,workflow'));
          console.log(chalk.yellow('\n🚀 Server will start with partial functionality\n'));
        } else {
          console.log(chalk.green('\n✅ All tokens configured - full functionality available\n'));
        }
        
        // Step 4: Initialize MCP Server
        const spinner = ora('Initializing MCP server').start();
        
        const server = new MCPServer({
          port: selectedPort,
          host: options.host,
          corsOptions: {
            origin: options.corsOrigins?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000']
          }
        });

        // Step 5: Start the server with enhanced error handling
        try {
          await server.start(selectedPort, options.host);
          spinner.succeed(chalk.green(`✅ MCP server started successfully!`));
          
          // Display server information
          console.log('');
          console.log(chalk.cyan('📍 Server Information:'));
          console.log(`   🌐 URL: ${chalk.white(`http://${options.host}:${selectedPort}`)}`);
          console.log(`   🔗 Health Check: ${chalk.white(`http://${options.host}:${selectedPort}/health`)}`);
          console.log(`   📊 API Spec: ${chalk.white(`http://${options.host}:${selectedPort}/mcp/spec`)}`);
          console.log('');
          
          // Display token status
          console.log(chalk.cyan('🔑 Token Status:'));
          console.log(`   GitHub: ${mcpTokens.GITHUB_TOKEN && mcpTokens.GITHUB_TOKEN.trim() ? chalk.green('✓ Available') : chalk.red('✗ Missing')}`);
          console.log(`   Pinecone: ${mcpTokens.PINECONE_API_KEY && mcpTokens.PINECONE_API_KEY.trim() ? chalk.green('✓ Available') : chalk.red('✗ Missing')}`);
          console.log(`   HuggingFace: ${mcpTokens.HUGGINGFACE_TOKEN && mcpTokens.HUGGINGFACE_TOKEN.trim() ? chalk.green('✓ Available') : chalk.red('✗ Missing')}`);
          console.log('');
          
          // Display available tools
          console.log(chalk.cyan('🛠 Available MCP Tools:'));
          console.log('   📁 Repository: setup-repository, get_repository_status, list_repositories');
          console.log('   🔍 Search: search, search_code, get_code_context');
          console.log('   ⚙️ Processing: trigger-reprocessing, get-processing-status');
          console.log('   🤖 SWE: default_prompt, get_scenarios, get_guidelines');
          console.log('   🐙 GitHub: github_get_repo, github_list_files, github_get_file');
          console.log('   🌲 Pinecone: pinecone_query, pinecone_list_indexes');
          console.log('   🤗 HuggingFace: huggingface_embed_code, huggingface_embed_query');
          console.log('');
          
          console.log(chalk.magenta('🎯 Next Steps:'));
          console.log('   1. Configure your AI assistant to connect to this MCP server');
          console.log(`   2. Use server URL: http://${options.host}:${selectedPort}`);
          console.log('   3. Start asking questions about your codebase!');
          console.log('');
          console.log(chalk.gray('Press Ctrl+C to stop the server'));
          
        } catch (startError) {
          spinner.fail('Failed to start MCP server');
          if (startError instanceof Error && startError.message.includes('EADDRINUSE')) {
            console.error(chalk.red(`❌ Port ${selectedPort} is unexpectedly busy`));
            console.error(chalk.yellow(`💡 Try a different port: npx remcode serve --port ${selectedPort + 1}`));
          } else {
            console.error(chalk.red(`❌ Error: ${startError instanceof Error ? startError.message : String(startError)}`));
          }
          process.exit(1);
        }
        
        // Handle graceful shutdown
        const gracefulShutdown = () => {
          console.log(chalk.yellow('\n🛑 Shutting down MCP server...'));
          try {
            server.stop();
            console.log(chalk.green('✅ Server stopped successfully'));
            process.exit(0);
          } catch (error) {
            console.error(chalk.red('❌ Error during shutdown:', error));
            process.exit(1);
          }
        };

        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
        
      } catch (error) {
        console.error(chalk.red(`\n❌ Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`));
        
        // Provide helpful error messages
        if (error instanceof Error) {
          if (error.message.includes('ENOTFOUND')) {
            console.error(chalk.yellow('🌐 Network connectivity issue. Check your internet connection.'));
          } else if (error.message.includes('EACCES')) {
            console.error(chalk.yellow('🔒 Permission denied. Try running with appropriate permissions.'));
          } else if (error.message.includes('No available ports')) {
            console.error(chalk.yellow('🚪 Try specifying a different port range: --port 4000'));
          }
        }
        
        process.exit(1);
      }
    });
}
