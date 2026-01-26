# Metadata Embedding in SVG Pictograms

## Concept

Each pictogram SVG is an **atomic unit** that carries its own metadata as the **single source of truth**. This ensures:

- **Traceability**: Complete provenance of the pictogram
- **Portability**: SVG + metadata travel together
- **Integrity**: No orphaned files or broken references
- **Chain of Thought**: Full history from prompt to evaluation

## The Chain of Thought

```
1. Input: Phrase + Style Profile + Pipeline Config
   ↓
2. Generation: Model produces SVG
   ↓
3. Evaluation: Human assessment (hexagonal rating)
   ↓
4. Metadata: Evaluation becomes SSOT
   ↓
5. Storage: SVG with embedded metadata
```

## Metadata Structure

### Complete Metadata Object

```json
{
  "vcsci": {
    "version": "1.0.0",
    "case_id": "req-001_v1.0.0_default-v1_01",
    "phrase_id": "req-001",

    "chain_of_thought": {
      "1_input": {
        "phrase": {
          "spanish": "Quiero ir al baño.",
          "english": "I want to go to the toilet.",
          "domain": "Higiene/Salud"
        },
        "style_profile_id": "default-v1",
        "pipeline_version": "v1.0.0"
      },

      "2_generation": {
        "model": "gpt-4-vision",
        "timestamp": "2025-01-26T15:30:00Z",
        "prompt": "Create a simple, clear pictogram...",
        "parameters": {
          "temperature": 0.7,
          "seed": 42
        }
      },

      "3_evaluation": {
        "ratings": {
          "clarity": 4,
          "recognizability": 5,
          "semantic_transparency": 4,
          "pragmatic_fit": 5,
          "cultural_adequacy": 4,
          "cognitive_accessibility": 5
        },
        "vcsci_score": 4.5,
        "decision": "accept",
        "evaluator_role": "expert-aac",
        "evaluation_date": "2025-01-26",
        "required_edits": []
      },

      "4_provenance": {
        "created_by": "VCSCI Pipeline v1.0.0",
        "created_at": "2025-01-26T15:30:00Z",
        "evaluated_at": "2025-01-26T16:00:00Z",
        "iteration": 1,
        "parent_case_id": null
      }
    }
  }
}
```

## Embedding Methods

### Method 1: SVG Metadata Element (Recommended)

Embed JSON in SVG `<metadata>` element:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <metadata>
    <vcsci:metadata xmlns:vcsci="https://vcsci.org/schema/v1">
      <![CDATA[
      {
        "vcsci": {
          "version": "1.0.0",
          "case_id": "req-001_v1.0.0_default-v1_01",
          ...
        }
      }
      ]]>
    </vcsci:metadata>
  </metadata>

  <title>I want to go to the toilet</title>
  <desc>Pictogram showing person and toilet with movement indicator</desc>

  <!-- SVG content -->
  <g id="pictogram">
    ...
  </g>
</svg>
```

**Advantages:**
- ✅ Self-contained
- ✅ Standards-compliant
- ✅ Preserved through SVG editors
- ✅ Extractable with XML parsers

**Disadvantages:**
- ❌ Increases file size
- ❌ Not all tools preserve metadata

### Method 2: Sidecar JSON File

Store metadata separately but with strong naming convention:

```
pictograms/req-001_v1.0.0_default-v1_01/
├── output.svg                  # The pictogram
├── metadata.json               # The SSOT metadata
└── preview.png                 # Optional preview
```

**Advantages:**
- ✅ Clean SVG file
- ✅ Easy to parse
- ✅ Can update metadata independently

**Disadvantages:**
- ❌ Files can become separated
- ❌ Requires paired management

### Method 3: Hybrid (Recommended for Production)

**Core metadata** in SVG (case_id, phrase_id, vcsci_score)
**Full metadata** in sidecar JSON

```xml
<!-- Minimal metadata in SVG -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
     data-case-id="req-001_v1.0.0_default-v1_01"
     data-vcsci-score="4.5"
     data-decision="accept">
  <metadata>
    <vcsci:ref href="metadata.json" />
  </metadata>
  ...
</svg>
```

```json
// Full metadata in metadata.json
{
  "vcsci": { ... }
}
```

## Metadata as Single Source of Truth

### What Makes it SSOT?

1. **Immutable case_id**: Permanent identifier
2. **Complete provenance**: Full chain of thought
3. **Evaluation results**: The "certificate of quality"
4. **Iteration tracking**: Links to previous versions
5. **Timestamp**: When this truth was established

### Querying the SSOT

```javascript
// Extract metadata from SVG
function extractMetadata(svgPath) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const metadataMatch = svgContent.match(/<!\[CDATA\[(.*?)\]\]>/s);
  if (metadataMatch) {
    return JSON.parse(metadataMatch[1]);
  }
  return null;
}

