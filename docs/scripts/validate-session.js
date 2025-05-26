#!/usr/bin/env node

/**
 * Session CSV Validation Script
 * 
 * Validates session entries before adding them to SESSIONS.csv
 * Ensures data quality and format compliance
 */

const fs = require('fs');
const path = require('path');

// CSV Schema Definition
const CSV_SCHEMA = {
  session_id: { type: 'string', required: true, pattern: /^\d{4}-\d{2}-\d{2}-.+$/ },
  timestamp: { type: 'string', required: true, pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/ },
  developer: { type: 'string', required: true },
  status: { type: 'enum', required: true, values: ['completed', 'in_progress', 'blocked'] },
  focus: { type: 'string', required: true },
  achievements: { type: 'string', required: true },
  blockers: { type: 'string', required: true },
  next_steps: { type: 'string', required: true },
  files_changed: { type: 'string', required: true },
  learnings: { type: 'string', required: true },
  notes: { type: 'string', required: true },
  duration_mins: { type: 'number', required: true, min: 0, max: 600 }
};

const CSV_HEADERS = Object.keys(CSV_SCHEMA);
const SESSIONS_FILE = path.join(__dirname, '..', 'SESSIONS.csv');

/**
 * Validate session entry against schema
 * @param {Object} entry - Session entry to validate
 * @returns {Object} - Validation result with success/errors
 */
function validateEntry(entry) {
  const errors = [];
  const warnings = [];

  // Check required fields
  for (const [field, schema] of Object.entries(CSV_SCHEMA)) {
    if (schema.required && (!entry[field] || entry[field].toString().trim() === '')) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    const value = entry[field];
    if (!value) continue;

    // Type validation
    if (schema.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(`Field '${field}' must be a number, got: ${value}`);
      } else if (schema.min !== undefined && num < schema.min) {
        errors.push(`Field '${field}' must be >= ${schema.min}, got: ${num}`);
      } else if (schema.max !== undefined && num > schema.max) {
        warnings.push(`Field '${field}' is unusually high (${num} minutes). Consider breaking into smaller sessions.`);
      }
    }

    // Enum validation
    if (schema.type === 'enum' && !schema.values.includes(value)) {
      errors.push(`Field '${field}' must be one of: ${schema.values.join(', ')}, got: ${value}`);
    }

    // Pattern validation
    if (schema.pattern && !schema.pattern.test(value)) {
      errors.push(`Field '${field}' format invalid: ${value}`);
    }
  }

  // Business logic validation
  if (entry.session_id && entry.timestamp) {
    const sessionDate = entry.session_id.split('-').slice(0, 3).join('-');
    const timestampDate = entry.timestamp.split('T')[0];
    if (sessionDate !== timestampDate) {
      warnings.push(`Session ID date (${sessionDate}) doesn't match timestamp date (${timestampDate})`);
    }
  }

  // Content quality checks
  if (entry.achievements && entry.achievements.length < 10) {
    warnings.push('Achievements field seems too short. Consider adding more detail.');
  }

  if (entry.focus && entry.focus.length < 5) {
    warnings.push('Focus field seems too short. Consider being more specific.');
  }

  // Check for proper CSV escaping
  for (const [field, value] of Object.entries(entry)) {
    if (typeof value === 'string' && value.includes('"') && !value.startsWith('"')) {
      warnings.push(`Field '${field}' contains quotes but isn't properly escaped for CSV`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    entry: entry
  };
}

/**
 * Validate existing CSV file
 * @returns {Object} - Validation results for entire file
 */
function validateExistingFile() {
  if (!fs.existsSync(SESSIONS_FILE)) {
    return { success: false, error: 'SESSIONS.csv file not found' };
  }

  try {
    const content = fs.readFileSync(SESSIONS_FILE, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      return { success: false, error: 'Empty CSV file' };
    }

    const headers = lines[0].split(',');
    const results = [];
    
    // Validate headers
    const headerErrors = [];
    CSV_HEADERS.forEach(expectedHeader => {
      if (!headers.includes(expectedHeader)) {
        headerErrors.push(`Missing header: ${expectedHeader}`);
      }
    });

    if (headerErrors.length > 0) {
      return { success: false, error: 'Header validation failed', details: headerErrors };
    }

    // Validate each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });

        const validation = validateEntry(entry);
        results.push({
          lineNumber: i + 1,
          sessionId: entry.session_id,
          ...validation
        });
      } catch (error) {
        results.push({
          lineNumber: i + 1,
          success: false,
          errors: [`Failed to parse line: ${error.message}`]
        });
      }
    }

    const totalErrors = results.reduce((sum, r) => sum + (r.errors?.length || 0), 0);
    const totalWarnings = results.reduce((sum, r) => sum + (r.warnings?.length || 0), 0);

    return {
      success: totalErrors === 0,
      totalEntries: results.length,
      totalErrors,
      totalWarnings,
      results
    };
  } catch (error) {
    return { success: false, error: `Failed to read file: ${error.message}` };
  }
}

