# GitHub Issues and Milestones

This document provides a suggested structure for GitHub Issues and Milestones to track VCSCI development.

## Milestones

### Milestone 1: Foundation (v0.1.0) ✅ COMPLETE

Core phrase lists and basic evaluation methodology.

**Status**: Released
**Due date**: 2025-01-26

**Goals**:
- [x] Core phrase lists (115 phrases across 8 functions)
- [x] Evaluation methodology documented
- [x] Basic README and documentation

### Milestone 2: Pictogram-Level Evaluation (v1.0.0) 🚧 IN PROGRESS

Single pictogram evaluation framework with metadata embedding.

**Status**: 80% complete
**Due date**: TBD

**Goals**:
- [x] Pictogram case definition and schemas
- [x] Evaluation instrument and rubric
- [x] Hexagonal rating interface (prototype)
- [x] Metadata embedding as SSOT
- [x] Analysis scripts (scoring, aggregation, reporting)
- [x] CI/CD validation
- [ ] Anchor collection (3 dimensions × 3 levels)
- [ ] Production evaluation interface
- [ ] Integration with generation pipeline

### Milestone 3: Production Deployment (v1.1.0)

Production-ready tools and interfaces.

**Status**: Not started
**Due date**: TBD

**Goals**:
- [ ] Web-based evaluation interface
- [ ] Automated generation pipeline integration
- [ ] Complete anchor set (36-54 pictograms)
- [ ] Inter-rater reliability study
- [ ] Production deployment scripts
- [ ] User documentation and training materials

### Milestone 4: Research Publication (v2.0.0)

Validation studies and research outputs.

**Status**: Not started
**Due date**: TBD

**Goals**:
- [ ] Evaluate 100+ pictograms
- [ ] Multi-evaluator validation study
- [ ] Statistical analysis and validation
- [ ] Research paper submission
- [ ] Dataset publication (Zenodo/OSF)

---

## Suggested Issues

### High Priority (Milestone 2)

#### Issue #1: Collect anchoring examples for evaluation
**Labels**: `enhancement`, `evaluation`, `priority:high`

**Description**:
Collect visual anchoring examples for the evaluation rubric to improve inter-rater reliability.

**Requirements**:
- Generate 30 diverse pictograms (varying quality)
- Recruit 3-5 AAC experts for anchor rating
- Select examples with high agreement
- Document selected anchors with metadata
- Start with 3 dimensions: clarity, recognizability, semantic_transparency
- Create reference sheet (PDF) for evaluators

**Success Criteria**:
- [ ] 3 dimensions × 3 levels × 2-3 examples = 18-27 anchors collected
- [ ] All anchors have expert consensus (4/5 experts agree on level)
- [ ] Anchor metadata documented in `docs/anchors/`
- [ ] Reference sheet created

**Related**: [docs/anchoring-examples.md](anchoring-examples.md)

---

#### Issue #2: Build web-based hexagonal evaluation interface
**Labels**: `enhancement`, `UI/UX`, `priority:high`

**Description**:
Convert the hexagonal rating demo to a production-ready web interface for pictogram evaluation.

**Requirements**:
- React/Vue.js application
- Display pictogram and hexagonal rating widget
- Real-time visualization as user rates
- Save evaluations to database or export JSON
- Responsive design for tablet/desktop
- Integration with anchor display (click dimension → show anchors)

**Technical Considerations**:
- SVG rendering for pictograms
- D3.js or Chart.js for hexagon visualization
- Form validation
- Export functionality (JSON/CSV)

**Success Criteria**:
- [ ] Functional web interface deployed
- [ ] Users can rate all 6 dimensions
- [ ] Hexagon updates in real-time
- [ ] Evaluations export correctly
- [ ] Tested with 5+ evaluators

**Related**: [docs/hexagonal-interface.md](hexagonal-interface.md), [examples/hexagonal-rating-demo.html](../examples/hexagonal-rating-demo.html)

---

#### Issue #3: Integrate with pictogram generation pipeline
**Labels**: `integration`, `pipeline`, `priority:high`

**Description**:
Create automated pipeline to generate pictograms and embed metadata.

**Requirements**:
- Script to generate pictograms from phrase list
- Automatic metadata generation
- Embed metadata in SVG
- Create sidecar JSON
- Validate chain of thought integrity
- Queue for evaluation

**Workflow**:
```
1. Load phrase from phrase list
2. Load style profile
3. Call generative model
4. Generate SVG
5. Embed generation metadata
6. Save to pictograms/{case_id}/
7. Create case definition in cases/
8. Add to evaluation queue
```

**Success Criteria**:
- [ ] Automated generation script functional
- [ ] Metadata correctly embedded in all SVGs
- [ ] Case definitions created automatically
- [ ] Chain validation passes
- [ ] Documentation for pipeline usage

