# VCSCI Data Schemas

This directory contains JSON Schema definitions for validating data structures in the VCSCI framework.

## Available Schemas

### 1. CaseMeta Schema
**File**: [case-meta.schema.json](case-meta.schema.json)

Defines the structure for pictogram case metadata, including:
- Case identification (case_id, phrase_id)
- Generation context (pipeline version, style profile, model)
- Output artifacts (SVG, preview, logs)
- Additional metadata

### 2. RatingRecord Schema
**File**: [rating-record.schema.json](rating-record.schema.json)

Defines the structure for human evaluation records, including:
- Evaluator information (anonymized role, date)
- Ratings across dimensions (1-5 scale)
- Decision (accept/accept-with-edits/reject)
- Required edits with categories and priorities

## Usage

### Validate JSON with Node.js

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const caseMetaSchema = require('./schemas/case-meta.schema.json');
const validate = ajv.compile(caseMetaSchema);

const myCase = require('./cases/req-001_v1.0.0_default-v1_01.json');
const valid = validate(myCase);

if (!valid) {
  console.log(validate.errors);
}
```

### Validate with Python

```python
import json
import jsonschema

with open('schemas/case-meta.schema.json') as f:
    schema = json.load(f)

with open('cases/req-001_v1.0.0_default-v1_01.json') as f:
    instance = json.load(f)

jsonschema.validate(instance=instance, schema=schema)
```

### Validate with Command Line

Using `ajv-cli`:

```bash
npm install -g ajv-cli
ajv validate -s schemas/case-meta.schema.json -d "cases/*.json"
```

## Rating Dimensions

The **RatingRecord** schema includes these evaluation dimensions:

| Dimension | Description | Scale |
|-----------|-------------|-------|
| **clarity** | Visual clarity and legibility | 1-5 |
| **recognizability** | Ease of recognition without context | 1-5 |
| **semantic_transparency** | How well it conveys intended meaning | 1-5 |
| **pragmatic_fit** | Usefulness in real communication contexts | 1-5 |
| **cultural_adequacy** | Cultural appropriateness and relevance | 1-5 |
| **cognitive_accessibility** | Accessibility for users with cognitive differences | 1-5 |

## Decision Types

- **accept**: Pictogram is ready for production use
- **accept-with-edits**: Pictogram is acceptable but requires minor improvements
- **reject**: Pictogram needs significant rework or regeneration

## Edit Categories

When `decision` is "accept-with-edits" or "reject", specify required edits:

- `color`: Color adjustments needed
- `shape`: Shape or form modifications
- `detail-level`: Simplification or detail enhancement
- `composition`: Layout or arrangement changes
- `symbolism`: Symbolic representation issues
- `cultural-adaptation`: Cultural or linguistic adaptations
- `accessibility`: Accessibility improvements
- `other`: Other types of edits

## Schema Versioning

Schemas follow semantic versioning. Breaking changes increment the major version and require updating the `$id` field.
