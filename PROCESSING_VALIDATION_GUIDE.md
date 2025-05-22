# Processing Pipeline Validation Guide

## Overview
This guide provides step-by-step validation for the newly implemented Processing Pipeline components.

## ✅ Validation Steps

### 1. Basic Functionality Test
Test the core processing pipeline functionality:

```bash
# Test basic pipeline functionality
node -e "
const { ProcessingPipeline } = require('./dist/processing');
const pipeline = new ProcessingPipeline(process.cwd(), {
  repoPath: process.cwd(),
  pineconeApiKey: 'test-key',
  pineconeIndexName: 'test-index',
  dryRun: true
});
pipeline.getStatus().then(console.log);
"
```

### 2. Change Detection Test
Verify git change detection works:

```bash
# Make a small change and test detection
echo "// Test comment" >> src/index.ts
git add .
git commit -m "Test change for validation"

# Test change detection
node -e "
const { ChangeDetector } = require('./dist/processing');
const detector = new ChangeDetector(process.cwd());
detector.getChangedFiles('HEAD~1').then(changes => {
  console.log('Detected changes:', changes.length);
  console.log('Files:', changes.map(c => c.path));
});
"
```

### 3. File Analysis Test
Test file analysis capabilities:

```bash
node -e "
const { FileAnalyzer } = require('./dist/processing');
const analyzer = new FileAnalyzer(process.cwd());
const testFile = { path: 'src/index.ts', status: 'modified', size: 1000 };
analyzer.analyzeChangedFiles([testFile]).then(results => {
  console.log('Analysis results:', JSON.stringify(results[0], null, 2));
});
"
```

### 4. Quality Analysis Test
Verify quality analysis integration:

```bash
node -e "
const { CodeQualityAnalyzer } = require('./dist/analyzers/quality');
const analyzer = new CodeQualityAnalyzer(process.cwd());
analyzer.analyze().then(results => {
  console.log('Quality analysis completed');
  console.log('Files analyzed:', Object.keys(results.files).length);
  console.log('Overall grade:', results.overall_assessment.grade);
});
"
```
