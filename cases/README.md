# Cases Directory

This directory contains case definition files for pictogram evaluation.

## Structure

Each case is stored as a JSON file named with its `case_id`:

```
cases/
├── req-001_v1.0.0_default-v1_01.json
├── req-002_v1.0.0_default-v1_01.json
└── ...
```

## Case File Format

Each JSON file follows the [CaseMeta schema](../schemas/case-meta.schema.json) and includes:

- Case identification (case_id, phrase_id)
- Source phrase (Spanish, English, domain, syntax)
- Generation context (pipeline version, style profile, model)
- File references (SVG, preview, logs)
- Generation parameters and metadata

## Example

```json
{
  "case_id": "req-001_v1.0.0_default-v1_01",
  "phrase_id": "req-001",
  "phrase": {
    "spanish": "Quiero ir al baño.",
    "english": "I want to go to the toilet.",
    "domain": "Higiene/Salud",
    "syntax": "Verbo (querer) + infinitivo + lugar"
  },
  "pipeline_version": "v1.0.0",
  "style_profile_id": "default-v1",
  "model_name": "gpt-4-vision",
  "generation_timestamp": "2025-01-15T14:30:00Z",
  "variant": "01",
  "iteration_number": 1,
  "files": {
    "svg": "pictograms/req-001_v1.0.0_default-v1_01/output.svg",
    "preview": "pictograms/req-001_v1.0.0_default-v1_01/preview.png"
  }
}
```

## Naming Convention

File names must match the `case_id` field inside the JSON:

```
{case_id}.json
```

## Validation

Validate case files against the schema:

```bash
ajv validate -s schemas/case-meta.schema.json -d "cases/*.json"
```
