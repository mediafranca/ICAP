#!/usr/bin/env node

/**
 * Validate Chain of Thought Integrity
 *
 * Validates that all pictograms have valid metadata and that
 * the chain of thought is complete and consistent.
 *
 * Usage:
 *   node scripts/validate-chain.js [case_id]
 *   node scripts/validate-chain.js --all
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const validateAll = args.includes('--all');
const specificCase = !validateAll && args.length > 0 ? args[0] : null;

console.log('VCSCI Chain of Thought Validation');
console.log('==================================\n');

// Get cases to validate
const cases = validateAll
  ? getAllCases()
  : specificCase
  ? [specificCase]
  : getAllCases();

if (cases.length === 0) {
  console.log('No cases found to validate.');
  process.exit(0);
}

console.log(`Validating ${cases.length} case(s)...\n`);

const results = {
  passed: [],
  failed: [],
  warnings: []
};

cases.forEach(caseId => {
  try {
    const issues = validateCase(caseId);

    if (issues.errors.length > 0) {
      results.failed.push({ caseId, issues });
      console.log(`✗ ${caseId} - ${issues.errors.length} error(s)`);
      issues.errors.forEach(err => console.log(`  ↳ ${err}`));
    } else if (issues.warnings.length > 0) {
      results.warnings.push({ caseId, issues });
      console.log(`⚠ ${caseId} - ${issues.warnings.length} warning(s)`);
      issues.warnings.forEach(warn => console.log(`  ↳ ${warn}`));
    } else {
      results.passed.push(caseId);
      console.log(`✓ ${caseId}`);
    }
  } catch (error) {
    results.failed.push({ caseId, issues: { errors: [error.message], warnings: [] } });
    console.log(`✗ ${caseId} - Exception: ${error.message}`);
  }
});

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log('Summary:');
console.log(`  Passed:   ${results.passed.length}`);
console.log(`  Warnings: ${results.warnings.length}`);
console.log(`  Failed:   ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log('\nFailed cases:');
  results.failed.forEach(({ caseId, issues }) => {
    console.log(`  ${caseId}:`);
    issues.errors.forEach(err => console.log(`    - ${err}`));
  });
  process.exit(1);
}

process.exit(0);

// Helper functions

function getAllCases() {
  if (!fs.existsSync('cases')) return [];
  return fs.readdirSync('cases')
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function validateCase(caseId) {
  const issues = {
    errors: [],
    warnings: []
  };

  // 1. Check case metadata exists
  const casePath = `cases/${caseId}.json`;
  if (!fs.existsSync(casePath)) {
    issues.errors.push('Case metadata file missing');
    return issues;
  }

  let caseData;
  try {
    caseData = JSON.parse(fs.readFileSync(casePath, 'utf8'));
  } catch (error) {
    issues.errors.push(`Invalid JSON in case metadata: ${error.message}`);
    return issues;
  }

  // 2. Check SVG exists
  const svgPath = `pictograms/${caseId}/output.svg`;
  if (!fs.existsSync(svgPath)) {
    issues.errors.push('SVG file missing');
  } else {
    // 3. Check metadata in SVG
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    if (!svgContent.includes('data-case-id')) {
      issues.warnings.push('SVG missing data-case-id attribute');
    }

    if (!svgContent.includes('<metadata>')) {
      issues.warnings.push('SVG missing metadata element');
    } else {
      // Validate embedded metadata
      const cdataMatch = svgContent.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
      if (!cdataMatch) {
        issues.errors.push('SVG metadata element present but CDATA missing');
      } else {
        try {
          const embedded = JSON.parse(cdataMatch[1]);

          // Check case_id matches
          if (embedded.vcsci?.case_id !== caseId) {
            issues.errors.push(`case_id mismatch: expected ${caseId}, got ${embedded.vcsci?.case_id}`);
          }

          // Check chain of thought structure
          const cot = embedded.vcsci?.chain_of_thought;
          if (!cot) {
            issues.errors.push('Missing chain_of_thought in metadata');
          } else {
            if (!cot['1_input']) issues.errors.push('Missing 1_input in chain');
            if (!cot['2_generation']) issues.errors.push('Missing 2_generation in chain');
            if (!cot['3_evaluation']) issues.warnings.push('Missing 3_evaluation in chain');
            if (!cot['4_provenance']) issues.errors.push('Missing 4_provenance in chain');
          }
        } catch (error) {
          issues.errors.push(`Invalid JSON in embedded metadata: ${error.message}`);
        }
      }
    }
  }

  // 4. Check sidecar metadata
  const sidecarPath = `pictograms/${caseId}/metadata.json`;
  if (fs.existsSync(sidecarPath)) {
    try {
      const sidecar = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
      if (sidecar.vcsci?.case_id !== caseId) {
        issues.errors.push('Sidecar metadata case_id mismatch');
      }
    } catch (error) {
      issues.errors.push(`Invalid JSON in sidecar metadata: ${error.message}`);
    }
  } else {
    issues.warnings.push('Sidecar metadata.json not found');
  }

  // 5. Validate parent references
  if (caseData.parent_case_id) {
    const parentPath = `cases/${caseData.parent_case_id}.json`;
    if (!fs.existsSync(parentPath)) {
      issues.errors.push(`Parent case ${caseData.parent_case_id} not found`);
    }
  }

  // 6. Check required fields
  const required = ['case_id', 'phrase_id', 'pipeline_version', 'style_profile_id'];
  required.forEach(field => {
    if (!caseData[field]) {
      issues.errors.push(`Missing required field: ${field}`);
    }
  });

  return issues;
}
