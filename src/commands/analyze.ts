import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { resolveSource } from '../utils/source';
import { loadConfig } from '../utils/config';
import { RepositoryAnalyzer } from '../analyzers/repository';
import { CodeQualityAnalyzer } from '../analyzers/quality';
import { DependencyAnalyzer } from '../analyzers/dependency';

export function analyzeCommand(program: Command): void {
  program
    .command('analyze')
    .description('Analyze a codebase')
    .argument('<source>', 'Source codebase (GitHub URL or local path)')
    .option('-o, --output <path>', 'Output path for analysis report', './codebase_analysis.json')
    .option('-c, --config <path>', 'Path to config file')
    .option('-d, --depth <number>', 'Analysis depth (1-3)', '2')
    .option('-f, --focus <components>', 'Components to focus on')
    .option('-i, --ignore <patterns>', 'Patterns to ignore')
    .option('-t, --token <token>', 'GitHub token (if source is a GitHub repo)')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--timeout <seconds>', 'Maximum time for analysis in seconds', '3600')
    .option('--cache <path>', 'Path to cache directory', './.remcode-cache')
    .action(async (source, options) => {
      const spinner = ora('Preparing analysis').start();
      
      try {
        // Load configuration
        const config = loadConfig(options.config);
        
        // Resolve the source (GitHub or local)
        const resolvedSource = await resolveSource(source, {
          token: options.token || process.env.GITHUB_TOKEN,
          cache: options.cache
        });
        
        spinner.text = 'Detecting languages';
        
        // Initialize analyzers
        const repoAnalyzer = new RepositoryAnalyzer(resolvedSource.path, {
          depth: parseInt(options.depth),
          ignore: options.ignore ? options.ignore.split(',') : config.ignore
        });
        
        const qualityAnalyzer = new CodeQualityAnalyzer(resolvedSource.path);
        const dependencyAnalyzer = new DependencyAnalyzer(resolvedSource.path);
        
        // Run analysis pipeline
        spinner.text = 'Analyzing repository structure';
        const repoAnalysis = await repoAnalyzer.analyze();
        
        spinner.text = 'Analyzing code quality';
        const qualityAnalysis = await qualityAnalyzer.analyze();
        
        spinner.text = 'Analyzing dependencies';
        const dependencyAnalysis = await dependencyAnalyzer.analyze();
        
        // Combine analyses
        const analysis = {
          repository_info: repoAnalysis.repository_info,
          module_analysis: repoAnalysis.modules.map(module => {
            const moduleQuality = qualityAnalysis.modules[module.module_path] || {};
            const moduleDependencies = dependencyAnalysis.modules[module.module_path] || {};
            
            return {
              ...module,
              ...moduleQuality,
              ...moduleDependencies
            };
          }),
          file_analysis: repoAnalysis.files.map(file => {
            const fileQuality = qualityAnalysis.files[file.file_path] || {};
            const fileDependencies = dependencyAnalysis.files[file.file_path] || {};
            
            return {
              ...file,
              ...fileQuality,
              ...fileDependencies
            };
          }),
          vectorization_recommendations: {
            chunking_strategy: {
              clean_modules: "module_level",
              complex_modules: "file_level",
              monolithic_files: "sliding_window_with_high_overlap"
            },
            embedding_models: {
              primary: "graphcodebert",
              fallback: "codebert"
            },
            priority_files: dependencyAnalysis.key_files || [],
            problematic_files: qualityAnalysis.problematic_files || []
          }
        };
        
        // Create output directory if it doesn't exist
        const outputDir = path.dirname(options.output);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write analysis to file
        fs.writeFileSync(options.output, JSON.stringify(analysis, null, 2));
        
        spinner.succeed(`Analysis complete. Report saved to ${options.output}`);
      } catch (error) {
        spinner.fail('Analysis failed');
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        process.exit(1);
      }
    });
}
