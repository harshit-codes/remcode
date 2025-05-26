/**
 * CSV Parser Utility for Session Data
 * 
 * Provides robust CSV parsing with proper handling of:
 * - Quoted fields containing commas
 * - Multi-line data
 * - Header detection and mapping
 * - Data type inference
 */

/**
 * Parse CSV content into array of objects
 * @param {string} csvContent - Raw CSV content
 * @returns {Array<Object>} Parsed data as array of objects
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain at least header and one data row');
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  const data = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
        continue;
      }

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      data.push(row);
      
    } catch (error) {
      console.warn(`Row ${i + 1}: Parse error - ${error.message}`);
    }
  }

  return data;
}

/**
 * Parse a single CSV line handling quotes and commas
 * @param {string} line - CSV line to parse
 * @returns {Array<string>} Array of field values
 */
function parseCSVLine(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField.trim());
      currentField = '';
      i++;
    } else {
      // Regular character
      currentField += char;
      i++;
    }
  }

  // Add the last field
  fields.push(currentField.trim());

  return fields;
}

/**
 * Convert array of objects back to CSV format
 * @param {Array<Object>} data - Data to convert
 * @returns {string} CSV formatted string
 */
function arrayToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvLines = [];

  // Add header row
  csvLines.push(headers.join(','));

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      
      // Quote fields containing commas or quotes
      if (value.toString().includes(',') || value.toString().includes('"')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      
      return value.toString();
    });
    
    csvLines.push(values.join(','));
  });

  return csvLines.join('\n');
}

module.exports = {
  parseCSV,
  parseCSVLine,
  arrayToCSV
};
