# analyze.ts

**File Path:** `commands/analyze.ts`

## Overview

No overview provided.

## Dependencies

- `commander`
- `../utils/source`
- `../utils/config`
- `../analyzers/repository`
- `../analyzers/quality`
- `../analyzers/dependency`
- `../utils/logger`

## Functions

### `analyzeCommand()`

**Function Signature:**

```typescript
export function analyzeCommand(program: Command): void {
```

**Full Function:**

```typescript
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
        // Enable verbose logging if requested
        if (options.verbose) {
          // Set more detailed logging if available
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
        spinner.text = 'Detecting languages and repository structure';
        
        // Initialize analyzers with configuration
        const analyzerConfig = {
          depth: parseInt(options.depth),
          ignore: options.ignore ? options.ignore.split(',') : config.ignore,
          timeout: parseInt(options.timeout),
          focus: options.focus ? options.focus.split(',') : undefined
        };
        
        logger.debug('Initializing analyzers with config', analyzerConfig);
        
        const repoAnalyzer = new RepositoryAnalyzer(resolvedSource.path, analyzerConfig);
        const qualityAnalyzer = new CodeQualityAnalyzer(resolvedSource.path);
        const dependencyAnalyzer = new DependencyAnalyzer(resolvedSource.path);
        
        // Run analysis pipeline
        // Set up a timeout for analysis
        const timeoutMs = parseInt(options.timeout) * 1000;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Analysis timed out after ${options.timeout} seconds`)), timeoutMs);
        });
        
        // Run repository structure analysis
        spinner.text = 'Analyzing repository structure';
        logger.info('Starting repository structure analysis');
        const repoAnalysisPromise = repoAnalyzer.analyze();
        const repoAnalysis: any = await Promise.race([repoAnalysisPromise, timeoutPromise]);
        spinner.succeed('Repository structure analysis complete');
        spinner.start();
        
        // Run code quality analysis
        spinner.text = 'Analyzing code quality and complexity';
        logger.info('Starting code quality analysis');
        const qualityAnalysisPromise = qualityAnalyzer.analyze();
        const qualityAnalysis: any = await Promise.race([qualityAnalysisPromise, timeoutPromise]);
        spinner.succeed('Code quality analysis complete');
        spinner.start();
        
        // Run dependency analysis
        spinner.text = 'Analyzing dependencies and imports';
        logger.info('Starting dependency analysis');
        const dependencyAnalysisPromise = dependencyAnalyzer.analyze();
        const dependencyAnalysis: any = await Promise.race([dependencyAnalysisPromise, timeoutPromise]);
        spinner.succeed('Dependency analysis complete');
        spinner.start();
        
        // Combine analyses
        spinner.text = 'Combining analysis results';
        logger.info('Merging analysis results');
        
        // Get the optimal chunking strategies based on code quality
        const chunkingStrategies = {
          clean_modules: "module_level",
          complex_modules: "file_level",
          monolithic_files: "sliding_window_with_high_overlap"
        };
        
        // Determine best embedding models based on repository characteristics
        const embeddingModels = {
          primary: "graphcodebert",
          fallback: "codebert"
        };
        
        // Combine all analyses into a comprehensive report
        const analysis = {
          repository_info: {
            ...((repoAnalysis as any)?.repository_info || {}),
            analyzed_at: new Date().toISOString(),
            analysis_version: '1.0.0'
          },
          summary: {
            language_breakdown: repoAnalysis.language_breakdown || {},
            total_files: Array.isArray(repoAnalysis.files) ? repoAnalysis.files.length : 0,
            total_modules: Array.isArray(repoAnalysis.modules) ? repoAnalysis.modules.length : 0,
            overall_complexity: (qualityAnalysis as any)?.overall_assessment?.score || 0,
            quality_grade: (qualityAnalysis as any)?.overall_assessment?.grade || 'C',
            dependency_complexity: (dependencyAnalysis as any)?.complexity_score || 0
          },
          module_analysis: Array.isArray(repoAnalysis.modules) ? repoAnalysis.modules.map((module: any) => {
            const moduleQuality = ((qualityAnalysis as any)?.modules || {})[module.module_path] || {};
            const moduleDependencies = ((dependencyAnalysis as any)?.modules || {})[module.module_path] || {};
            
            return {
              ...module,
              ...moduleQuality,
              ...moduleDependencies,
              analysis_complete: true
            };
          }) : [],
          
          file_analysis: Array.isArray(repoAnalysis.files) ? repoAnalysis.files.map((file: any) => {
            const fileQuality = ((qualityAnalysis as any)?.files || {})[file.file_path] || {};
            const fileDependencies = ((dependencyAnalysis as any)?.files || {})[file.file_path] || {};
            
            return {
              ...file,
              ...fileQuality,
              ...fileDependencies,
              analysis_complete: true
            };
          }) : [],
          
          quality_assessment: {
            strengths: (qualityAnalysis as any)?.overall_assessment?.strengths || [],
            weaknesses: (qualityAnalysis as any)?.overall_assessment?.weaknesses || [],
            improvement_suggestions: (qualityAnalysis as any)?.overall_assessment?.improvement_suggestions || []
          },
          vectorization_recommendations: {
            chunking_strategy: chunkingStrategies,
            embedding_models: embeddingModels,
            priority_files: (dependencyAnalysis as any)?.key_files || [],
            problematic_files: (qualityAnalysis as any)?.problematic_files || []
          }
        };
        
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
  Name: ${chalk.cyan(analysis.repository_info.name || 'Unknown')}
  Files: ${chalk.cyan(analysis.summary.total_files || 0)}
  Modules: ${chalk.cyan(analysis.summary.total_modules || 0)}

${chalk.bold('Code Quality Assessment:')}
  Overall Grade: ${chalk.yellow(analysis.summary.quality_grade || 'C')}
  Complexity Score: ${chalk.yellow(analysis.summary.overall_complexity || 0)}

${chalk.bold('Vectorization Strategy:')}
  Priority Files: ${chalk.cyan(analysis.vectorization_recommendations.priority_files.length || 0)}
  Problematic Files: ${chalk.cyan(analysis.vectorization_recommendations.problematic_files.length || 0)}
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
        logger.error('Analysis failed with error', error);
        console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
        
        if (error instanceof Error && error.stack && options.verbose) {
          console.error(chalk.gray(error.stack));
        }
        
        console.log(chalk.yellow('\nTroubleshooting tips:'));
        console.log(' - Check your internet connection if using a GitHub repository');
        console.log(' - Ensure you have the necessary permissions to access the repository');
        console.log(' - Try increasing the timeout with --timeout <seconds>');
        console.log(' - Run with --verbose for more detailed error information');
        
        process.exit(1);
      }
    });
}
```

