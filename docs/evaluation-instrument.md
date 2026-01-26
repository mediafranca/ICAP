# Evaluation Instrument for Individual Pictograms

This document defines the evaluation instrument for assessing individual pictogram cases.

## Purpose

The evaluation instrument provides a structured, repeatable method for human evaluators to assess pictogram quality across multiple dimensions relevant to AAC communication.

## Evaluation Form Structure

### Part 1: Case Identification

```
Case ID: ___________________________
Phrase (Spanish): ___________________________
Phrase (English): ___________________________
Domain: [ ] Casa/Hogar  [ ] Escuela  [ ] Higiene/Salud  [ ] Ocio/Comunidad  [ ] General
```

### Part 2: Evaluator Information

```
Evaluator Role:
  [ ] Expert in AAC
  [ ] Expert in Design
  [ ] Clinician
  [ ] Educator
  [ ] Family Member
  [ ] End User
  [ ] Researcher

Evaluation Date: _____ / _____ / _____
Evaluation Mode: [ ] Online  [ ] In-person  [ ] Remote Interview  [ ] Survey
```

### Part 3: Dimensional Ratings (1-5 Scale)

For each dimension, rate the pictogram on a scale of 1 to 5:
- **1**: Poor / Unacceptable
- **2**: Below average / Needs significant improvement
- **3**: Acceptable / Meets minimum standards
- **4**: Good / Above average
- **5**: Excellent / Outstanding

#### Dimension 1: Clarity
**How visually clear and legible is the pictogram?**

Rating: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]

Comments: _________________________________________________

#### Dimension 2: Recognizability
**How easily can you recognize what the pictogram represents without additional context?**

Rating: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]

Comments: _________________________________________________

#### Dimension 3: Semantic Transparency
**How well does the pictogram convey the intended meaning of the phrase?**

Rating: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]

Comments: _________________________________________________

#### Dimension 4: Pragmatic Fit
**How useful would this pictogram be in real communication contexts?**

Rating: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]

Comments: _________________________________________________

#### Dimension 5: Cultural Adequacy (Optional)
**Is the pictogram culturally appropriate and relevant for the target audience?**

Rating: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ N/A ]

Comments: _________________________________________________

#### Dimension 6: Cognitive Accessibility (Optional)
**Is the pictogram accessible for users with cognitive differences?**

Rating: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ N/A ]

Comments: _________________________________________________

### Part 4: Overall Decision

```
Decision:
  [ ] Accept - Ready for production use
  [ ] Accept with Edits - Acceptable but needs minor improvements
  [ ] Reject - Needs significant rework or regeneration
```

### Part 5: Required Edits (if not "Accept")

If decision is "Accept with Edits" or "Reject", specify required changes:

| Category | Description | Priority |
|----------|-------------|----------|
| [ ] Color | _________________________ | [ ] Critical [ ] Important [ ] Minor |
| [ ] Shape | _________________________ | [ ] Critical [ ] Important [ ] Minor |
| [ ] Detail Level | _________________ | [ ] Critical [ ] Important [ ] Minor |
| [ ] Composition | ____________________ | [ ] Critical [ ] Important [ ] Minor |
| [ ] Symbolism | ______________________ | [ ] Critical [ ] Important [ ] Minor |
| [ ] Cultural Adaptation | ____________ | [ ] Critical [ ] Important [ ] Minor |
| [ ] Accessibility | __________________ | [ ] Critical [ ] Important [ ] Minor |
| [ ] Other: ______ | ___________________ | [ ] Critical [ ] Important [ ] Minor |

### Part 6: Additional Notes

```
General comments, observations, or suggestions:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

## Google Sheets Template

A ready-to-use Google Sheets version of this form is available at:
[VCSCI Pictogram Evaluation Form Template](https://docs.google.com/spreadsheets/d/YOUR_TEMPLATE_ID)

### Sheet Structure

**Sheet 1: Instructions**
- Overview of the evaluation process
- Definitions of each dimension
- Examples of ratings

**Sheet 2: Evaluation Form**
- One row per pictogram case
- Columns for all fields above
- Data validation for dropdown selections
- Conditional formatting for easy reading

**Sheet 3: Rating Scale Reference**
- Quick reference for 1-5 scale
- Examples for each dimension

## Online Survey (Alternative)

For larger evaluation studies, consider using:
- Google Forms
- Qualtrics
- SurveyMonkey
- LimeSurvey (open source)

### Survey Features

- Display pictogram image with each question
- Randomize order to reduce bias
- Include attention check questions
- Track completion time per pictogram
- Export to CSV for processing

## Evaluation Best Practices

### Before Evaluation

1. **Calibration session**: Review examples together
2. **Review rubric**: Ensure understanding of dimensions
3. **Test environment**: Check image display quality
4. **Time allocation**: Allow 2-3 minutes per pictogram

### During Evaluation

1. **Minimize distractions**: Quiet environment
2. **Take breaks**: Every 10-15 pictograms
3. **Consistent context**: View at same size/screen
4. **Independent judgment**: No discussion during rating

### After Evaluation

1. **Completeness check**: All fields filled
2. **Consistency review**: Look for patterns
3. **Inter-rater reliability**: If multiple evaluators
4. **Export data**: Save as CSV/JSON

## Data Export Format

Export evaluations as CSV with these columns:

```csv
rating_id,case_id,evaluator_role,evaluation_date,evaluation_mode,clarity,recognizability,semantic_transparency,pragmatic_fit,cultural_adequacy,cognitive_accessibility,decision,required_edits,notes,duration_seconds
```

Then import using:

```bash
node scripts/import-ratings.js evaluation-export.csv
```

## Validation

After export, validate against schema:

```bash
node scripts/validate-schema.js ratings
```

## Inter-Rater Reliability

For research purposes, calculate:
- **Cohen's Kappa**: Agreement between two raters
- **Fleiss' Kappa**: Agreement among multiple raters
- **Intraclass Correlation**: For continuous ratings
- **Percentage agreement**: Simple metric

Use `scripts/calculate-irr.js` for automated calculation.

## Modifications for Different Contexts

### For End Users (AAC users)
- Simplified language
- Visual scale (smiley faces instead of numbers)
- Fewer dimensions (3-4 max)
- Assisted completion

### For Expert Panels
- Additional technical dimensions
- Detailed edit categorization
- Comparison with existing standards
- ISO/IEC 24751 compliance checklist

### For Quick Screening
- Binary decision (accept/reject)
- Single overall quality rating
- Required edits only if rejected