/**
 * Parse CSV line handling quotes and commas properly
 * @param {string} line - CSV line to parse
 * @returns {Array} - Array of field values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Create properly escaped CSV entry
 * @param {Object} entry - Entry object
 * @returns {string} - CSV formatted line
 */
function formatCSVEntry(entry) {
  return CSV_HEADERS.map(header => {
    const value = entry[header] || '';
    const stringValue = value.toString();
    
    // Escape quotes and wrap in quotes if contains comma or quote
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }).join(',');
}

/**
 * Add new session entry to CSV file
 * @param {Object} entry - Session entry to add
 * @returns {Object} - Operation result
 */
function addSession(entry) {
  const validation = validateEntry(entry);
  
  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      errors: validation.errors,
      warnings: validation.warnings
    };
  }

  try {
    // Check if file exists and has headers
    let needsHeaders = false;
    if (!fs.existsSync(SESSIONS_FILE)) {
      needsHeaders = true;
    } else {
      const content = fs.readFileSync(SESSIONS_FILE, 'utf8');
      needsHeaders = content.trim().length === 0;
    }

    // Prepare content to append
    let contentToAdd = '';
    if (needsHeaders) {
      contentToAdd = CSV_HEADERS.join(',') + '\n';
    }
    contentToAdd += formatCSVEntry(entry) + '\n';

    // Append to file
    fs.appendFileSync(SESSIONS_FILE, contentToAdd);

    return {
      success: true,
      message: 'Session added successfully',
      warnings: validation.warnings,
      entry: entry
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to write to file: ${error.message}`
    };
  }
}

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'validate':
      console.log('🔍 Validating existing SESSIONS.csv...\n');
      const result = validateExistingFile();
      
      if (result.success) {
        console.log(`✅ Validation passed!`);
        console.log(`📊 Total entries: ${result.totalEntries}`);
        if (result.totalWarnings > 0) {
          console.log(`⚠️  Warnings: ${result.totalWarnings}`);
          result.results.forEach(r => {
            if (r.warnings?.length > 0) {
              console.log(`   Line ${r.lineNumber} (${r.sessionId}):`);
              r.warnings.forEach(w => console.log(`     - ${w}`));
            }
          });
        }
      } else {
        console.log('❌ Validation failed!');
        console.log(`Error: ${result.error}`);
        if (result.details) {
          result.details.forEach(detail => console.log(`  - ${detail}`));
        }
        if (result.results) {
          result.results.forEach(r => {
            if (r.errors?.length > 0) {
              console.log(`\nLine ${r.lineNumber} (${r.sessionId || 'unknown'}):`);
              r.errors.forEach(e => console.log(`  ❌ ${e}`));
            }
          });
        }
        process.exit(1);
      }
      break;

    case 'add':
      console.log('📝 Interactive session entry...\n');
      // TODO: Implement interactive CLI for adding sessions
      console.log('Use: node validate-session.js add-json \'{"session_id":"...","timestamp":"..."}\'');
      break;

    case 'add-json':
      if (!args[1]) {
        console.log('❌ Please provide JSON entry as second argument');
        process.exit(1);
      }
      
      try {
        const entry = JSON.parse(args[1]);
        const result = addSession(entry);
        
        if (result.success) {
          console.log('✅ Session added successfully!');
          if (result.warnings?.length > 0) {
            console.log('\n⚠️  Warnings:');
            result.warnings.forEach(w => console.log(`  - ${w}`));
          }
        } else {
          console.log('❌ Failed to add session');
          console.log(`Error: ${result.error}`);
          if (result.errors) {
            result.errors.forEach(e => console.log(`  - ${e}`));
          }
          process.exit(1);
        }
      } catch (error) {
        console.log(`❌ Invalid JSON: ${error.message}`);
        process.exit(1);
      }
      break;

    default:
      console.log('Session CSV Validation Tool\n');
      console.log('Usage:');
      console.log('  node validate-session.js validate          # Validate existing CSV');
      console.log('  node validate-session.js add               # Interactive session entry');
      console.log('  node validate-session.js add-json \'...\' # Add session from JSON');
      console.log('\nExample JSON:');
      console.log('  {');
      console.log('    "session_id": "2025-05-26-example",');
      console.log('    "timestamp": "2025-05-26T10:00:00Z",');
      console.log('    "developer": "harshit-codes",');
      console.log('    "status": "completed",');
      console.log('    "focus": "Session validation system",');
      console.log('    "achievements": "Created validation scripts",');
      console.log('    "blockers": "None",');
      console.log('    "next_steps": "Test with real data",');
      console.log('    "files_changed": "docs/scripts/validate-session.js",');
      console.log('    "learnings": "CSV validation prevents data quality issues",');
      console.log('    "notes": "Foundation for better session tracking",');
      console.log('    "duration_mins": 60');
      console.log('  }');
  }
}

module.exports = {
  validateEntry,
  validateExistingFile,
  addSession,
  formatCSVEntry,
  CSV_SCHEMA,
  CSV_HEADERS
};
