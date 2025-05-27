import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { resolveSource } from '../utils/source';
import { loadConfig } from '../utils/config';
import { getLogger } from '../utils/logger';

const logger = getLogger('AnalyzeCommand');

// Simple language detection mapping
const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  javascript: ['.js', '.jsx'],
  typescript: ['.ts', '.tsx'],
  python: ['.py'],
  java: ['.java'],
  kotlin: ['.kt'],
  swift: ['.swift'],
  ruby: ['.rb'],
  go: ['.go'],
  rust: ['.rs'],
  csharp: ['.cs'],
  cpp: ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
  php: ['.php'],
  html: ['.html', '.htm'],
  css: ['.css', '.scss', '.sass', '.less'],
  json: ['.json'],
  markdown: ['.md', '.markdown'],
  yaml: ['.yml', '.yaml'],
  shell: ['.sh', '.bash', '.zsh'],
  sql: ['.sql'],
  xml: ['.xml'],
};

interface SimpleAnalysis {
  repository_info: {
    name: string;
    total_files: number;
    total_lines: number;
    analyzed_at: string;
    analysis_version: string;
  };
  language_breakdown: Record<string, {
    files: number;
    lines: number;
    percentage: number;
  }>;
  summary: {
    total_files: number;
    code_files: number;
    languages_detected: number;
    largest_file: string;
    largest_file_lines: number;
  };
  vectorization_recommendations: {
    chunking_strategy: {
      clean_modules: string;
      complex_modules: string;
      monolithic_files: string;
    };
    embedding_models: {
      primary: string;
      fallback: string;
    };
    estimated_chunks: number;
    priority_files: string[];
  };
}

/**
 * AnalyzeCommand function
 *
 * @description Configures and sets up the analyze command for the CLI
 * @param {Command} program The Commander.js program instance
 * @returns {void} Does not return a value
 */
export function analyzeCommand(program: Command): void {
  program
    .command('analyze')
    .description('Analyze a codebase structure and provide vectorization recommendations')
    .argument('<source>', 'Source codebase (GitHub URL or local path)')
    .option('-o, --output <path>', 'Output path for analysis report', './codebase_analysis.json')
    .option('-c, --config <path>', 'Path to config file')
    .option('-i, --ignore <patterns>', 'Patterns to ignore')
    .option('-t, --token <token>', 'GitHub token (if source is a GitHub repo)')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--cache <path>', 'Path to cache directory', './.remcode-cache')
    .action(async (source, options) => {
      const spinner = ora('Preparing analysis').start();
      
      try {
        // Enable verbose logging if requested
        if (options.verbose) {
          logger.info('Verbose logging enabled');
        }

        logger.info(`Starting analysis of ${source}`);
        
        // Load configuration
        const config = loadConfig(options.config);
        logger.debug('Configuration loaded', config);
        
        // Resolve the source (GitHub or local)
        spinner.text = 'Resolving source repository';
        const resolvedSource = await resolveSource(source, {
          token: options.token || process.env.GITHUB_TOKEN,
          cache: options.cache
        });
        
        logger.info(`Source resolved to ${resolvedSource.path}`);
        
        // Get ignore patterns
        const ignorePatterns = options.ignore ? 
          options.ignore.split(',') : 
          config.ignore || ['node_modules', 'dist', 'build', '.git', 'coverage', '.next', 'target', '__pycache__'];
        
        // Find all files
        spinner.text = 'Scanning repository files';
        const allFiles = await glob.glob('**/*', {
          cwd: resolvedSource.path,
          absolute: true,
          nodir: true,
          ignore: ignorePatterns.map((pattern: string) => `**/${pattern}/**`)
        });
        
        logger.info(`Found ${allFiles.length} files in repository`);
        
        // Analyze files
        spinner.text = 'Analyzing file structure and languages';
        const analysis = await analyzeRepository(resolvedSource.path, allFiles);
        
        // Create output directory if it doesn't exist
        spinner.text = 'Saving analysis report';
        const outputDir = path.dirname(options.output);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write analysis to file
        fs.writeFileSync(options.output, JSON.stringify(analysis, null, 2));
        
        // Generate a summary report for the console
        const summary = `
${chalk.bold(chalk.blue('Remcode Analysis Summary'))}

${chalk.bold('Repository Information:')}
  Name: ${chalk.cyan(analysis.repository_info.name)}
  Total Files: ${chalk.cyan(analysis.summary.total_files)}
  Code Files: ${chalk.cyan(analysis.summary.code_files)}
  Languages: ${chalk.cyan(analysis.summary.languages_detected)}

${chalk.bold('Top Languages:')}
${Object.entries(analysis.language_breakdown)
  .sort((a, b) => b[1].files - a[1].files)
  .slice(0, 5)
  .map(([lang, stats]) => `  ${chalk.yellow(lang)}: ${chalk.cyan(stats.files)} files (${chalk.green(stats.percentage)}%)`)
  .join('\n')}

${chalk.bold('Vectorization Strategy:')}
  Estimated Chunks: ${chalk.cyan(analysis.vectorization_recommendations.estimated_chunks)}
  Primary Model: ${chalk.yellow(analysis.vectorization_recommendations.embedding_models.primary)}
  Priority Files: ${chalk.cyan(analysis.vectorization_recommendations.priority_files.length)}
        `;
        
        spinner.succeed(`Analysis complete. Report saved to ${chalk.cyan(options.output)}`);
        console.log(summary);
        
        // Log next steps
        console.log(chalk.green('\nNext steps:'));
        console.log(`  1. Run ${chalk.cyan(`remcode vectorize ${source} --analysis ${options.output}`)} to vectorize this codebase`);
        console.log(`  2. Or explore the analysis report at ${chalk.cyan(options.output)}\n`);
        
        logger.info('Analysis command completed successfully');
      } catch (error) {
        spinner.fail('Analysis failed');
        logger.error('Analysis failed with error', error instanceof Error ? error : undefined);
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        
        if (error instanceof Error && error.stack && options.verbose) {
          console.error(chalk.gray(error.stack));
        }
        
        console.log(chalk.yellow('\nTroubleshooting tips:'));
        console.log(' - Check your internet connection if using a GitHub repository');
        console.log(' - Ensure you have the necessary permissions to access the repository');
        console.log(' - Run with --verbose for more detailed error information');
        
        process.exit(1);
      }
    });
}

