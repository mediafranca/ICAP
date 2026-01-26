# Version Control Strategy

This document defines version control practices for the VCSCI project, covering code, data, and results.

## Overview

The VCSCI repository contains multiple types of artifacts that evolve at different rates:

- **Code**: Scripts, schemas, documentation
- **Data**: Phrase lists, case definitions, ratings
- **Results**: Analysis outputs, scores, reports
- **Generated artifacts**: Pictograms (SVG), previews (PNG)

## Semantic Versioning

### Project Versions

The VCSCI framework itself follows semantic versioning (SemVer):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes to data structures or methodology
- **MINOR**: New features, new evaluation dimensions, expanded phrase lists
- **PATCH**: Bug fixes, documentation updates, minor improvements

**Current version**: `0.1.0` (initial release with model-level evaluation)

**Next version**: `1.0.0` (adds pictogram-level evaluation framework)

### Component Versioning

Different components have independent versions:

| Component | Current Version | Versioning Scheme |
|-----------|----------------|-------------------|
| Phrase lists | 0.1.0 | SemVer |
| Evaluation rubric | 1.0.0 | SemVer |
| Data schemas | 1.0.0 | SemVer |
| Style profiles | Per-profile (e.g., default-v1) | Profile versioning |
| Pipeline | Per-deployment (e.g., v1.0.0) | SemVer |

## What to Version in Git

### ✅ Always Commit

**Code and Documentation**
- Scripts (`.js`, `.py`, etc.)
- Schemas (`.json` in `schemas/`)
- Documentation (`.md` files)
- Configuration files
- Style profiles

**Phrase Lists**
- All `core-phrase-list-*.json` files
- Phrase IDs are stable and immutable

**Metadata**
- Case definitions (`cases/*.json`)
- Anonymized ratings (`ratings/*.json`)
- Analysis results (`analysis/results/*.json`)

**Examples**
- Toy datasets for testing
- Example pictograms (small, representative set)

### ⚠️ Conditionally Commit

**Generated Pictograms (SVG)**

Small datasets (< 50 files, < 10 MB total):
```bash
git add pictograms/
```

Medium datasets (50-200 files):
```bash
git lfs track "*.svg"
git add .gitattributes pictograms/
```

Large datasets (> 200 files or > 50 MB):
- Store externally (S3, institutional repository, Zenodo)
- Commit only metadata and README with download instructions

**Preview Images (PNG)**

Generally do NOT commit previews:
```gitignore
pictograms/*/preview.png
```

Generate locally as needed:
```bash
node scripts/render-previews.js
```

Exception: Commit a few example previews for documentation.

### ❌ Never Commit

- **Credentials**: API keys, tokens, passwords
- **Raw survey data**: Before anonymization
- **Personal information**: Names, emails, identifiers
- **Temporary files**: Logs, caches, `.DS_Store`
- **Large binaries**: Videos, high-res images (use LFS or external storage)

## .gitignore

The repository should include:

```gitignore
# Credentials and secrets
*.key
*.pem
credentials.json
.env

# Raw/unsanitized data
raw-data/
private/
tmp/

# Generated previews
pictograms/*/preview.png
pictograms/*/preview.jpg

# Analysis cache
analysis/.cache/
*.tmp.json

# System files
.DS_Store
Thumbs.db

# Node
node_modules/
npm-debug.log

# Python
__pycache__/
*.pyc
.venv/

# Editor
.vscode/
.idea/
*.swp
```

## Git LFS Configuration

For medium-sized datasets:

```bash
# Install Git LFS
git lfs install

# Track SVG files
git lfs track "*.svg"
git lfs track "pictograms/**/*.svg"

# Commit .gitattributes
git add .gitattributes
git commit -m "Configure Git LFS for SVG files"
```

## Branch Strategy

### Main Branches

- **`main`**: Stable releases, tagged versions
- **Feature branches**: `feature/descriptive-name`
- **Hotfixes**: `hotfix/issue-description`

### Workflow

1. Create feature branch from `main`
2. Develop and test
3. Submit pull request
4. Review and merge to `main`
5. Tag releases on `main`

### Example

```bash
# Create feature branch
git checkout -b single-pictogram-evaluation

# Make changes
git add .
git commit -m "Add pictogram-level evaluation framework"

# Push to remote
git push -u origin single-pictogram-evaluation

# Create PR on GitHub
# After approval, merge to main
```

## Tagging Releases

Use annotated tags for releases:

```bash
# Tag a release
git tag -a v1.0.0 -m "Release v1.0.0: Pictogram-level evaluation framework"

# Push tags to remote
git push --tags
```

### Release Checklist

Before tagging a release:

