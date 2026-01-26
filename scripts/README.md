# Scripts Directory

This directory contains automation scripts for the VCSCI workflow.

## Available Scripts

### Generation

- `generate-cases.js` - Generate pictogram cases from phrase list
- `render-previews.js` - Create PNG previews from SVG files

### Data Import/Export

- `import-ratings.js` - Import ratings from Google Sheets CSV export
- `export-cases.js` - Export case definitions to various formats

### Analysis

- `score-cases.js` - Compute VCSCI scores for individual cases
- `aggregate-by-phrase.js` - Aggregate scores by phrase_id
- `aggregate-by-pipeline.js` - Compare pipeline versions
- `generate-report.js` - Create markdown evaluation reports

### Validation

- `validate-schema.js` - Validate all JSON files against schemas
- `check-consistency.js` - Check referential integrity (case_id references)

## Usage

Run scripts from the project root:

```bash
node scripts/script-name.js [arguments]
```

### Examples

```bash
# Import ratings from CSV
node scripts/import-ratings.js data/ratings-export.csv

# Compute scores for all cases
node scripts/score-cases.js

# Generate evaluation report
node scripts/generate-report.js --output analysis/reports/2025-01-15.md

# Validate all schemas
node scripts/validate-schema.js
```

## Dependencies

Scripts require Node.js 16+ and the following packages:

```bash
npm install ajv uuid fast-csv
```

Or use the provided package.json if available.

## Script Guidelines

When creating new scripts:

1. Use clear, descriptive names
2. Include usage instructions at the top of the file
3. Handle errors gracefully
4. Log progress for long-running operations
5. Output structured data (JSON) or markdown reports
6. Follow existing naming conventions
