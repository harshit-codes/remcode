import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze';
import { vectorizeCommand } from './commands/vectorize';
import { updateCommand } from './commands/update';
import { serveCommand } from './commands/serve';
import { processCommand } from './commands/process';
import { inspectorCommand } from './commands/inspector';
import chalk from 'chalk';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Get version from package.json dynamically
function getPackageVersion(): string {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    // Fallback version if package.json cannot be read
    return '0.1.7';
  }
}

// Create the program
const program = new Command();

// Set program information
program
  .name('remcode')
  .description('A code vectorization and analysis tool for better understanding of codebases')
  .version(getPackageVersion());

// Add commands
analyzeCommand(program);
vectorizeCommand(program);
updateCommand(program);
processCommand(program);
serveCommand(program);
inspectorCommand(program);

// Add help information
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ remcode analyze ./my-project');
  console.log('  $ remcode vectorize ./my-project --analysis ./analysis.json');
  console.log('  $ remcode process --type auto');
  console.log('  $ remcode update --since-commit abc123');
  console.log('  $ remcode serve --port 3000');
  console.log('  $ remcode inspector  # Interactive MCP tool testing');
});

// Error handling
program.showHelpAfterError('(add --help for additional information)');

// Handle unknown commands
program.on('command:*', (operands) => {
  console.error(chalk.red(`error: unknown command '${operands[0]}'`));
  const availableCommands = program.commands.map(cmd => cmd.name());
  console.error(chalk.red(`Available commands: ${availableCommands.join(', ')}`));
  process.exitCode = 1;
});

// Smart auto-routing when no arguments provided
if (!process.argv.slice(2).length) {
  autoRoute();
} else {
  // Parse arguments normally when commands are provided
  program.parse(process.argv);
}

/**
 * Smart auto-routing based on context detection
 * Automatically determines the appropriate action based on environment
 */
function autoRoute(): void {
  console.log(chalk.blue('🔍 Auto-detecting context...'));
  
  // 1. Check if called from MCP environment
  if (isMCPEnvironment()) {
    console.log(chalk.green('📡 MCP environment detected - starting server...'));
    program.parse(['node', 'remcode', 'serve']);
    return;
  }
  
  // 2. Check if in Git repository
  if (!isGitRepository()) {
    console.log(chalk.yellow('📖 No Git repository found - showing help...'));
    program.outputHelp();
    console.log('\n' + chalk.cyan('💡 To use Remcode:'));
    console.log(chalk.cyan('   1. Navigate to a Git repository'));
    console.log(chalk.cyan('   2. Add Remcode to your AI assistant (see README.md)'));
    console.log(chalk.cyan('   3. Ask questions about your codebase'));
    return;
  }
  
  // 3. Check if already configured
  if (hasRemcodeConfig()) {
    console.log(chalk.green('⚙️  Configuration found - starting server...'));
    program.parse(['node', 'remcode', 'serve']);
    return;
  }
  
  // 4. First time in Git repo - suggest MCP setup
  console.log(chalk.yellow('🚀 First time setup detected'));
  console.log('\n' + chalk.cyan('🎯 Quick Setup:'));
  console.log(chalk.cyan('   Add this to your AI assistant configuration:'));
  console.log(chalk.gray('   {'));
  console.log(chalk.gray('     "mcpServers": {'));
  console.log(chalk.gray('       "remcode": {'));
  console.log(chalk.gray('         "command": "npx",'));
  console.log(chalk.gray('         "args": ["remcode"],'));
  console.log(chalk.gray('         "env": {'));
  console.log(chalk.gray('           "PINECONE_API_KEY": "your_key_here",'));
  console.log(chalk.gray('           "HUGGINGFACE_TOKEN": "your_token_here",'));
  console.log(chalk.gray('           "GITHUB_TOKEN": "your_github_token"'));
  console.log(chalk.gray('         }'));
  console.log(chalk.gray('       }'));
  console.log(chalk.gray('     }'));
  console.log(chalk.gray('   }'));
  console.log('\n' + chalk.cyan('📚 Get API keys:'));
  console.log(chalk.cyan('   • Pinecone: https://app.pinecone.io/organizations/-/projects/-/keys'));
  console.log(chalk.cyan('   • HuggingFace: https://huggingface.co/settings/tokens'));
  console.log(chalk.cyan('   • GitHub: https://github.com/settings/tokens/new?scopes=repo,workflow'));
}

/**
 * Detect if running in MCP environment
 */
function isMCPEnvironment(): boolean {
  // Check for MCP-specific environment variables
  return !!(process.env.PINECONE_API_KEY || process.env.HUGGINGFACE_TOKEN || process.env.GITHUB_TOKEN);
}

/**
 * Check if current directory is a Git repository
 */
function isGitRepository(): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), '.git'));
  } catch {
    return false;
  }
}

/**
 * Check if Remcode configuration exists
 */
function hasRemcodeConfig(): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), '.remcode'));
  } catch {
    return false;
  }
}