- [ ] Update version in documentation
- [ ] Update CHANGELOG.md
- [ ] Run all tests and validation scripts
- [ ] Review and merge all pending PRs
- [ ] Update README.md if needed
- [ ] Create GitHub release with notes

## Dataset Versioning

### Phrase Lists

**Version changes:**
- **Major**: Remove or fundamentally change existing phrases
- **Minor**: Add new phrases or categories
- **Patch**: Fix typos, improve translations

**Immutability**: Once assigned, `phrase_id` values never change, even if text is updated.

**Example**:
```
v0.1.0: Initial 115 phrases (req-001 through ask-015)
v0.2.0: Add 20 new phrases (int-016 through int-035)
v1.0.0: Restructure categories (breaking change)
```

### Case Metadata

Case definitions are **immutable once created**:
- `case_id` never changes
- To fix errors, create new case with incremented `iteration_number`
- Keep original for reproducibility

### Ratings

Rating records are **append-only**:
- Never edit existing rating files
- Add new ratings as new files
- Analysis scripts aggregate all ratings per case

### Analysis Results

Results should be **reproducible**:
- Include generation timestamp
- Reference input data versions
- Document script versions used

## External Data Storage

For large datasets not suitable for git:

### Option 1: Institutional Repository

Upload to your institution's data repository:
- Includes DOI for citation
- Long-term preservation
- Metadata required

### Option 2: Zenodo

Upload to Zenodo.org:
```bash
# Create archive
tar -czf vcsci-pictograms-v1.0.0.tar.gz pictograms/

# Upload to Zenodo
# Obtain DOI
# Update README with download link
```

### Option 3: Object Storage (S3, etc.)

For active development:
```bash
# Sync to S3
aws s3 sync pictograms/ s3://vcsci-data/pictograms/

# Document in README
echo "Download pictograms from: s3://vcsci-data/pictograms/" >> pictograms/README.md
```

## Reproducibility

### Recording Context

Every analysis result should include:

```json
{
  "analysis_version": "1.0.0",
  "input_data": {
    "phrase_list_version": "0.1.0",
    "num_cases": 100,
    "num_ratings": 250
  },
  "scripts": {
    "score_cases": "score-cases.js v1.0.0",
    "aggregate": "aggregate-scores.js v1.0.0"
  },
  "generated_at": "2025-01-26T15:30:00Z",
  "git_commit": "abc123def456"
}
```

### Regenerating Results

To reproduce results:

```bash
# Checkout specific version
git checkout v1.0.0

# Run analysis pipeline
node scripts/score-cases.js
node scripts/aggregate-scores.js

# Compare with archived results
diff analysis/results/summary-stats.json \
     archive/v1.0.0/summary-stats.json
```

## Migration Between Versions

### Data Format Changes

If schemas change (major version):

1. Create migration script: `scripts/migrate-v0-to-v1.js`
2. Document in CHANGELOG
3. Keep old data in `archive/v0/`
4. Provide backward compatibility period

### Example Migration

```bash
# Migrate cases from v0 to v1 format
node scripts/migrate-v0-to-v1.js \
  --input cases/ \
  --output cases-v1/ \
  --backup archive/v0/cases/
```

## Collaborative Development

### Handling Conflicts

**Phrase lists**: Resolve manually, ensure no duplicate `phrase_id`

**Cases/ratings**: Usually no conflicts (new files), but check for duplicates

**Results**: Regenerate rather than merge

### Synchronization

```bash
# Pull latest changes
git pull origin main

# If there are new ratings
node scripts/score-cases.js
node scripts/aggregate-scores.js

# Commit updated results
git add analysis/results/
git commit -m "Update analysis with new ratings"
```

## Backup Strategy

### Regular Backups

- **Code**: GitHub provides automatic backup
- **Data**: Back up `cases/` and `ratings/` regularly
- **Generated artifacts**: Can be regenerated, but backup if time-consuming

### Recommended Schedule

- **Daily**: Automatic GitHub backup
- **Weekly**: Export to external storage
- **Per-release**: Create permanent archive

## Version Documentation

### CHANGELOG.md

Maintain a changelog:

```markdown
# Changelog

## [1.0.0] - 2025-01-26

### Added
- Pictogram-level evaluation framework
- Individual case definitions and schemas
- Style profiles for generation
- Analysis scripts for scoring and aggregation

### Changed
- README restructured for two evaluation modes
- Updated documentation structure

### Fixed
- Phrase ID consistency across all files
```

### Version Badge

Add to README:

```markdown
![Version](https://img.shields.io/badge/version-1.0.0-blue)
```

## Questions

For versioning questions, see:
- [Semantic Versioning specification](https://semver.org/)
- [Git documentation](https://git-scm.com/doc)
- [Git LFS documentation](https://git-lfs.github.com/)
