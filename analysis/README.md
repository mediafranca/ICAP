# Analysis Directory

This directory contains analysis scripts and outputs.

## Structure

```
analysis/
├── results/           # Computed scores and statistics
├── reports/           # Human-readable reports
└── scripts/           # Analysis utilities (optional)
```

## Workflow

1. **Generate cases** → `cases/` and `pictograms/`
2. **Collect ratings** → `ratings/`
3. **Run analysis** → Compute scores
4. **Output results** → `analysis/results/`
5. **Generate reports** → `analysis/reports/`

## Results

The `results/` subdirectory contains computed data:

```
results/
├── case-scores.json          # Scores per case
├── phrase-aggregates.json    # Aggregated by phrase_id
├── pipeline-comparison.json  # Comparison across versions
└── summary-stats.json        # Overall statistics
```

## Reports

The `reports/` subdirectory contains markdown reports:

```
reports/
├── 2025-01-15-evaluation.md  # Dated evaluation report
├── top-issues.md             # Most common required edits
└── pipeline-v1.0.0.md        # Report for specific version
```

## Scripts

Run analysis scripts from the project root:

```bash
# Compute scores for individual cases
node scripts/score-cases.js

# Aggregate by phrase
node scripts/aggregate-by-phrase.js

# Generate markdown report
node scripts/generate-report.js
```

See [../scripts/README.md](../scripts/README.md) for details.
