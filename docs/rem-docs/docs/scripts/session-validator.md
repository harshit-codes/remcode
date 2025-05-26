# session-validator.js

**File Path:** `docs/scripts/session-validator.js`

## Overview

JSON Schema Validator for Session Data

Provides comprehensive validation of session data against JSON schema
with detailed error reporting and type checking.

Create and configure AJV validator instance

Validate session data against JSON schema
@param {Object} sessionData - Session data to validate
@param {Object} schema - JSON schema for validation
@throws {Error} Validation error with detailed messages

Validate array of session data
@param {Array<Object>} sessionsData - Array of session data
@param {Object} schema - JSON schema for validation  
@returns {Object} Validation results with success/failure counts

## Functions

### `createValidator()`

```typescript
export function createValidator()
```

### `validateSessionData()`

```typescript
export function validateSessionData()
```

### `validateSessionsArray()`

```typescript
export function validateSessionsArray()
```

## Variables

- `Ajv`
- `addFormats`
- `ajv`
- `ajv`
- `validate`
- `isValid`
- `errors`
- `instancePath`
- `message`
- `allowedValues`
- `results`