**Related**: [docs/generation-workflow.md](generation-workflow.md), [docs/metadata-embedding.md](metadata-embedding.md)

---

### Medium Priority (Milestone 2/3)

#### Issue #4: Refactor phrase_id to semantic namespaces
**Labels**: `refactor`, `data`, `priority:medium`

**Description**:
Replace sequential phrase_ids (req-001) with semantic namespaces (request.toilet.need) to better handle synonyms and variations.

**Rationale**:
- Current IDs are not descriptive
- Problem with synonyms/variations pointed out by user
- Semantic IDs are self-documenting
- Easier to search and filter

**Migration Plan**:
1. Design namespace schema (e.g., `{function}.{concept}.{variant}`)
2. Create mapping: old ID → new namespace
3. Write migration script
4. Update all references (cases, ratings, documentation)
5. Update schemas to validate namespace format
6. Test thoroughly

**Example Mappings**:
```
req-001 → request.toilet.need
req-002 → request.play.outside
rej-001 → reject.item.unwanted
```

**Success Criteria**:
- [ ] Namespace schema defined and documented
- [ ] All 115 phrases migrated
- [ ] No broken references
- [ ] Schemas updated
- [ ] Backward compatibility maintained

---

#### Issue #5: Inter-rater reliability study
**Labels**: `research`, `validation`, `priority:medium`

**Description**:
Conduct study to measure inter-rater reliability using the VCSCI rubric and anchoring examples.

**Requirements**:
- Recruit 10+ evaluators (diverse roles)
- Select 20 pictograms for rating
- All evaluators rate same pictograms
- Calculate Cohen's Kappa, ICC
- Identify problem areas (low agreement)
- Iterate on rubric/anchors if needed

**Metrics**:
- Cohen's Kappa (pairwise agreement)
- Intraclass Correlation Coefficient
- Fleiss' Kappa (multi-rater)
- Per-dimension agreement

**Success Criteria**:
- [ ] Study completed with 10+ evaluators
- [ ] ICC > 0.75 (good reliability)
- [ ] Results documented
- [ ] Rubric refined based on findings

---

#### Issue #6: Create CHANGELOG.md
**Labels**: `documentation`, `priority:medium`

**Description**:
Maintain a changelog following Keep a Changelog format.

**Include**:
- All version releases
- Added, Changed, Deprecated, Removed, Fixed, Security sections
- Links to releases/tags
- Migration guides for breaking changes

---

### Low Priority (Milestone 3/4)

#### Issue #7: Publish dataset to Zenodo
**Labels**: `research`, `publication`, `priority:low`

**Description**:
Publish anonymized dataset (phrases, pictograms, evaluations) to Zenodo for research reproducibility.

**Requirements**:
- [ ] Prepare dataset archive
- [ ] Write data dictionary
- [ ] Check anonymization
- [ ] Upload to Zenodo
- [ ] Obtain DOI
- [ ] Update README with citation

---

#### Issue #8: Multi-language support
**Labels**: `enhancement`, `i18n`, `priority:low`

**Description**:
Extend framework to support additional language pairs beyond Spanish/English.

**Languages to consider**:
- Portuguese (Brazilian)
- French
- German
- Catalan

---

#### Issue #9: Mobile evaluation interface
**Labels**: `UI/UX`, `mobile`, `priority:low`

**Description**:
Create mobile-optimized evaluation interface for tablet-based evaluation.

**Features**:
- Touch-friendly hexagonal rating
- Offline evaluation support
- Sync evaluations when online

---

## Issue Labels

### Type
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `refactor` - Code refactoring

### Component
- `evaluation` - Evaluation methodology
- `pipeline` - Generation pipeline
- `UI/UX` - User interface
- `data` - Data structures/schemas
- `integration` - System integration
- `research` - Research-related

### Priority
- `priority:high` - Blocks major functionality
- `priority:medium` - Important but not blocking
- `priority:low` - Nice to have

### Status
- `in-progress` - Currently being worked on
- `blocked` - Blocked by another issue
- `needs-review` - Ready for review

---

## Creating Issues on GitHub

To create these issues:

1. Go to repository → Issues → New Issue
2. Copy title and description from above
3. Add appropriate labels
4. Assign to milestone
5. Assign to team member (if applicable)

Example workflow:

```bash
# Using GitHub CLI
gh issue create \
  --title "Collect anchoring examples for evaluation" \
  --body "..." \
  --label "enhancement,evaluation,priority:high" \
  --milestone "v1.0.0"
```

---

## Project Board

Consider creating a GitHub Project board with columns:

- **Backlog** - Not yet started
- **In Progress** - Currently working
- **In Review** - Ready for review
- **Done** - Completed

Organize issues and pull requests visually.

---

## Release Workflow

When completing a milestone:

1. Close all milestone issues
2. Update CHANGELOG.md
3. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag: `git push --tags`
5. Create GitHub Release with notes
6. Update README version badge
