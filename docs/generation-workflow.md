# Pictogram Generation Workflow

This document describes the process for generating pictogram cases from the core phrase list.

## Overview

```
Core Phrases → Case Generation → Pictogram Output → Metadata Creation
```

## Prerequisites

1. **Core phrase list** with stable phrase_ids
2. **Style profile** selected (e.g., `default-v1`)
3. **Pipeline version** identified (e.g., `v1.0.0`)
4. **Generative model** configured and accessible

## Step-by-Step Process

### 1. Select Phrases

Choose which phrases to generate from the core phrase list:

```bash
# Generate all phrases
node scripts/generate-cases.js --all

# Generate specific function
node scripts/generate-cases.js --function request

# Generate specific phrases
node scripts/generate-cases.js --phrases req-001,req-002,req-003

# Generate N random phrases
node scripts/generate-cases.js --random 20
```

### 2. Configure Generation

Set generation parameters:

```json
{
  "pipeline_version": "v1.0.0",
  "style_profile_id": "default-v1",
  "model_name": "your-model-name",
  "batch_size": 10,
  "variants_per_phrase": 1
}
```

### 3. Generate Pictograms

For each phrase:

1. Load phrase data from core phrase list
2. Load style profile configuration
3. Build prompt using style profile template
4. Call generative model with prompt and parameters
5. Receive SVG output
6. Generate case_id
7. Save files to `pictograms/{case_id}/`
8. Create case metadata

### 4. Generate Case Metadata

Create a JSON file for each case in `cases/`:

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
  "generation_timestamp": "2025-01-26T10:30:00Z",
  "variant": "01",
  "iteration_number": 1,
  "files": {
    "svg": "pictograms/req-001_v1.0.0_default-v1_01/output.svg",
    "preview": "pictograms/req-001_v1.0.0_default-v1_01/preview.png"
  },
  "generation_params": {
    "temperature": 0.7,
    "seed": 42
  }
}
```

### 5. Generate Previews (Optional)

Convert SVG to PNG for easier viewing:

```bash
node scripts/render-previews.js
```

### 6. Validate Output

Check that all files are correctly generated:

```bash
# Validate case metadata against schema
node scripts/validate-schema.js cases

# Check file references
node scripts/check-consistency.js

# List generated cases
ls -la cases/ pictograms/
```

## Manual Generation Process

If you don't have automated scripts yet:

### Manual Step 1: Prepare Input

Create a spreadsheet or list with:
- phrase_id
- Spanish phrase
- English phrase
- Domain

### Manual Step 2: Generate with Model

For each phrase:
1. Open your generative model interface
2. Load the style profile prompt template
3. Replace `{phrase_spanish}` and `{phrase_english}` with actual values
4. Generate the pictogram
5. Download as SVG

### Manual Step 3: Organize Files

```bash
# Create directory for each case
mkdir -p pictograms/req-001_v1.0.0_default-v1_01

# Move SVG file
mv generated.svg pictograms/req-001_v1.0.0_default-v1_01/output.svg
```

### Manual Step 4: Create Metadata

Copy the case metadata template and fill in values:

```bash
cp templates/case-template.json cases/req-001_v1.0.0_default-v1_01.json
# Edit the JSON file with actual values
```

### Manual Step 5: Generate Preview

Use any SVG-to-PNG converter:

```bash
# Using Inkscape
inkscape --export-type=png --export-width=512 \
  pictograms/req-001_v1.0.0_default-v1_01/output.svg

# Using ImageMagick
convert -density 300 -resize 512x512 \
  pictograms/req-001_v1.0.0_default-v1_01/output.svg \
  pictograms/req-001_v1.0.0_default-v1_01/preview.png

# Using rsvg-convert
rsvg-convert -w 512 -h 512 \
  pictograms/req-001_v1.0.0_default-v1_01/output.svg \
  > pictograms/req-001_v1.0.0_default-v1_01/preview.png
```

## Batch Generation

For generating multiple cases:

```bash
# Generate 20 random cases
node scripts/generate-cases.js --random 20 --pipeline v1.0.0 --style default-v1

# Generate all "request" phrases
node scripts/generate-cases.js --function request --pipeline v1.0.0 --style default-v1

# Generate with multiple style profiles for comparison
node scripts/generate-cases.js --phrases req-001 \
  --pipeline v1.0.0 \
  --styles default-v1,simplified-v1,colorful-v1
```

## Quality Control

After generation:

1. **Visual inspection**: Check that SVGs render correctly
2. **Metadata validation**: Verify all required fields are present
3. **Naming consistency**: Ensure case_id matches across files
4. **File integrity**: Confirm SVG files are valid XML

```bash
# Quick visual check
open pictograms/*/preview.png

# Validate SVG syntax
xmllint --noout pictograms/*/output.svg

# Validate metadata
node scripts/validate-schema.js
```

## Troubleshooting

### Issue: Generation fails

- Check model API credentials
- Verify style profile is valid
- Test with a single simple phrase first

### Issue: case_id conflicts

- Ensure pipeline_version and style_profile_id are correct
- Increment variant number if regenerating

### Issue: Invalid SVG

- Check model output format
- Validate SVG syntax with xmllint
- Try adjusting generation parameters

## Next Steps

After generation:
1. Proceed to [evaluation](evaluation-workflow.md)
2. Or run automated analysis if no human evaluation needed
