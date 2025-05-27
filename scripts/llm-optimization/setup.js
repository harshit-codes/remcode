#!/usr/bin/env node
/**
 * @fileoverview Complete LLM optimization setup script
 * @module scripts/setupLLMOptimization
 * @version 1.0.0
 * @author Remcode Team
 * @since 2024-05-28
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up LLM Optimization for Remcode...');

async function setupLLMOptimization() {
  const projectRoot = process.cwd();
  
  try {
    // Step 1: Create directory structure
    console.log('📁 Creating LLM-optimized directory structure...');
    await createDirectoryStructure(projectRoot);
    
    // Step 2: Update package.json with new scripts
    console.log('📦 Adding LLM optimization scripts to package.json...');
    await updatePackageJson(projectRoot);
    
    // Step 3: Create configuration files
    console.log('⚙️  Creating configuration files...');
    await createConfigFiles(projectRoot);
    
    // Step 4: Create GitHub Actions workflow
    console.log('🔄 Setting up CI/CD integration...');
    await createGitHubWorkflow(projectRoot);
    
    // Step 5: Install required dependencies
    console.log('📥 Installing required dependencies...');
    await installDependencies(projectRoot);
    
    // Step 6: Generate initial documentation
    console.log('📚 Generating initial documentation...');
    await generateInitialDocs(projectRoot);
    
    console.log('\n🎉 LLM Optimization setup complete!');
    console.log('\n🔥 Next steps:');
    console.log('1. Run: npm run llm:validate - Check current compliance');
    console.log('2. Run: npm run llm:optimize - Transform existing code');  
    console.log('3. Run: npm run llm:dashboard - View metrics dashboard');
    console.log('4. Start development: npm run dev:llm');
    console.log('\n📖 Documentation: docs/generated/QUICK_REFERENCE.md');
    console.log('🎯 Style Guide: docs/templates/JSDOC_STYLE_GUIDE.md');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Try running individual steps:');
    console.log('- Check write permissions in project directory');
    console.log('- Ensure Node.js version >= 16');
    console.log('- Run: npm install to update dependencies');
    process.exit(1);
  }
}

async function createDirectoryStructure(projectRoot) {
  const directories = [
    'docs/generated',
    'docs/context', 
    'docs/templates',
    'scripts/llm-optimization'
  ];
  
  for (const dir of directories) {
    await fs.mkdir(path.join(projectRoot, dir), { recursive: true });
  }
}

async function updatePackageJson(projectRoot) {
  const packagePath = path.join(projectRoot, 'package.json');
  
  try {
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    // Add LLM optimization scripts
    const newScripts = {
      "llm:setup": "node scripts/llm-optimization/setup.js",
      "llm:validate": "bash scripts/llm-optimization/validate-docs.sh",
      "llm:generate-docs": "node scripts/llm-optimization/generate-docs.js",
      "llm:generate-context": "node scripts/llm-optimization/generate-docs.js src docs/context",
      "llm:measure-quality": "node scripts/llm-optimization/generate-docs.js && echo 'Quality metrics in docs/generated/metrics.json'",
      "llm:dashboard": "node scripts/llm-optimization/generate-docs.js && open docs/generated/QUICK_REFERENCE.md",
      "llm:optimize": "npm run llm:generate-docs && npm run llm:generate-context",
      "dev:llm": "npm run llm:generate-context && npm run dev",
      "build:llm": "npm run llm:generate-docs && npm run build",
      "test:llm": "npm run llm:validate && npm run test",
      "pre-commit": "npm run llm:validate"
    };
    
    packageJson.scripts = { ...packageJson.scripts, ...newScripts };
    
    // Add dev dependencies if not present
    if (!packageJson.devDependencies) packageJson.devDependencies = {};
    
    const newDevDeps = {
      "glob": "^10.0.0",
      "chokidar": "^3.5.3"
    };
    
    Object.assign(packageJson.devDependencies, newDevDeps);
    
    await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
    
  } catch (error) {
    console.log('⚠️  Could not update package.json automatically');
    console.log('Please add the LLM scripts manually from the documentation');
  }
}

async function createConfigFiles(projectRoot) {
  // Create JSDoc style guide
  const styleGuide = `# JSDoc Style Guide for LLM Optimization

## Function Documentation Template

\`\`\`typescript
/**
 * Brief one-line description of function purpose
 * 
 * @async
 * @function functionName
 * @description Extended description with usage context
 * 
 * @param {Type} paramName - Description of parameter
 * @param {Object} [options={}] - Configuration options
 * 
 * @returns {Promise<Type>} Description of return value
 * 
 * @throws {ErrorType} When this error occurs
 * 
 * @example
 * // Basic usage
 * const result = await functionName(param);
 * 
 * @since 1.0.0
 */
