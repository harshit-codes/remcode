import { getLogger } from '../utils/logger';

const logger = getLogger('WorkflowTemplates');

export class WorkflowTemplates {
  getRemcodeWorkflowTemplate(repoName: string): string {
    return `name: Remcode Processing

on:
  push:
    branches: [ main, master, develop ]
  workflow_dispatch:
    inputs:
      force_full_reprocess:
        description: 'Force full reprocessing'
        type: boolean
        default: false

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Process with Remcode
      run: npx remcode@latest process
      env:
        PINECONE_API_KEY: \${{ secrets.PINECONE_API_KEY }}
        HUGGINGFACE_TOKEN: \${{ secrets.HUGGINGFACE_TOKEN }}
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
  }

  getCustomWorkflowTemplate(options: any): string {
    logger.info('Generating custom workflow template');
    return this.getRemcodeWorkflowTemplate(options.repoName || 'repository');
  }
}
