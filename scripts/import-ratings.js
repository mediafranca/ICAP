#!/usr/bin/env node

/**
 * Import Ratings from CSV
 *
 * Converts Google Sheets CSV export to individual rating JSON files
 * following the RatingRecord schema.
 *
 * Usage:
 *   node scripts/import-ratings.js <csv-file> [options]
 *
 * Options:
 *   --output-dir <dir>    Output directory (default: ratings/)
 *   --batch-name <name>   Organize by batch subdirectory
 *   --validate            Validate against schema after import
 *
 * CSV Format:
 *   rating_id,case_id,evaluator_role,evaluation_date,evaluation_mode,
 *   clarity,recognizability,semantic_transparency,pragmatic_fit,
 *   cultural_adequacy,cognitive_accessibility,decision,
 *   required_edits,notes,duration_seconds
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Parse command line arguments
const args = process.argv.slice(2);
const csvFile = args[0];
const outputDir = getArg('--output-dir') || 'ratings';
const batchName = getArg('--batch-name');
const validate = args.includes('--validate');

if (!csvFile) {
  console.error('Usage: node scripts/import-ratings.js <csv-file> [options]');
  process.exit(1);
}

if (!fs.existsSync(csvFile)) {
  console.error(`Error: File not found: ${csvFile}`);
  process.exit(1);
}

// Read and parse CSV
console.log(`Reading CSV: ${csvFile}`);
const csvContent = fs.readFileSync(csvFile, 'utf8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim());
const rows = lines.slice(1);

console.log(`Found ${rows.length} rating records`);

// Determine output directory
const finalOutputDir = batchName
  ? path.join(outputDir, batchName)
  : outputDir;

if (!fs.existsSync(finalOutputDir)) {
  fs.mkdirSync(finalOutputDir, { recursive: true });
  console.log(`Created directory: ${finalOutputDir}`);
}

// Process each row
let successCount = 0;
let errorCount = 0;

rows.forEach((row, index) => {
  try {
    const values = parseCSVRow(row);
    const record = buildRatingRecord(headers, values);

    // Validate required fields
    if (!record.case_id || !record.evaluator_role || !record.decision) {
      throw new Error('Missing required fields');
    }

    // Generate rating_id if not provided
    if (!record.rating_id) {
      record.rating_id = `rating-${uuidv4()}`;
    }

    // Parse required_edits if it's a string
    if (typeof record.required_edits === 'string' && record.required_edits) {
      record.required_edits = parseRequiredEdits(record.required_edits);
    }

    // Write to file
    const filename = `${record.rating_id}.json`;
    const filepath = path.join(finalOutputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(record, null, 2) + '\n');

    successCount++;

  } catch (error) {
    console.error(`Error processing row ${index + 2}: ${error.message}`);
    errorCount++;
  }
});

console.log(`\nImport complete:`);
console.log(`  ✓ Success: ${successCount}`);
console.log(`  ✗ Errors: ${errorCount}`);

if (validate && successCount > 0) {
  console.log(`\nValidating against schema...`);
  // Run validation if ajv is available
  try {
    const { execSync } = require('child_process');
    execSync(`npx ajv validate -s schemas/rating-record.schema.json -d "${finalOutputDir}/*.json"`,
      { stdio: 'inherit' });
  } catch (error) {
    console.log('Note: Install ajv-cli for schema validation: npm install -g ajv-cli');
  }
}

// Helper functions

function getArg(flag) {
  const index = args.indexOf(flag);
  return index >= 0 && index < args.length - 1 ? args[index + 1] : null;
}

function parseCSVRow(row) {
  // Simple CSV parser (handles basic cases)
  // For complex CSVs with quoted fields, use a proper CSV library
  return row.split(',').map(v => v.trim());
}

function buildRatingRecord(headers, values) {
  const record = {};

  headers.forEach((header, i) => {
    const value = values[i];

    // Skip empty values
    if (!value || value === '') return;

    // Convert numeric fields
    if (['clarity', 'recognizability', 'semantic_transparency', 'pragmatic_fit',
         'cultural_adequacy', 'cognitive_accessibility', 'duration_seconds'].includes(header)) {
      const num = parseInt(value);
      if (!isNaN(num)) {
        record[header] = num;
      }
      return;
    }

    // Store as-is
    record[header] = value;
  });

  // Ensure ratings object exists
  if (!record.ratings) {
    record.ratings = {};
  }

  // Move rating fields into ratings object
  ['clarity', 'recognizability', 'semantic_transparency', 'pragmatic_fit',
   'cultural_adequacy', 'cognitive_accessibility'].forEach(dim => {
    if (record[dim] !== undefined) {
      record.ratings[dim] = record[dim];
      delete record[dim];
    }
  });

  // Initialize empty required_edits if not present
  if (!record.required_edits) {
    record.required_edits = [];
  }

  return record;
}

function parseRequiredEdits(editsString) {
  // Parse required_edits from string format
  // Expected format: "category: description (priority); category: description (priority)"

  if (!editsString || editsString === '[]') return [];

  try {
    // Try parsing as JSON first
    return JSON.parse(editsString);
  } catch {
    // Parse as semicolon-separated list
    return editsString.split(';').map(edit => {
      const parts = edit.trim().match(/^(\w+):\s*(.+?)\s*\((\w+)\)$/);
      if (parts) {
        return {
          category: parts[1],
          description: parts[2],
          priority: parts[3]
        };
      }
      return {
        category: 'other',
        description: edit.trim(),
        priority: 'important'
      };
    }).filter(e => e.description);
  }
}
