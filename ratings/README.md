# Ratings Directory

This directory stores human evaluation data for pictogram cases.

## Structure

```
ratings/
├── rating-550e8400-e29b-41d4-a716-446655440000.json
├── rating-6ba7b810-9dad-11d1-80b4-00c04fd430c8.json
└── ...
```

Or organized by batch/session:

```
ratings/
├── batch-2025-01-15/
│   ├── rating-001.json
│   ├── rating-002.json
│   └── ...
└── batch-2025-01-20/
    └── ...
```

## Rating File Format

Each JSON file follows the [RatingRecord schema](../schemas/rating-record.schema.json) and includes:

- Reference to evaluated case (case_id)
- Evaluator information (anonymized role)
- Ratings across dimensions (1-5 scale)
- Decision (accept/accept-with-edits/reject)
- Required edits with categories

## Example

```json
{
  "rating_id": "rating-550e8400-e29b-41d4-a716-446655440000",
  "case_id": "req-001_v1.0.0_default-v1_01",
  "evaluator_role": "expert-aac",
  "evaluation_date": "2025-01-15",
  "evaluation_mode": "online",
  "ratings": {
    "clarity": 4,
    "recognizability": 5,
    "semantic_transparency": 4,
    "pragmatic_fit": 5,
    "cultural_adequacy": 4,
    "cognitive_accessibility": 5
  },
  "decision": "accept-with-edits",
  "required_edits": [
    {
      "category": "color",
      "description": "Increase contrast for better visibility",
      "priority": "minor"
    }
  ],
  "notes": "Overall excellent, minor contrast improvement suggested"
}
```

## Import from Google Sheets

Use the import script to convert Google Sheets exports to rating JSON files:

```bash
node scripts/import-ratings.js ratings-export.csv
```

## Validation

```bash
ajv validate -s schemas/rating-record.schema.json -d "ratings/*.json"
```

## Privacy

Rating files should NOT contain:
- Evaluator names or personal identifiers
- Timestamps with precise times (use dates only)
- Device identifiers or IP addresses

See [../docs/data-handling.md](../docs/data-handling.md) for privacy guidelines.
