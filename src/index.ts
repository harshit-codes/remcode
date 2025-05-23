import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze';
import { vectorizeCommand } from './commands/vectorize';
import { updateCommand } from './commands/update';
import { serveCommand } from './commands/serve';
import { processCommand } from './commands/process';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create the program
const program = new Command();

// Set program information
program
  .name('remcode')
  .description('A code vectorization and analysis tool for better understanding of codebases')
  .version('0.1.0');

// Add commands
analyzeCommand(program);
vectorizeCommand(program);
updateCommand(program);
processCommand(program);
serveCommand(program);

// Add help information
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ remcode analyze ./my-project');
  console.log('  $ remcode vectorize ./my-project --analysis ./analysis.json');
  console.log('  $ remcode process --type auto');
  console.log('  $ remcode update --since-commit abc123');
  console.log('  $ remcode serve --port 3000');
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

// Parse arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}