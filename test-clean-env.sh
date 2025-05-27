#!/bin/bash

# Test script to run remcode with clean environment
# Removes all environment variables that could be detected as MCP

cd /tmp
mkdir -p test-remcode-clean
cd test-remcode-clean

# Initialize a git repo for testing
git init > /dev/null 2>&1

# Create an empty .remcode to test "already configured" path  
echo '{}' > .remcode

echo "Testing with existing .remcode file..."
env -u PINECONE_API_KEY -u HUGGINGFACE_TOKEN -u GITHUB_TOKEN \
  node /Users/harshitchoudhary/Documents/remcode/remcode/dist/index.js

echo -e "\n\nNow testing without .remcode file..."
rm .remcode

env -u PINECONE_API_KEY -u HUGGINGFACE_TOKEN -u GITHUB_TOKEN \
  node /Users/harshitchoudhary/Documents/remcode/remcode/dist/index.js

# Cleanup
cd ..
rm -rf test-remcode-clean
