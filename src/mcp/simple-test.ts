/**
 * Simple Test for Enhanced Tools
 */

import { getAllEnhancedTools } from './tool-integration-final';

function testTools() {
  try {
    const tools = getAllEnhancedTools();
    console.log(`Found ${tools.length} enhanced tools:`);
    tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description.substring(0, 50)}...`);
    });
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

export { testTools };
