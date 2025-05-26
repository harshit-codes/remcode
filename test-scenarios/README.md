# Remcode Test Scenarios

This directory contains structured test scenarios for validating Remcode functionality in different environments.

## Test Structure

The test scenarios are organized into two main categories:

1. **Local Scenario** - Tests Remcode with local Node.js installation
   - Validates CLI functionality
   - Tests local development workflows
   - Confirms proper dependency management

2. **Remote Scenario** - Tests Remcode in GitHub Actions environment
   - Validates remote execution
   - Tests token-based authentication
   - Confirms GitHub Actions integration

## Running Tests

Before running any tests, ensure you have a clean environment:

```bash
node prepare-test-environment.js
```

### Local Tests

To run the local test scenario:

```bash
cd local-scenario
npm install
# Run remcode commands for testing
```

### Remote Tests

The remote test scenario is designed to be tested via GitHub Actions. Push changes to trigger the workflow defined in `.github/workflows/remcode-test.yml`.

## Test Data

Each scenario contains sample files that represent typical usage patterns:

- TypeScript/JavaScript applications
- React components
- Python scripts
- Configuration files

## Adding New Test Scenarios

When adding new test scenarios, follow these guidelines:

1. Create a new directory with a descriptive name
2. Include a `package.json` file with necessary dependencies
3. Document the test purpose and expected outcomes
4. Update the prepare-test-environment.js script to include the new scenario

## Cleanup

The `prepare-test-environment.js` script handles:
- Clearing Pinecone database entries
- Removing .remcode configuration files
- Resetting test repositories to their initial state
