/**
 * MCP Inspector Command
 * 
 * Command to start the MCP Inspector for interactive testing of all 27 MCP tools
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { getLogger } from '../utils/logger';

const logger = getLogger('Inspector-Command');

export function inspectorCommand(program: Command): void {
  program
    .command('inspector')
    .description('Start MCP Inspector for interactive tool testing')
    .option('--no-browser', 'Don\'t automatically open browser')
    .option('--port <port>', 'Inspector port (auto-selected if not specified)')
    .action(async (options) => {
      console.log(chalk.cyan('🧪 Starting MCP Inspector for Interactive Testing...\n'));
      
      console.log(chalk.yellow('📋 What you can test:'));
      console.log('   📁 Repository: setup-repository, get_repository_status, list_repositories');
      console.log('   🔍 Search: search, search_code, get_code_context');
      console.log('   ⚙️ Processing: trigger-reprocessing, get-processing-status');
      console.log('   🤖 SWE: default_prompt, get_scenarios, get_guidelines');
      console.log('   🐙 GitHub: github_get_repo, github_list_files, github_get_file');
      console.log('   🌲 Pinecone: pinecone_query, pinecone_list_indexes');
      console.log('   🤗 HuggingFace: huggingface_embed_code, huggingface_embed_query');
      console.log('');
      
      try {
        console.log(chalk.green('🚀 Launching MCP Inspector...'));
        console.log(chalk.gray('   This will start the STDIO bridge and MCP Inspector'));
        console.log('');
        
        // Start the MCP Inspector with the STDIO bridge
        const inspectorProcess = spawn('npx', [
          '@modelcontextprotocol/inspector',
          'node',
          'bin/remcode-stdio.js'
        ], {
          stdio: 'inherit',
          cwd: process.cwd()
        });

        // Handle process events
        inspectorProcess.on('error', (error) => {
          console.error(chalk.red('❌ Failed to start MCP Inspector:'), error.message);
          process.exit(1);
        });

        inspectorProcess.on('close', (code) => {
          if (code === 0) {
            console.log(chalk.green('✅ MCP Inspector closed successfully'));
          } else {
            console.log(chalk.yellow(`⚠ MCP Inspector exited with code ${code}`));
          }
        });

        // Handle graceful shutdown
        process.on('SIGINT', () => {
          console.log(chalk.yellow('\n🛑 Shutting down MCP Inspector...'));
          inspectorProcess.kill('SIGINT');
        });

        process.on('SIGTERM', () => {
          inspectorProcess.kill('SIGTERM');
        });

      } catch (error) {
        console.error(chalk.red('❌ Error starting MCP Inspector:'), error instanceof Error ? error.message : String(error));
        console.log('');
        console.log(chalk.yellow('💡 Manual start option:'));
        console.log(chalk.gray('   npx @modelcontextprotocol/inspector node bin/remcode-stdio.js'));
        console.log(chalk.gray('   Then open: http://127.0.0.1:6274'));
        process.exit(1);
      }
    });
}
