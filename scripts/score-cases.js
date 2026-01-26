#!/usr/bin/env node

/**
 * Score Pictogram Cases
 *
 * Computes VCSCI scores for individual pictogram cases based on rating records.
 *
 * Usage:
 *   node scripts/score-cases.js [options]
 *
 * Options:
 *   --cases-dir <dir>      Cases directory (default: cases/)
 *   --ratings-dir <dir>    Ratings directory (default: ratings/)
 *   --output <file>        Output file (default: analysis/results/case-scores.json)
 *   --weights <file>       Custom dimension weights JSON file
 *
 * Output:
 *   JSON file with scores per case_id
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Default dimension weights (equal weighting)
const DEFAULT_WEIGHTS = {
  clarity: 1.0,
  recognizability: 1.0,
  semantic_transparency: 1.0,
  pragmatic_fit: 1.0,
  cultural_adequacy: 0.5,  // Optional dimension, lower weight
  cognitive_accessibility: 0.5  // Optional dimension, lower weight
};

// Parse arguments
const args = process.argv.slice(2);
const casesDir = getArg('--cases-dir') || 'cases';
const ratingsDir = getArg('--ratings-dir') || 'ratings';
const outputFile = getArg('--output') || 'analysis/results/case-scores.json';
const weightsFile = getArg('--weights');

const weights = weightsFile && fs.existsSync(weightsFile)
  ? JSON.parse(fs.readFileSync(weightsFile, 'utf8'))
  : DEFAULT_WEIGHTS;

console.log('VCSCI Case Scoring');
console.log('==================\n');

// Load all rating files
console.log(`Loading ratings from: ${ratingsDir}`);
const ratingFiles = glob.sync(`${ratingsDir}/**/*.json`);
const ratings = ratingFiles.map(file => JSON.parse(fs.readFileSync(file, 'utf8')));
console.log(`Loaded ${ratings.length} rating records\n`);

// Group ratings by case_id
const ratingsByCase = {};
ratings.forEach(rating => {
  const caseId = rating.case_id;
  if (!ratingsByCase[caseId]) {
    ratingsByCase[caseId] = [];
  }
  ratingsByCase[caseId].push(rating);
});

console.log(`Found ratings for ${Object.keys(ratingsByCase).length} cases\n`);

// Compute scores for each case
const caseScores = {};
const caseIds = Object.keys(ratingsByCase);

caseIds.forEach(caseId => {
  const caseRatings = ratingsByCase[caseId];

  // Aggregate ratings across evaluators
  const aggregatedRatings = aggregateRatings(caseRatings);

  // Compute composite VCSCI score
  const vcsciScore = computeVCSCIScore(aggregatedRatings, weights);

  // Determine consensus decision
  const decision = determineConsensusDecision(caseRatings);

  // Collect all required edits
  const requiredEdits = collectRequiredEdits(caseRatings);

  caseScores[caseId] = {
    case_id: caseId,
    num_evaluators: caseRatings.length,
    ratings: aggregatedRatings,
    vcsci_score: vcsciScore,
    decision,
    required_edits: requiredEdits,
    evaluator_roles: [...new Set(caseRatings.map(r => r.evaluator_role))]
  };

  console.log(`${caseId}: VCSCI = ${vcsciScore.toFixed(2)}, Decision = ${decision}`);
});

// Save results
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(caseScores, null, 2) + '\n');

console.log(`\nResults saved to: ${outputFile}`);
console.log(`\nSummary:`);
console.log(`  Total cases scored: ${caseIds.length}`);
console.log(`  Average VCSCI score: ${(Object.values(caseScores).reduce((sum, c) => sum + c.vcsci_score, 0) / caseIds.length).toFixed(2)}`);

// Helper functions

function getArg(flag) {
  const index = args.indexOf(flag);
  return index >= 0 && index < args.length - 1 ? args[index + 1] : null;
}

function aggregateRatings(caseRatings) {
  // Compute mean for each dimension across evaluators
  const dimensions = ['clarity', 'recognizability', 'semantic_transparency',
                      'pragmatic_fit', 'cultural_adequacy', 'cognitive_accessibility'];

  const aggregated = {};

  dimensions.forEach(dim => {
    const values = caseRatings
      .map(r => r.ratings[dim])
      .filter(v => v !== undefined && v !== null && !isNaN(v));

    if (values.length > 0) {
      aggregated[dim] = {
        mean: values.reduce((sum, v) => sum + v, 0) / values.length,
        median: median(values),
        std: standardDeviation(values),
        min: Math.min(...values),
        max: Math.max(...values),
        n: values.length
      };
    }
  });

  return aggregated;
}

function computeVCSCIScore(aggregatedRatings, weights) {
  // Weighted average of dimension means
  let weightedSum = 0;
  let totalWeight = 0;

  Object.keys(weights).forEach(dim => {
    if (aggregatedRatings[dim]) {
      weightedSum += aggregatedRatings[dim].mean * weights[dim];
      totalWeight += weights[dim];
    }
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

function determineConsensusDecision(caseRatings) {
  // Count decisions
  const decisions = {};
  caseRatings.forEach(r => {
    decisions[r.decision] = (decisions[r.decision] || 0) + 1;
  });

  // Return majority decision
  const sorted = Object.entries(decisions).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

function collectRequiredEdits(caseRatings) {
  // Aggregate all required edits and count frequency
  const editCounts = {};

  caseRatings.forEach(rating => {
    if (rating.required_edits && Array.isArray(rating.required_edits)) {
      rating.required_edits.forEach(edit => {
        const key = `${edit.category}: ${edit.description}`;
        if (!editCounts[key]) {
          editCounts[key] = {
            category: edit.category,
            description: edit.description,
            priority: edit.priority || 'important',
            count: 0
          };
        }
        editCounts[key].count++;
      });
    }
  });

  // Return sorted by frequency
  return Object.values(editCounts).sort((a, b) => b.count - a.count);
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function standardDeviation(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.sqrt(variance);
}