// Validate metadata integrity
function validateMetadata(metadata) {
  const required = ['case_id', 'phrase_id', 'chain_of_thought'];
  return required.every(field => metadata.vcsci[field] !== undefined);
}
```

## Iteration and Versioning

### First Iteration

```
case_id: req-001_v1.0.0_default-v1_01
parent_case_id: null
iteration: 1
```

### After Edits (Second Iteration)

```
case_id: req-001_v1.0.0_default-v1_02
parent_case_id: req-001_v1.0.0_default-v1_01
iteration: 2

chain_of_thought:
  3_evaluation:
    required_edits_from_parent:
      - category: color
        description: Increase contrast
        priority: important
```

### Tracing History

```javascript
function getIterationChain(caseId) {
  const chain = [];
  let current = caseId;

  while (current) {
    const metadata = loadMetadata(current);
    chain.push(metadata);
    current = metadata.vcsci.chain_of_thought['4_provenance'].parent_case_id;
  }

  return chain.reverse(); // Oldest to newest
}
```

## Integration with Evaluation Interface

### During Evaluation

User rates pictogram → hexagonal interface → metadata is generated:

```javascript
async function completeEvaluation(caseId, ratings, decision, requiredEdits) {
  // Load existing metadata
  const metadata = await loadCaseMetadata(caseId);

  // Add evaluation node to chain of thought
  metadata.vcsci.chain_of_thought['3_evaluation'] = {
    ratings,
    vcsci_score: calculateVCSCI(ratings),
    decision,
    evaluator_role: getCurrentEvaluatorRole(),
    evaluation_date: new Date().toISOString().split('T')[0],
    required_edits: requiredEdits
  };

  // Embed in SVG
  await embedMetadataInSVG(caseId, metadata);

  // Also save sidecar for easy access
  await saveSidecarJSON(caseId, metadata);

  return metadata;
}
```

### After Evaluation

The SVG is now "certified" and carries its own truth:

```xml
<svg data-vcsci-certified="true" data-decision="accept">
  <metadata>
    <!-- Full evaluation metadata -->
  </metadata>
  <!-- Pictogram content -->
</svg>
```

## Scripts for Metadata Management

### Extract Metadata

```bash
# Extract metadata from all SVGs
node scripts/extract-metadata.js pictograms/

# Output: metadata/ directory with all metadata.json files
```

### Validate Chain Integrity

```bash
# Check that all SVGs have valid metadata
node scripts/validate-chain.js

# Checks:
# - SVG exists
# - Metadata exists (embedded or sidecar)
# - case_id matches filename
# - Chain of thought is complete
# - Parent references are valid
```

### Generate Provenance Report

```bash
# Show complete chain of thought for a case
node scripts/provenance.js req-001_v1.0.0_default-v1_02

# Output:
# Iteration 1: req-001_v1.0.0_default-v1_01
#   Generated: 2025-01-26T15:30:00Z
#   Evaluated: 2025-01-26T16:00:00Z
#   Decision: accept-with-edits
#   Required edits: Increase contrast
#
# Iteration 2: req-001_v1.0.0_default-v1_02
#   Generated: 2025-01-26T17:00:00Z
#   Evaluated: 2025-01-26T17:30:00Z
#   Decision: accept
#   VCSCI Score: 4.5
```

## Storage and Archival

### Production-Ready SVGs

Only SVGs with `decision: "accept"` are production-ready:

```bash
# Copy accepted SVGs to production folder
node scripts/deploy-accepted.js \
  --source pictograms/ \
  --dest production/pictograms/

# Only copies SVGs with metadata.vcsci.chain_of_thought[3_evaluation].decision === "accept"
```

### Long-Term Storage

```
archive/
├── 2025-01-26/
│   ├── req-001_v1.0.0_default-v1_01.svg
│   ├── req-001_v1.0.0_default-v1_01.json
│   └── manifest.json
└── manifest.json  # Index of all archived cases
```

## Benefits of This Approach

1. **Traceability**: Full history in every file
2. **Portability**: SVG can travel anywhere with its truth
3. **Auditability**: Clear provenance for research/compliance
4. **Reproducibility**: All parameters captured
5. **Iteration tracking**: Clear parent-child relationships
6. **Single source**: No confusion about "which metadata is correct"

## Migration Path

### Existing Cases Without Embedded Metadata

```bash
# Migrate existing cases to embedded metadata
node scripts/migrate-to-embedded.js

# Reads cases/*.json
# Reads pictograms/*/output.svg
# Embeds metadata in SVG
# Validates result
```

## Next Steps

1. Implement metadata embedding script
2. Update evaluation interface to generate metadata
3. Create validation script
4. Document metadata schema formally
5. Create examples with embedded metadata
