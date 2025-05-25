/**
 * Enhanced MCP Server Command
 * 
 * Command to start the Model Context Protocol (MCP) server with smart token management
 * and automatic port selection for AI assistant integration
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { MCPServer } from '../mcp';
import { getLogger, configureLogger, LogLevel } from '../utils/logger';
import { TokenManager, TokenConfig } from '../utils/token-manager';
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
      // Load environment variables
      dotenv.config();
      
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
        
        // Step 2: Token Management
        const tokenManager = new TokenManager();
        const existingTokens = tokenManager.loadExistingTokens();
        const cliTokens = TokenManager.cliOptionsToTokens(options);
        
        let finalTokens: TokenConfig;
        
        if (options.skipTokenCollection) {
          // Use existing + CLI tokens without interactive collection
          finalTokens = { ...existingTokens };
          
          // Override with CLI tokens if provided
          if (cliTokens.GITHUB_TOKEN) {
            finalTokens.GITHUB_TOKEN = cliTokens.GITHUB_TOKEN;
            console.log(chalk.green(`✓ GITHUB_TOKEN: Provided via CLI argument`));
          } else if (existingTokens.GITHUB_TOKEN) {
            console.log(chalk.green(`✓ GITHUB_TOKEN: Found in .env file`));
          }
          
          if (cliTokens.PINECONE_API_KEY) {
            finalTokens.PINECONE_API_KEY = cliTokens.PINECONE_API_KEY;
            console.log(chalk.green(`✓ PINECONE_API_KEY: Provided via CLI argument`));
          } else if (existingTokens.PINECONE_API_KEY) {
            console.log(chalk.green(`✓ PINECONE_API_KEY: Found in .env file`));
          }
          
          if (cliTokens.HUGGINGFACE_TOKEN) {
            finalTokens.HUGGINGFACE_TOKEN = cliTokens.HUGGINGFACE_TOKEN;
            console.log(chalk.green(`✓ HUGGINGFACE_TOKEN: Provided via CLI argument`));
          } else if (existingTokens.HUGGINGFACE_TOKEN) {
            console.log(chalk.green(`✓ HUGGINGFACE_TOKEN: Found in .env file`));
          }
          
          console.log(chalk.yellow('⚠ Skipping interactive token collection'));
        } else {
          // Interactive token collection for missing tokens
          finalTokens = await tokenManager.collectMissingTokens(existingTokens, cliTokens);
        }
        
        // Save tokens to .env if any were collected
        const hasNewTokens = Object.keys(finalTokens).some(key => 
          finalTokens[key] && finalTokens[key] !== existingTokens[key]
        );
        
        if (hasNewTokens) {
          await tokenManager.saveTokensToEnv(finalTokens);
        }
        
        // Step 3: Validate Required Tokens
        const missingCriticalTokens = [];
        if (!finalTokens.GITHUB_TOKEN || finalTokens.GITHUB_TOKEN.trim() === '') missingCriticalTokens.push('GITHUB_TOKEN');
        if (!finalTokens.PINECONE_API_KEY || finalTokens.PINECONE_API_KEY.trim() === '') missingCriticalTokens.push('PINECONE_API_KEY');
        if (!finalTokens.HUGGINGFACE_TOKEN || finalTokens.HUGGINGFACE_TOKEN.trim() === '') missingCriticalTokens.push('HUGGINGFACE_TOKEN');
        
        if (missingCriticalTokens.length > 0) {
          console.log(chalk.red(`\n❌ Missing critical tokens: ${missingCriticalTokens.join(', ')}`));
          console.log(chalk.yellow('💡 MCP server will start with limited functionality'));
          console.log(chalk.gray('   Run again without --skip-token-collection to add missing tokens\n'));
        }
        
        // Step 4: Initialize MCP Server
        const spinner = ora('Initializing MCP server').start();
        
        const server = new MCPServer({
          port: selectedPort,
          host: options.host,
          pineconeApiKey: finalTokens.PINECONE_API_KEY || process.env.PINECONE_API_KEY,
          githubToken: finalTokens.GITHUB_TOKEN || process.env.GITHUB_TOKEN,
          huggingfaceToken: finalTokens.HUGGINGFACE_TOKEN || process.env.HUGGINGFACE_TOKEN,
          corsOrigins: options.corsOrigins || process.env.MCP_CORS_ORIGINS
        });

        // Step 5: Start the server with enhanced error handling
        try {
          await server.start();
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
          console.log(`   GitHub: ${finalTokens.GITHUB_TOKEN && finalTokens.GITHUB_TOKEN.trim() ? chalk.green('✓ Available') : chalk.red('✗ Missing')}`);
          console.log(`   Pinecone: ${finalTokens.PINECONE_API_KEY && finalTokens.PINECONE_API_KEY.trim() ? chalk.green('✓ Available') : chalk.red('✗ Missing')}`);
          console.log(`   HuggingFace: ${finalTokens.HUGGINGFACE_TOKEN && finalTokens.HUGGINGFACE_TOKEN.trim() ? chalk.green('✓ Available') : chalk.red('✗ Missing')}`);
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
