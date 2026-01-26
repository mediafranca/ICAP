# Data Handling and Governance

This document outlines data handling practices, privacy considerations, and governance policies for the VCSCI project.

## Overview

The VCSCI framework handles several types of data:

1. **Core phrase lists** - Linguistic data (Spanish/English phrases)
2. **Pictogram outputs** - Generated SVG files
3. **Case metadata** - Generation parameters and context
4. **Evaluation ratings** - Human assessments (anonymized)
5. **Analysis results** - Aggregated scores and statistics

## Privacy Principles

### No Personal Data Collection

The VCSCI framework is designed to **minimize personal data collection**:

- **NO names** of evaluators
- **NO email addresses** or contact information
- **NO device identifiers** or IP addresses
- **NO precise timestamps** (dates only, no times)
- **NO geolocation** data

### Anonymized Roles

Evaluator identities are replaced with **role categories**:

- `expert-aac`
- `expert-design`
- `clinician`
- `educator`
- `family-member`
- `end-user`
- `researcher`

These categories provide context without revealing identity.

## Data Types and Handling

### 1. Core Phrase Lists

**Contents**: Spanish and English utterances, domains, syntax annotations

**Privacy level**: Public

**Storage**: Git repository

**Sharing**: Open (MIT License or equivalent)

**Retention**: Permanent (part of methodology)

### 2. Generated Pictograms (SVG)

**Contents**: Vector graphics representing concepts

**Privacy level**: Public

**Storage**:
- Small datasets (< 50 files): Git repository
- Medium datasets (50-200): Git LFS
- Large datasets (> 200): External storage with metadata in git

**Sharing**: Can be shared publicly for research

**Retention**: Keep for reproducibility and comparison

**Notes**:
- SVGs should not contain embedded personal data
- Review metadata tags before sharing
- Sanitize any generation logs

### 3. Case Metadata

**Contents**: Generation parameters, timestamps, model versions

**Privacy level**: Public (if sanitized)

**Storage**: Git repository (`cases/`)

**Sharing**: Safe to share if:
- No personal API keys or credentials
- No user-identifiable patterns
- Timestamps are rounded to dates

**Retention**: Permanent (required for reproducibility)

### 4. Evaluation Ratings

**Contents**: Ratings, decisions, required edits, evaluator roles

**Privacy level**: Anonymized (requires careful handling)

**Storage**: Git repository (`ratings/`) if properly anonymized

**Sharing**: Can be shared if:
- No evaluator names or identifiers
- Evaluator roles are categorical
- Dates only (no precise times)
- No free-text containing personal information

**Retention**: Keep for research and analysis

**Anonymization checklist**:
- [ ] Remove or never collect evaluator names
- [ ] Use role categories instead of identities
- [ ] Remove email addresses from exports
- [ ] Round timestamps to dates
- [ ] Review free-text notes for personal info
- [ ] Remove device/browser fingerprints

### 5. Analysis Results

**Contents**: Aggregated scores, statistics, summaries

**Privacy level**: Public (derived from anonymized data)

**Storage**: Git repository (`analysis/results/`)

**Sharing**: Safe to share publicly

**Retention**: Permanent (research outputs)

## Data Workflow

### Collection Phase

1. **Generate pictograms**: Use case_id, no personal data
2. **Collect evaluations**:
   - Use Google Forms/Sheets with anonymization
   - Only collect role, date, ratings, notes
   - Do not require sign-in or email
3. **Export data**: CSV/JSON format
4. **Sanitize**: Remove any accidental personal data

### Processing Phase

1. **Import ratings**: Validate anonymization
2. **Score cases**: Compute aggregates
3. **Generate reports**: Only use aggregated data

### Sharing Phase

**Before sharing data publicly:**

1. Review for personal information
2. Check that only anonymized ratings are included
3. Confirm no API keys, credentials, or tokens
4. Verify file paths don't reveal personal directories
5. Document data provenance

## Git Repository Policies

### What to Commit

✅ **Safe to commit:**
- Core phrase lists
- Documentation
- Schemas
- Scripts (no credentials)
- Anonymized ratings
- Case metadata (sanitized)
- Analysis results
- Example/toy data

❌ **Do NOT commit:**
- Personal evaluator information
- Raw survey data (before anonymization)
- API keys or credentials
- Private notes or drafts with personal info
- Large binary files (use Git LFS)

### .gitignore Recommendations

```gitignore
# Sensitive data
*.key
*.pem
credentials.json
.env

# Raw/unsanitized exports
raw-data/
private/

# Large files (use LFS instead)
*.png
*.jpg

# Generated preview images (optional)
pictograms/*/preview.png
```

## Google Sheets Integration

### Data Collection Sheet

**Recommended settings:**
- Do not require sign-in
- Do not collect email addresses
- Use dropdown menus for role selection
- Use data validation for ratings (1-5)
- Include privacy notice in sheet header

**Privacy notice example:**

> "This evaluation is anonymous. We only collect your role (e.g., educator, clinician) and your ratings. No names, emails, or personal identifiers are collected."

### Export and Import

**Before exporting:**
1. Check no personal data in responses
2. Review free-text notes for names or identifiable info
3. Remove any email columns if present

**Import script sanitization:**
The `import-ratings.js` script should:
- Validate role is from allowed list
- Strip any unexpected personal fields
- Round timestamps to dates
- Warn if unexpected columns present

## Compliance Considerations

### Research Ethics

If using VCSCI data for research:
- Obtain IRB/ethics approval if involving human subjects
- Inform participants about data handling
- Obtain informed consent
- Follow institutional policies

### Data Protection Regulations

While VCSCI minimizes personal data, be aware of:
- **GDPR** (EU): Applies to EU residents' data
- **CCPA** (California): Applies to California residents
- **Local laws**: Check your jurisdiction

**Our approach**: Collect minimal data, anonymize by design, no personal identifiers.

### Accessible Research Data

When publishing research:
- Share anonymized rating datasets
- Include data dictionary
- Document methods and transformations
- Use persistent identifiers (DOIs)
- License appropriately (CC-BY, CC0, or similar)

## Data Retention and Deletion

### Retention Policy

- **Core phrases**: Indefinite (methodology)
- **Pictograms**: Until project end or space limits
- **Metadata**: Indefinite (reproducibility)
- **Ratings**: Until research completion + archival period
- **Analysis results**: Indefinite (published research)

### Deletion Procedures

**If an evaluator requests data deletion:**

1. Identify rating records by date/role (if possible)
2. Remove from `ratings/` directory
3. Re-run analysis without those records
4. Update published datasets if applicable

**Note**: If data is truly anonymized, individual records may not be identifiable for deletion.

## Security Best Practices

### Storage

- Use GitHub private repository if data is not yet anonymized
- Switch to public after anonymization and validation
- Use Git LFS for large files
- Consider encrypted storage for raw data

### Access Control

- Limit access to raw data during collection
- Use read-only links for public sharing
- Review collaborator permissions regularly

### Sharing

- Use DOIs for published datasets
- Document any access restrictions
- Include license and citation information

## Incident Response

**If personal data is accidentally committed:**

1. **Do not panic**, but act quickly
2. Remove the file/data immediately
3. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
4. Force-push to remote (if applicable)
5. Notify affected individuals if identifiable
6. Document the incident
7. Review processes to prevent recurrence

## Questions and Support

For data handling questions:
- Review this document
- Check [schemas/README.md](../schemas/README.md) for data structures
- Consult your institution's data protection officer
- Contact project maintainers

## Version History

- **v1.0** (2025-01-26): Initial data handling policy
- Future updates will be tracked in git history
