#!/usr/bin/env node

/**
 * Embed Metadata in SVG
 *
 * Embeds evaluation metadata into SVG files as single source of truth.
 *
 * Usage:
 *   node scripts/embed-metadata.js <case_id> [options]
 *   node scripts/embed-metadata.js --all
 *
 * Options:
 *   --all                Process all cases
 *   --validate           Validate after embedding
 *   --backup             Create backup before modifying
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const processAll = args.includes('--all');
const validate = args.includes('--validate');
const backup = args.includes('--backup');

console.log('VCSCI Metadata Embedding');
console.log('========================\n');

if (!processAll && args.length === 0) {
  console.error('Usage: node scripts/embed-metadata.js <case_id> [--validate] [--backup]');
  console.error('   or: node scripts/embed-metadata.js --all');
  process.exit(1);
}

// Get list of cases to process
const cases = processAll
  ? getAllCases()
  : [args[0]];

console.log(`Processing ${cases.length} case(s)...\n`);

let successCount = 0;
let errorCount = 0;

cases.forEach(caseId => {
  try {
    embedMetadataForCase(caseId);
    successCount++;
    console.log(`✓ ${caseId}`);
  } catch (error) {
    errorCount++;
    console.error(`✗ ${caseId}: ${error.message}`);
  }
});

console.log(`\nResults:`);
console.log(`  Success: ${successCount}`);
console.log(`  Errors: ${errorCount}`);

// Functions

function getAllCases() {
  if (!fs.existsSync('cases')) {
    return [];
  }
  return fs.readdirSync('cases')
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function embedMetadataForCase(caseId) {
  // Load case metadata
  const casePath = `cases/${caseId}.json`;
  if (!fs.existsSync(casePath)) {
    throw new Error('Case metadata not found');
  }
  const caseData = JSON.parse(fs.readFileSync(casePath, 'utf8'));

  // Load SVG
  const svgPath = `pictograms/${caseId}/output.svg`;
  if (!fs.existsSync(svgPath)) {
    throw new Error('SVG file not found');
  }

  // Backup if requested
  if (backup) {
    fs.copyFileSync(svgPath, `${svgPath}.backup`);
  }

  let svgContent = fs.readFileSync(svgPath, 'utf8');

  // Build complete metadata
  const metadata = buildCompleteMetadata(caseData);

  // Check if metadata already exists
  if (svgContent.includes('<metadata>')) {
    // Update existing metadata
    svgContent = updateExistingMetadata(svgContent, metadata);
  } else {
    // Insert new metadata
    svgContent = insertMetadata(svgContent, metadata);
  }

  // Add data attributes to svg element
  svgContent = addDataAttributes(svgContent, metadata);

  // Write back
  fs.writeFileSync(svgPath, svgContent, 'utf8');

  // Also save sidecar JSON for easy access
  const metadataPath = `pictograms/${caseId}/metadata.json`;
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf8');

  // Validate if requested
  if (validate) {
    validateEmbeddedMetadata(svgPath, metadata);
  }
}

function buildCompleteMetadata(caseData) {
  return {
    vcsci: {
      version: '1.0.0',
      case_id: caseData.case_id,
      phrase_id: caseData.phrase_id,
      chain_of_thought: {
        '1_input': {
          phrase: caseData.phrase,
          style_profile_id: caseData.style_profile_id,
          pipeline_version: caseData.pipeline_version
        },
        '2_generation': {
          model: caseData.model_name,
          timestamp: caseData.generation_timestamp,
          parameters: caseData.generation_params || {}
        },
        '3_evaluation': caseData.evaluation || null,
        '4_provenance': {
          created_by: `VCSCI Pipeline ${caseData.pipeline_version}`,
          created_at: caseData.generation_timestamp,
          iteration: caseData.iteration_number || 1,
          parent_case_id: caseData.parent_case_id || null
        }
      }
    }
  };
}

function insertMetadata(svgContent, metadata) {
  // Find the end of the opening <svg> tag
  const svgTagEnd = svgContent.indexOf('>');
  if (svgTagEnd === -1) {
    throw new Error('Invalid SVG: no opening tag found');
  }

  const metadataXML = `
  <metadata>
    <vcsci:metadata xmlns:vcsci="https://vcsci.org/schema/v1">
      <![CDATA[
${JSON.stringify(metadata, null, 2)}
      ]]>
    </vcsci:metadata>
  </metadata>
`;

  return svgContent.slice(0, svgTagEnd + 1) + metadataXML + svgContent.slice(svgTagEnd + 1);
}

function updateExistingMetadata(svgContent, metadata) {
  // Replace existing CDATA content
  const cdataRegex = /<!\[CDATA\[([\s\S]*?)\]\]>/;
  const newCDATA = `<![CDATA[\n${JSON.stringify(metadata, null, 2)}\n      ]]>`;
  return svgContent.replace(cdataRegex, newCDATA);
}

function addDataAttributes(svgContent, metadata) {
  const evaluation = metadata.vcsci.chain_of_thought['3_evaluation'];
  const vcsciScore = evaluation?.vcsci_score || 0;
  const decision = evaluation?.decision || 'pending';

  // Add data attributes to <svg> tag
  const svgTagRegex = /<svg([^>]*)>/;
  const match = svgContent.match(svgTagRegex);

  if (!match) return svgContent;

  let attrs = match[1];

  // Remove existing data attributes
  attrs = attrs.replace(/\s+data-case-id="[^"]*"/g, '');
  attrs = attrs.replace(/\s+data-vcsci-score="[^"]*"/g, '');
  attrs = attrs.replace(/\s+data-decision="[^"]*"/g, '');
  attrs = attrs.replace(/\s+data-vcsci-certified="[^"]*"/g, '');

  // Add new data attributes
  attrs += ` data-case-id="${metadata.vcsci.case_id}"`;
  attrs += ` data-vcsci-score="${vcsciScore.toFixed(2)}"`;
  attrs += ` data-decision="${decision}"`;
  if (decision === 'accept') {
    attrs += ` data-vcsci-certified="true"`;
  }

  return svgContent.replace(svgTagRegex, `<svg${attrs}>`);
}

function validateEmbeddedMetadata(svgPath, expectedMetadata) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // Check data attributes
  if (!svgContent.includes(`data-case-id="${expectedMetadata.vcsci.case_id}"`)) {
    throw new Error('Validation failed: case_id data attribute missing');
  }

  // Check metadata element
  if (!svgContent.includes('<metadata>')) {
    throw new Error('Validation failed: metadata element missing');
  }

  // Check CDATA
  if (!svgContent.includes('<![CDATA[')) {
    throw new Error('Validation failed: CDATA section missing');
  }

  // Parse embedded JSON
  const cdataMatch = svgContent.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (!cdataMatch) {
    throw new Error('Validation failed: could not extract CDATA content');
  }

  try {
    const embedded = JSON.parse(cdataMatch[1]);
    if (embedded.vcsci.case_id !== expectedMetadata.vcsci.case_id) {
      throw new Error('Validation failed: case_id mismatch');
    }
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
}
