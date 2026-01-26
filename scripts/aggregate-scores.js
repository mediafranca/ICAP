#!/usr/bin/env node

/**
 * Aggregate Scores
 *
 * Aggregates case scores by phrase_id, pipeline_version, and style_profile_id
 * for model-level evaluation.
 *
 * Usage:
 *   node scripts/aggregate-scores.js [options]
 *
 * Options:
 *   --scores <file>        Input case scores (default: analysis/results/case-scores.json)
 *   --phrases-output       Output by phrase (default: analysis/results/phrase-aggregates.json)
 *   --pipeline-output      Output by pipeline (default: analysis/results/pipeline-comparison.json)
 *   --summary-output       Summary statistics (default: analysis/results/summary-stats.json)
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const scoresFile = getArg('--scores') || 'analysis/results/case-scores.json';
const phrasesOutput = getArg('--phrases-output') || 'analysis/results/phrase-aggregates.json';
const pipelineOutput = getArg('--pipeline-output') || 'analysis/results/pipeline-comparison.json';
const summaryOutput = getArg('--summary-output') || 'analysis/results/summary-stats.json';

console.log('VCSCI Score Aggregation');
console.log('=======================\n');

// Load case scores
if (!fs.existsSync(scoresFile)) {
  console.error(`Error: Scores file not found: ${scoresFile}`);
  console.log('Run "node scripts/score-cases.js" first to generate case scores.');
  process.exit(1);
}

console.log(`Loading scores from: ${scoresFile}`);
const caseScores = JSON.parse(fs.readFileSync(scoresFile, 'utf8'));
const caseIds = Object.keys(caseScores);
console.log(`Loaded ${caseIds.length} case scores\n`);

// Parse case_ids to extract phrase_id, pipeline_version, style_profile_id
const parsedCases = caseIds.map(caseId => {
  const parts = caseId.split('_');
  return {
    case_id: caseId,
    phrase_id: parts[0],
    pipeline_version: parts[1],
    style_profile_id: parts[2],
    variant: parts[3],
    ...caseScores[caseId]
  };
});

// Aggregate by phrase_id
console.log('Aggregating by phrase_id...');
const byPhrase = aggregateBy(parsedCases, 'phrase_id');
saveJSON(phrasesOutput, byPhrase);
console.log(`  → ${phrasesOutput}`);

// Aggregate by pipeline_version
console.log('Aggregating by pipeline_version...');
const byPipeline = aggregateBy(parsedCases, 'pipeline_version');
saveJSON(pipelineOutput, byPipeline);
console.log(`  → ${pipelineOutput}`);

// Generate summary statistics
console.log('Computing summary statistics...');
const summary = computeSummary(parsedCases, byPhrase, byPipeline);
saveJSON(summaryOutput, summary);
console.log(`  → ${summaryOutput}`);

console.log('\nAggregation complete!\n');

// Display summary
console.log('Summary Statistics:');
console.log(`  Total cases: ${summary.total_cases}`);
console.log(`  Unique phrases: ${summary.unique_phrases}`);
console.log(`  Pipeline versions: ${summary.pipeline_versions.join(', ')}`);
console.log(`  Average VCSCI: ${summary.overall_vcsci_mean.toFixed(2)}`);
console.log(`  Accept rate: ${(summary.acceptance_rate * 100).toFixed(1)}%`);

// Helper functions

function getArg(flag) {
  const index = args.indexOf(flag);
  return index >= 0 && index < args.length - 1 ? args[index + 1] : null;
}

function aggregateBy(cases, groupBy) {
  const groups = {};

  cases.forEach(c => {
    const key = c[groupBy];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(c);
  });

  const aggregated = {};

  Object.keys(groups).forEach(key => {
    const groupCases = groups[key];

    aggregated[key] = {
      [groupBy]: key,
      num_cases: groupCases.length,
      vcsci_scores: {
        mean: mean(groupCases.map(c => c.vcsci_score)),
        median: median(groupCases.map(c => c.vcsci_score)),
        std: standardDeviation(groupCases.map(c => c.vcsci_score)),
        min: Math.min(...groupCases.map(c => c.vcsci_score)),
        max: Math.max(...groupCases.map(c => c.vcsci_score))
      },
      decision_distribution: countDecisions(groupCases),
      top_required_edits: aggregateRequiredEdits(groupCases).slice(0, 10),
      cases: groupCases.map(c => c.case_id)
    };
  });

  return aggregated;
}

function countDecisions(cases) {
  const counts = {};
  cases.forEach(c => {
    counts[c.decision] = (counts[c.decision] || 0) + 1;
  });
  return counts;
}

function aggregateRequiredEdits(cases) {
  const editCounts = {};

  cases.forEach(c => {
    if (c.required_edits && Array.isArray(c.required_edits)) {
      c.required_edits.forEach(edit => {
        const key = `${edit.category}: ${edit.description}`;
        if (!editCounts[key]) {
          editCounts[key] = { ...edit, count: 0 };
        }
        editCounts[key].count += edit.count || 1;
      });
    }
  });

  return Object.values(editCounts).sort((a, b) => b.count - a.count);
}

function computeSummary(cases, byPhrase, byPipeline) {
  const vcsciScores = cases.map(c => c.vcsci_score);
  const decisions = cases.map(c => c.decision);
  const acceptCount = decisions.filter(d => d === 'accept' || d === 'accept-with-edits').length;

  return {
    total_cases: cases.length,
    unique_phrases: Object.keys(byPhrase).length,
    pipeline_versions: [...new Set(cases.map(c => c.pipeline_version))],
    style_profiles: [...new Set(cases.map(c => c.style_profile_id))],
    overall_vcsci_mean: mean(vcsciScores),
    overall_vcsci_median: median(vcsciScores),
    overall_vcsci_std: standardDeviation(vcsciScores),
    acceptance_rate: acceptCount / cases.length,
    decision_distribution: countDecisions(cases),
    top_phrases_by_score: getTopPhrases(byPhrase, true),
    bottom_phrases_by_score: getTopPhrases(byPhrase, false),
    generated_at: new Date().toISOString()
  };
}

function getTopPhrases(byPhrase, highest = true) {
  const phrases = Object.entries(byPhrase).map(([id, data]) => ({
    phrase_id: id,
    vcsci_mean: data.vcsci_scores.mean
  }));

  phrases.sort((a, b) => highest
    ? b.vcsci_mean - a.vcsci_mean
    : a.vcsci_mean - b.vcsci_mean);

  return phrases.slice(0, 10);
}

function mean(values) {
  return values.length > 0
    ? values.reduce((sum, v) => sum + v, 0) / values.length
    : 0;
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
  const avg = mean(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  const variance = mean(squaredDiffs);
  return Math.sqrt(variance);
}

function saveJSON(filepath, data) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n');
}
