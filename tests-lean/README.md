# Lean Test Framework for Remcode

## Philosophy: Fast, Simple, Maintainable

This lean test framework replaces the complex 22-file test structure with a focused approach:

- **3 Test Categories**: Unit, Integration, E2E
- **Mock-First Approach**: Minimize external API dependencies
- **Practical Coverage**: Test what matters, not everything
- **Fast Execution**: All tests run in under 30 seconds
- **Zero Configuration**: Works out of the box

## Structure

```
tests-lean/
├── unit/           # Pure unit tests (no external deps)
├── integration/    # Component integration tests
├── e2e/           # End-to-end workflow tests
├── fixtures/      # Shared test data
├── setup.ts       # Global test setup
└── utils.ts       # Test utilities
```

## Running Tests

```bash
# All tests (fast)
npm run test:lean

# Specific category
npm run test:lean:unit
npm run test:lean:integration  
npm run test:lean:e2e

# Watch mode
npm run test:lean:watch

# Coverage
npm run test:lean:coverage
```

## Test Categories

### Unit Tests (tests-lean/unit/)
- **Purpose**: Test individual functions/classes in isolation
- **Dependencies**: None (fully mocked)
- **Speed**: < 5 seconds total
- **Examples**: Config parsing, utility functions, class methods

### Integration Tests (tests-lean/integration/)
- **Purpose**: Test component interactions
- **Dependencies**: Minimal (local only)
- **Speed**: < 15 seconds total
- **Examples**: MCP server startup, API routing, file processing

### E2E Tests (tests-lean/e2e/)
- **Purpose**: Test complete workflows
- **Dependencies**: Optional external APIs
- **Speed**: < 30 seconds total
- **Examples**: Setup workflow, search pipeline, tool execution

## Key Principles

1. **Mock External Services**: Use realistic mocks instead of real APIs
2. **Test Business Logic**: Focus on core functionality, not implementation details
3. **Fast Feedback**: Entire test suite runs in 30 seconds
4. **Deterministic**: Tests never flake due to network issues
5. **Practical**: Test what users actually do, not edge cases

## Migration Benefits

- **10x Faster**: 30 seconds vs 5+ minutes
- **Zero Flakes**: No external API dependencies
- **Easy Maintenance**: 3 categories vs 10+ directories
- **Clear Purpose**: Each test has obvious value
- **CI Friendly**: Reliable in automated environments
