/**
 * MCP Inspector Command
 * 
 * Command to start the MCP server with SSE support for interactive testing of all 27 MCP tools
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { getLogger } from '../utils/logger';

const logger = getLogger('Inspector-Command');

export function inspectorCommand(program: Command): void {
  program
    .command('inspector')
    .description('Start MCP Server with SSE support for interactive tool testing')
    .option('--no-browser', 'Don\'t automatically open browser')
    .option('--port <port>', 'MCP server port', '3008')
    .action(async (options) => {
      console.log(chalk.cyan('🧪 Starting MCP Server with SSE Support for Interactive Testing...\n'));
      
      console.log(chalk.yellow('📋 Available MCP Tools (27 total):'));
      console.log('   📁 Repository: setup-repository, get_repository_status, list_repositories');
      console.log('   🔍 Search: search, search_code, get_code_context');
      console.log('   ⚙️ Processing: trigger-reprocessing, get-processing-status, get-workflow-analytics');
      console.log('   🤖 SWE: default_prompt, get_scenarios, get_guidelines, get_contextual_guidance');
      console.log('   🐙 GitHub: github_get_repo, github_list_files, github_get_file, github_search_code');
      console.log('   🌲 Pinecone: pinecone_query, pinecone_list_indexes');
      console.log('   🤗 HuggingFace: huggingface_embed_code, huggingface_embed_query, huggingface_list_models');
      console.log('');
      
      try {
        const port = options.port || '3008';
        console.log(chalk.green(`🚀 Starting MCP Server on port ${port}...`));
        console.log(chalk.gray('   This starts both HTTP API and SSE endpoints'));
        console.log('');
        
        // Start the MCP server with SSE support
        const serverProcess = spawn('node', [
          'bin/remcode.js',
          'serve',
          '--port', port,
          '--skip-token-collection'
        ], {
          stdio: 'inherit',
          cwd: process.cwd()
        });

        // Give server time to start
        setTimeout(() => {
          console.log('');
          console.log(chalk.green('✅ MCP Server with SSE Support Running!'));
          console.log('');
          console.log(chalk.cyan('🔗 Available Endpoints:'));
          console.log(chalk.white(`   📊 Server Health: http://localhost:${port}/health`));
          console.log(chalk.white(`   📋 Tool Specification: http://localhost:${port}/mcp/spec`));
          console.log(chalk.white(`   🔌 SSE Connection: http://localhost:${port}/sse/connect`));
          console.log(chalk.white(`   🛠 SSE Tools List: http://localhost:${port}/sse/tools`));
          console.log(chalk.white(`   ⚡ SSE MCP Tools: http://localhost:${port}/sse/mcp`));
          console.log('');
          console.log(chalk.yellow('🧪 Testing Options:'));
          console.log(chalk.gray('   1. Direct HTTP API testing: Use curl or Postman'));
          console.log(chalk.gray('   2. SSE streaming: Connect to SSE endpoints for real-time events'));
          console.log(chalk.gray('   3. Web interface: Build custom frontend using SSE endpoints'));
          console.log('');
          console.log(chalk.cyan('📝 Example SSE Usage:'));
          console.log(chalk.gray('   curl -N http://localhost:' + port + '/sse/connect'));
          console.log(chalk.gray('   curl -N http://localhost:' + port + '/sse/tools'));
          console.log('');
          console.log(chalk.cyan('📝 Example Tool Execution:'));
          console.log(chalk.gray('   curl -X POST http://localhost:' + port + '/sse/mcp \\'));
          console.log(chalk.gray('     -H "Content-Type: application/json" \\'));
          console.log(chalk.gray('     -d \'{"tool": "huggingface_list_models", "parameters": {}}\''));
          console.log('');
          console.log(chalk.green('🎯 No STDIO Bridge Needed - Direct SSE Communication!'));
          console.log(chalk.yellow('Press Ctrl+C to stop the server'));
        }, 2000);

        // Handle process events
        serverProcess.on('error', (error) => {
          console.error(chalk.red('❌ Failed to start MCP Server:'), error.message);
          process.exit(1);
        });

        serverProcess.on('close', (code) => {
          if (code === 0) {
            console.log(chalk.green('\n✅ MCP Server stopped successfully'));
          } else {
            console.log(chalk.yellow(`\n⚠ MCP Server exited with code ${code}`));
          }
        });

        // Handle graceful shutdown
        process.on('SIGINT', () => {
          console.log(chalk.yellow('\n🛑 Shutting down MCP Server...'));
          serverProcess.kill('SIGINT');
        });

        process.on('SIGTERM', () => {
          serverProcess.kill('SIGTERM');
        });

      } catch (error) {
        console.error(chalk.red('❌ Error starting MCP Server:'), error instanceof Error ? error.message : String(error));
        console.log('');
        console.log(chalk.yellow('💡 Manual start option:'));
        console.log(chalk.gray('   node bin/remcode.js serve --port 3008'));
        console.log(chalk.gray('   Then connect to: http://localhost:3008/sse/connect'));
        process.exit(1);
      }
    });
}
