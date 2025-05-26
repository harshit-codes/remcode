#!/usr/bin/env ts-node

/**
 * Session Data Validation Utility
 * 
 * Quick validation functions to prevent data corruption
 * Supports both programmatic use and command line validation
 */

import * as fs from 'fs';
import * as path from 'path';
import { SessionData, ValidationResult, VALIDATION_RULES, SessionsJSON } from './types';

/**
 * Validate a single session entry
 */
export function validateSession(session: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check each field against validation rules
  for (const [field, rule] of Object.entries(VALIDATION_RULES)) {
    const value = session[field];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field}: ${rule.error}`);
      continue;
    }

    // Skip validation if field is not present and not required
    if (value === undefined || value === null) continue;

    // Type validation
    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push(`${field}: Must be a string. ${rule.error}`);
      continue;
    }

    if (rule.type === 'number') {
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
      if (isNaN(numValue)) {
        errors.push(`${field}: Must be a number. ${rule.error}`);
        continue;
      }
      session[field] = numValue; // Convert to number
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push(`${field}: ${rule.error}`);
    }

    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push(`${field}: ${rule.error}. Got: ${value}`);
    }

    // Length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors.push(`${field}: ${rule.error}. Current length: ${value.length}`);
    }

    // Number range validation
    if (rule.min !== undefined && typeof session[field] === 'number' && session[field] < rule.min) {
      errors.push(`${field}: ${rule.error}. Got: ${session[field]}`);
    }

    if (rule.max !== undefined && typeof session[field] === 'number' && session[field] > rule.max) {
      errors.push(`${field}: ${rule.error}. Got: ${session[field]}`);
    }
  }

  // Add warnings for common issues
  if (session.achievements && session.achievements.toLowerCase().includes('none')) {
    warnings.push('Consider being more specific about achievements instead of "None"');
  }

  if (session.duration && session.duration > 300) {
    warnings.push(`Long session duration (${session.duration} minutes) - consider breaking into smaller sessions`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate all sessions in an array
 */
export function validateAllSessions(sessions: any[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  sessions.forEach((session, index) => {
    const result = validateSession(session);
    
    if (!result.isValid) {
      allErrors.push(`Session ${index + 1} (${session.sessionId || 'unknown'}):`);
      result.errors.forEach(error => allErrors.push(`  - ${error}`));
    }

    if (result.warnings.length > 0) {
      allWarnings.push(`Session ${index + 1} (${session.sessionId || 'unknown'}):`);
      result.warnings.forEach(warning => allWarnings.push(`  - ${warning}`));
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Validate the sessions.json file directly
 */
export function validateSessionsFile(): ValidationResult {
  const JSON_PATH = path.join(__dirname, '../../sessions/sessions.json');
  
  try {
    if (!fs.existsSync(JSON_PATH)) {
      return {
        isValid: false,
        errors: ['sessions.json file not found'],
        warnings: []
      };
    }

    const sessionsData: SessionsJSON = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    return validateAllSessions(sessionsData.sessions);
  } catch (error: any) {
    return {
      isValid: false,
      errors: [`Error reading sessions.json: ${error.message}`],
      warnings: []
    };
  }
}

// Run validation if called directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate-all')) {
    console.log('🔍 Validating all sessions in sessions.json...');
    const result = validateSessionsFile();
    
    if (result.isValid) {
      console.log('✅ All sessions are valid!');
    } else {
      console.error('❌ Validation errors:');
      result.errors.forEach(error => console.error(`   ${error}`));
      process.exit(1);
    }
    
    if (result.warnings.length > 0) {
      console.warn('⚠️  Validation warnings:');
      result.warnings.forEach(warning => console.warn(`   ${warning}`));
    }
  } else {
    console.log('Usage: ts-node validator.ts --validate-all');
  }
}
