/**
 * JSON Schema Validator for Session Data
 * 
 * Provides comprehensive validation of session data against JSON schema
 * with detailed error reporting and type checking.
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

/**
 * Create and configure AJV validator instance
 */
function createValidator() {
  const ajv = new Ajv({ 
    allErrors: true,
    verbose: true,
    strict: false
  });
  
  addFormats(ajv);
  return ajv;
}

/**
 * Validate session data against JSON schema
 * @param {Object} sessionData - Session data to validate
 * @param {Object} schema - JSON schema for validation
 * @throws {Error} Validation error with detailed messages
 */
function validateSessionData(sessionData, schema) {
  const ajv = createValidator();
  const validate = ajv.compile(schema);
  
  const isValid = validate(sessionData);
  
  if (!isValid) {
    const errors = validate.errors.map(error => {
      const instancePath = error.instancePath || 'root';
      const message = error.message;
      const allowedValues = error.params?.allowedValues ? 
        ` (allowed: ${error.params.allowedValues.join(', ')})` : '';
      
      return `${instancePath}: ${message}${allowedValues}`;
    });
    
    throw new Error(`Validation failed:\n  ${errors.join('\n  ')}`);
  }
  
  return true;
}

/**
 * Validate array of session data
 * @param {Array<Object>} sessionsData - Array of session data
 * @param {Object} schema - JSON schema for validation  
 * @returns {Object} Validation results with success/failure counts
 */
function validateSessionsArray(sessionsData, schema) {
  const results = {
    total: sessionsData.length,
    valid: 0,
    invalid: 0,
    errors: []
  };
  
  sessionsData.forEach((session, index) => {
    try {
      validateSessionData(session, schema);
      results.valid++;
    } catch (error) {
      results.invalid++;
      results.errors.push({
        index,
        sessionId: session.sessionId || 'unknown',
        error: error.message
      });
    }
  });
  
  return results;
}

module.exports = {
  validateSessionData,
  validateSessionsArray,
  createValidator
};
