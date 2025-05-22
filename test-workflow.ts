import { WorkflowGenerator } from './src/workflows/generator';
import { WorkflowMonitor } from './src/workflows/monitor';
import { WorkflowType } from './src/workflows/templates';
import { getLogger } from './src/utils/logger';

const logger = getLogger('WorkflowTest');

// Test function for workflow generation
async function testWorkflowGeneration() {
  try {
    // Initialize workflow generator
    const generator = new WorkflowGenerator('./');
    
    // Generate a basic workflow
    logger.info('Generating basic Remcode workflow...');
    const basicResult = await generator.generateRemcodeWorkflow('test-repo', {
      notifications: {
        slack: {
          enabled: true,
          webhook: '${SLACK_WEBHOOK_URL}'
        }
      }
    });
    
    if (basicResult.success) {
      logger.info(`Successfully generated basic workflow at: ${basicResult.filePath}`);
    } else {
      logger.error(`Failed to generate basic workflow: ${basicResult.error}`);
    }
    
    // Generate a scheduled workflow
    logger.info('Generating scheduled workflow...');
    const scheduledResult = await generator.generateScheduledWorkflow('test-repo', '0 0 * * 1');
    
    if (scheduledResult.success) {
      logger.info(`Successfully generated scheduled workflow at: ${scheduledResult.filePath}`);
    } else {
      logger.error(`Failed to generate scheduled workflow: ${scheduledResult.error}`);
    }
    
    // Generate an advanced workflow
    logger.info('Generating advanced workflow...');
    const advancedResult = await generator.generateAdvancedWorkflow('test-repo', {
      environment: {
        nodeVersion: '18',
        useCache: true,
        runnerOS: 'ubuntu-latest'
      },
      parameters: {
        cacheKeyPrefix: 'remcode-cache'
      }
    });
    
    if (advancedResult.success) {
      logger.info(`Successfully generated advanced workflow at: ${advancedResult.filePath}`);
    } else {
      logger.error(`Failed to generate advanced workflow: ${advancedResult.error}`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Test failed with error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// Run the test
testWorkflowGeneration()
  .then(success => {
    if (success) {
      logger.info('Workflow generation test completed successfully!');
    } else {
      logger.error('Workflow generation test failed!');
    }
  })
  .catch(error => {
    logger.error(`Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
  });
