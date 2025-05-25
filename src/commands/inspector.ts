/**
 * MCP Inspector Command
 * 
 * Command to start MCP-compatible SSE server for MCP Inspector integration
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { getLogger } from '../utils/logger';

const logger = getLogger('Inspector-Command');

export function inspectorCommand(program: Command): void {
  program
    .command('inspector')
    .description('Start MCP Server with MCP Inspector compatible SSE transport')
    .option('--no-browser', 'Don\'t automatically open browser')
    .option('--port <port>', 'MCP server port', '3008')
    .action(async (options) => {
      console.log(chalk.cyan('🧪 Starting MCP-Compatible Server for Inspector Integration...\n'));
      
      console.log(chalk.yellow('📋 MCP Inspector Setup Instructions:'));
      console.log('   1. Run this command to start the MCP server');
      console.log('   2. Open MCP Inspector: npx @modelcontextprotocol/inspector');
      console.log('   3. Select "SSE" transport type');
      console.log(`   4. Enter server URL: http://localhost:${options.port || '3008'}/sse`);
      console.log('   5. Click "Connect" to establish connection');
      console.log('');
      
      try {
        const port = options.port || '3008';
        console.log(chalk.green(`🚀 Starting MCP Server on port ${port}...`));
        console.log(chalk.gray('   JSON-RPC 2.0 over SSE protocol enabled'));
        console.log('');
        
        // Start the MCP server with MCP-compatible SSE
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
          console.log(chalk.green('✅ MCP-Compatible SSE Server Running!'));
          console.log('');
          console.log(chalk.cyan('🔗 MCP Inspector Connection:'));
          console.log(chalk.white(`   Transport: SSE`));
          console.log(chalk.white(`   Server URL: http://localhost:${port}/sse`));
          console.log('');
          console.log(chalk.cyan('🛠 Available Endpoints:'));
          console.log(chalk.white(`   📊 Health Check: http://localhost:${port}/health`));
          console.log(chalk.white(`   📋 MCP Spec: http://localhost:${port}/mcp/spec`));
          console.log(chalk.white(`   🔌 SSE Connection: http://localhost:${port}/sse`));
          console.log(chalk.white(`   📨 MCP Messages: http://localhost:${port}/messages`));
          console.log('');
          console.log(chalk.yellow('🧪 MCP Inspector Usage:'));
          console.log(chalk.gray('   1. npx @modelcontextprotocol/inspector'));
          console.log(chalk.gray('   2. Transport: SSE'));
          console.log(chalk.gray(`   3. URL: http://localhost:${port}/sse`));
          console.log(chalk.gray('   4. Connect and test tools!'));
          console.log('');
          console.log(chalk.green('🎯 No STDIO Bridge Required - Direct JSON-RPC 2.0 over SSE!'));
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
