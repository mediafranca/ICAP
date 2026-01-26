# Anchoring Examples for VCSCI Evaluation

This document defines the visual anchoring examples needed for each evaluation dimension at key rating levels (1, 3, 5).

## Purpose

Anchoring examples reduce evaluator variation by providing concrete visual references for each score level. Evaluators compare the pictogram being evaluated against these anchors.

## Requirements

For each dimension, we need:

- **3 anchor levels**: Score 1 (poor), 3 (acceptable), 5 (excellent)
- **2-3 examples per level**: Multiple examples show range within level
- **Real pictograms**: Actual generated SVGs, not hypothetical descriptions
- **Diverse concepts**: Examples from different domains and phrase types

Total needed: **6 dimensions × 3 levels × 2-3 examples = ~36-54 anchor pictograms**

## Anchor Collection Strategy

### Phase 1: Initial Generation (Minimum Viable Set)
Generate 20-30 pictograms covering diverse phrases and intentionally vary generation parameters to produce range of quality.

### Phase 2: Expert Review
3-5 AAC experts independently rate all pictograms. Select those with:
- **High inter-rater agreement** (all experts agree on score)
- **Clear quality level** (unambiguous 1, 3, or 5)
- **Diverse representation** (different domains, concepts)

### Phase 3: Anchor Validation
Use selected anchors with new evaluators. Measure:
- Do evaluators' ratings cluster around expected anchor scores?
- Does showing anchors reduce rating variance?
- Are any anchors confusing or misleading?

### Phase 4: Iteration
Replace problematic anchors. Re-validate until stable.

## Anchor Organization

### Storage Structure

```
docs/anchors/
├── README.md                           # This file
├── clarity/
│   ├── level-1-poor/
│   │   ├── example-01-req-001.svg
│   │   ├── example-01-req-001.md      # Why this is level 1
│   │   ├── example-02-exp-005.svg
│   │   └── example-02-exp-005.md
│   ├── level-3-acceptable/
│   │   └── ...
│   └── level-5-excellent/
│       └── ...
├── recognizability/
│   └── ...
├── semantic_transparency/
│   └── ...
├── pragmatic_fit/
│   └── ...
├── cultural_adequacy/
│   └── ...
└── cognitive_accessibility/
    └── ...
```

### Metadata for Each Anchor

Each anchor example includes:

```markdown
# Anchor: Clarity Level 1 - Example 01

**Case ID**: req-001_v1.0.0_default-v1_01
**Phrase**: "Quiero ir al baño." / "I want to go to the toilet."
**Dimension**: Clarity
**Level**: 1 (Poor)

## Why This is Level 1

- Lines are thin and pixelated
- Low contrast (gray on light gray)
- Too many small details that blur together
- Illegible when scaled to typical AAC device size

## Expert Agreement

- Expert 1: Score 1
- Expert 2: Score 2
- Expert 3: Score 1
- Expert 4: Score 1
- **Consensus**: Level 1 (4/4 experts rated 1-2)

## Use in Training

Show this anchor when training new evaluators to demonstrate what "poor clarity" looks like.
```

## Priority Dimensions for Anchoring

Not all dimensions need equal anchoring effort:

### High Priority (Need strong anchors)

1. **Clarity** - Most objective, easiest to anchor with visual examples
2. **Recognizability** - Critical for AAC, benefits greatly from visual anchors
3. **Semantic Transparency** - Complex dimension, needs clear examples

### Medium Priority

4. **Pragmatic Fit** - Somewhat subjective, anchors help but context matters
5. **Cognitive Accessibility** - Benefits from anchors showing complexity levels

### Lower Priority

6. **Cultural Adequacy** - Often N/A or highly context-dependent

**Recommendation**: Start by collecting anchors for **Clarity**, **Recognizability**, and **Semantic Transparency** only.

## Anchor Selection Criteria

### For Level 1 (Poor)

- **Clear deficiencies**: Obviously below standard
- **Not offensive**: Poor quality, but not inappropriate
- **Instructive**: Shows what to avoid
- **Recoverable**: Could be fixed with edits

### For Level 3 (Acceptable)

- **Functional**: Works for communication despite minor issues
- **Typical**: Represents common/average quality
- **Ambiguous elements**: Some good, some improvable
- **Borderline cases**: Could be rated 2-4 depending on strictness

### For Level 5 (Excellent)

- **Exemplary**: Gold standard quality
- **Unambiguous**: Everyone agrees it's excellent
- **Professional**: Publication-ready
- **Meets all criteria**: No obvious improvements needed

## Integration with Evaluation Instrument

### Display in Form

```
[Dimension: Clarity]

Rate the pictogram's visual clarity (1-5):

[View anchors: 1 (poor) | 3 (acceptable) | 5 (excellent)]

( ) 1 - Poor
( ) 2 - Below Average
( ) 3 - Acceptable
( ) 4 - Good
( ) 5 - Excellent
```

Clicking anchor links shows visual examples in lightbox/modal.

### Reference Sheet

Provide evaluators with printed/PDF anchor sheet showing all examples side-by-side for quick reference.

## Maintenance

### When to Update Anchors

- New pipeline version produces different quality range
- Evaluator feedback indicates anchor is confusing
- Inter-rater reliability drops below threshold
- Community identifies better examples

### Version Control

- Anchor sets are versioned: `anchors-v1.0.0`
- Major version change when replacing >50% of anchors
- Minor version when adding or replacing individual anchors
- Reference anchor version in all evaluation data

## Action Items

- [ ] Generate initial 30 diverse pictograms
- [ ] Recruit 3-5 AAC experts for anchor rating
- [ ] Conduct anchor selection workshop
- [ ] Document selected anchors with metadata
- [ ] Create anchor reference sheet (PDF)
- [ ] Integrate anchors into evaluation form
- [ ] Validate with test evaluators
- [ ] Iterate based on feedback

## Questions for Discussion

1. Should we create anchors for all 6 dimensions or start with 3?
2. How many examples per level (2 or 3)?
3. Should anchors be domain-specific or cross-domain?
4. How do we handle cultural variation in anchors?
5. Should we create separate anchor sets for different evaluator roles?