\`\`\`

## Required Elements

1. **Brief Description**: One-line summary
2. **@function**: Function name
3. **@description**: Extended context
4. **@param**: All parameters with types
5. **@returns**: Return value description
6. **@example**: At least one usage example
7. **@since**: Version information

## Best Practices

- Use explicit types instead of 'any'
- Include practical examples
- Document all error conditions
- Link to related functions with @see
- Keep descriptions clear and concise
`;

  await fs.writeFile(
    path.join(projectRoot, 'docs/templates/JSDOC_STYLE_GUIDE.md'),
    styleGuide
  );
  
  // Create LLM config
  const llmConfig = {
    "version": "1.0.0",
    "optimization": {
      "singleFunctionPerFile": true,
      "requireJSDoc": true,
      "featureBasedOrganization": true
    },
    "documentation": {
      "outputDir": "docs/generated",
      "contextDir": "docs/context",
      "includeExamples": true
    },
    "validation": {
      "validateOnCommit": true,
      "failOnErrors": true
    }
  };
  
  await fs.writeFile(
    path.join(projectRoot, '.llmrc.json'),
    JSON.stringify(llmConfig, null, 2)
  );
}

async function createGitHubWorkflow(projectRoot) {
  const workflowDir = path.join(projectRoot, '.github/workflows');
  await fs.mkdir(workflowDir, { recursive: true });
  
  const workflow = `name: LLM Documentation Generation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate-and-generate-docs:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Validate LLM optimization
      run: npm run llm:validate
    
    - name: Generate documentation
      run: npm run llm:generate-docs
    
    - name: Upload documentation
      uses: actions/upload-artifact@v3
      with:
        name: llm-docs
        path: docs/generated/
`;

  await fs.writeFile(
    path.join(workflowDir, 'llm-docs.yml'),
    workflow
  );
}

async function installDependencies(projectRoot) {
  try {
    console.log('Installing glob and chokidar...');
    execSync('npm install --save-dev glob@^10.0.0 chokidar@^3.5.3', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
  } catch (error) {
    console.log('⚠️  Could not install dependencies automatically');
    console.log('Please run: npm install --save-dev glob chokidar');
  }
}

async function generateInitialDocs(projectRoot) {
  try {
    // Create initial documentation
    const quickStart = `# Remcode LLM Optimization

## Quick Start

This project has been set up with LLM optimization for enhanced AI-assisted development.

### Commands

- \`npm run llm:validate\` - Validate code compliance
- \`npm run llm:generate-docs\` - Generate documentation  
- \`npm run llm:optimize\` - Run all optimizations
- \`npm run dev:llm\` - Development with context updates

### Documentation

- Function signatures: See generated FUNCTION_CATALOG.md
- Style guide: docs/templates/JSDOC_STYLE_GUIDE.md
- Metrics: Check docs/generated/metrics.json

### Next Steps

1. Run \`npm run llm:validate\` to check current state
2. Run \`npm run llm:optimize\` to transform code
3. Start developing with \`npm run dev:llm\`

Generated: ${new Date().toISOString()}
`;

    await fs.writeFile(
      path.join(projectRoot, 'docs/generated/README.md'),
      quickStart
    );
    
    // Try to generate initial docs if scripts are ready
    try {
      execSync('npm run llm:generate-docs', {
        cwd: projectRoot,
        stdio: 'pipe'
      });
    } catch (error) {
      // Scripts might not be ready yet, that's ok
      console.log('📝 Initial documentation will be generated on first run');
    }
    
  } catch (error) {
    console.log('⚠️  Could not generate initial documentation');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupLLMOptimization();
}

module.exports = { setupLLMOptimization };