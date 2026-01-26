# Pictogram Case

## Definition

A **pictogram case** is the fundamental unit of analysis for pictogram-level evaluation in the VCSCI framework. It represents a single, specific instance of a generated pictogram along with all metadata necessary for reproducible evaluation.

## Components

A pictogram case consists of:

### 1. Source Phrase
- **phrase_id**: Stable identifier from the core phrase list (e.g., `req-001`, `rej-003`)
- **utterance**: The actual text in Spanish and English
- **domain**: Contextual domain (Casa/Hogar, Escuela, Higiene/Salud, Ocio/Comunidad, General)
- **syntax**: Syntactic structure of the phrase

### 2. Generation Context
- **pipeline_version**: Version identifier of the generative pipeline (e.g., `v1.0.0`, `v1.2.3`)
- **style_profile_id**: Reference to the style/prompt configuration used (e.g., `default-v1`, `simplified-v2`)
- **model_name**: Name/identifier of the ML model used (e.g., `gpt-4-vision`, `stable-diffusion-xl`)
- **generation_timestamp**: ISO 8601 timestamp of generation
- **seed** (optional): Random seed or variant identifier for reproducibility

### 3. Output Artifacts
- **svg_file**: Path to the generated SVG pictogram
- **preview_file** (optional): Path to PNG/JPEG preview render
- **generation_log** (optional): Technical details, parameters, or debug information

### 4. Evaluation Data
- **ratings**: Collection of human evaluations (see rating records)
- **decision**: Accept / Accept with edits / Reject
- **required_edits**: List of specific changes needed if not accepted as-is
- **iteration_number**: Track revision cycles for the same phrase_id

## Case ID Format

The `case_id` uniquely identifies each pictogram case using this composition:

```
{phrase_id}_{pipeline_version}_{style_profile_id}_{variant}
```

### Examples

```
req-001_v1.0.0_default-v1_01
rej-003_v1.2.1_simplified-v2_03
exp-012_v2.0.0_default-v1_01
```

### ID Components

1. **phrase_id**: From core phrase list (e.g., `req-001`)
2. **pipeline_version**: Semantic version without dots, prefixed with 'v' (e.g., `v1.0.0`)
3. **style_profile_id**: Style profile identifier (e.g., `default-v1`)
4. **variant**: Two-digit sequential number for multiple generations of the same configuration (e.g., `01`, `02`)

### Rules

- Use underscores (`_`) as separators
- All components are lowercase except version numbers
- variant is always two digits with zero-padding
- The case_id must be unique across the entire dataset
- The case_id is immutable once assigned

## Relationship to Model-Level Evaluation

Pictogram cases support both:

1. **Individual evaluation**: Assess a single pictogram for iteration and refinement
2. **Aggregated evaluation**: Combine multiple cases to evaluate model/pipeline performance

The model-level VCSCI score is computed by aggregating scores across all cases sharing the same `pipeline_version` and `style_profile_id`.

## Storage Structure

Cases are organized in the following directory structure:

```
pictograms/
  ├── {case_id}/
  │   ├── output.svg
  │   ├── preview.png
  │   └── meta.json
  └── ...

cases/
  └── {case_id}.json  (case definition with all metadata)
```

## Version Control

- **phrase_id**: Stable, does not change when phrase text is edited
- **case_id**: Immutable once created
- **pipeline_version**: Follows semantic versioning
- **style_profile_id**: Versioned independently of pipeline

## Use Cases

### Single Case Evaluation
Evaluate one pictogram to decide if it's acceptable for production use or needs iteration.

### Batch Generation
Generate multiple cases (e.g., 20 cases from 20 different phrases) for systematic testing.

### A/B Comparison
Generate multiple variants of the same phrase with different pipeline versions or style profiles.

### Iteration Tracking
Track revisions by incrementing `iteration_number` while keeping the same `phrase_id`.