async function analyzeRepository(repoPath: string, allFiles: string[]): Promise<SimpleAnalysis> {
  const repoName = path.basename(repoPath);
  
  // Create extension to language map
  const extensionToLanguage = new Map<string, string>();
  for (const [language, extensions] of Object.entries(LANGUAGE_EXTENSIONS)) {
    for (const ext of extensions) {
      extensionToLanguage.set(ext, language);
    }
  }
  
  // Analyze language distribution
  const languageStats: Record<string, { files: number; lines: number }> = {};
  let totalLines = 0;
  let codeFiles = 0;
  let largestFile = '';
  let largestFileLines = 0;
  
  // Process files in batches to avoid memory issues
  const batchSize = 50;
  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (file) => {
      try {
        const extension = path.extname(file).toLowerCase();
        const language = extensionToLanguage.get(extension) || 'other';
        
        if (!languageStats[language]) {
          languageStats[language] = { files: 0, lines: 0 };
        }
        
        languageStats[language].files++;
        
        // Only count lines for known code files to avoid binary files
        if (language !== 'other') {
          codeFiles++;
          const content = await fs.promises.readFile(file, 'utf-8');
          const lineCount = content.split('\n').length;
          
          languageStats[language].lines += lineCount;
          totalLines += lineCount;
          
          // Track largest file
          if (lineCount > largestFileLines) {
            largestFileLines = lineCount;
            largestFile = path.relative(repoPath, file);
          }
        }
      } catch (error) {
        // Skip files that can't be read (likely binary)
        logger.debug(`Skipping file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }));
  }
  
  // Calculate percentages
  const languageBreakdown: Record<string, { files: number; lines: number; percentage: number }> = {};
  for (const [language, stats] of Object.entries(languageStats)) {
    languageBreakdown[language] = {
      files: stats.files,
      lines: stats.lines,
      percentage: totalLines > 0 ? Math.round((stats.lines / totalLines) * 100) : 0
    };
  }
  
  // Estimate chunks based on code lines (assuming ~50 lines per chunk on average)
  const estimatedChunks = Math.ceil(totalLines / 50);
  
  // Identify priority files (large files that should be chunked)
  const priorityFiles = allFiles
    .filter(file => {
      const extension = path.extname(file).toLowerCase();
      return extensionToLanguage.has(extension);
    })
    .map(file => ({
      path: path.relative(repoPath, file),
      size: fs.statSync(file).size
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .map(f => f.path);
  
  return {
    repository_info: {
      name: repoName,
      total_files: allFiles.length,
      total_lines: totalLines,
      analyzed_at: new Date().toISOString(),
      analysis_version: '1.0.0-simplified'
    },
    language_breakdown: languageBreakdown,
    summary: {
      total_files: allFiles.length,
      code_files: codeFiles,
      languages_detected: Object.keys(languageBreakdown).length,
      largest_file: largestFile,
      largest_file_lines: largestFileLines
    },
    vectorization_recommendations: {
      chunking_strategy: {
        clean_modules: "module_level",
        complex_modules: "file_level", 
        monolithic_files: "sliding_window_with_high_overlap"
      },
      embedding_models: {
        primary: "microsoft/graphcodebert-base",
        fallback: "microsoft/codebert-base"
      },
      estimated_chunks: estimatedChunks,
      priority_files: priorityFiles
    }
  };
}
