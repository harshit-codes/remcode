import { MCPServer } from './src/mcp/index';
import { getLogger } from './src/utils/logger';

const logger = getLogger('MCP-Server-Test');

// Test function for MCP server
async function testMCPServer() {
  try {
    logger.info('Starting MCP server test');
    
    // Initialize MCP server with options
    const server = new MCPServer({
      port: 3001,
      host: 'localhost',
      githubToken: process.env.GITHUB_TOKEN
    });
    
    // Start the server
    await server.start();
    logger.info(`MCP server started on ${server.options.host || 'localhost'}:${server.port}`);
    
    // Test routes
    logger.info('MCP server is running with these endpoints:');
    logger.info('- Health check: GET /health');
    logger.info('- MCP spec: GET /v1/mcp/spec');
    logger.info('- Setup repository: POST /v1/mcp/setup/repository');
    logger.info('- Check prerequisites: GET /v1/mcp/setup/prerequisites');
    logger.info('- Configure repository: POST /v1/mcp/setup/configure');
    logger.info('- Setup secrets: POST /v1/mcp/setup/secrets');
    logger.info('- Generate workflows: POST /v1/mcp/setup/workflows');
    logger.info('- Trigger processing: POST /v1/mcp/processing/trigger');
    logger.info('- Get processing status: GET /v1/mcp/processing/status');
    logger.info('- Get processing history: GET /v1/mcp/processing/history');
    
    // Run for 30 seconds then shut down
    logger.info('MCP server will run for 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Stop the server
    await server.stop();
    logger.info('MCP server stopped');
    
    return true;
  } catch (error) {
    logger.error(`Test failed with error: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// Run the test
testMCPServer()
  .then(success => {
    if (success) {
      logger.info('MCP server test completed successfully!');
      process.exit(0);
    } else {
      logger.error('MCP server test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    logger.error(`Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
