# Using Rubric Scale Descriptions

This document explains how to use the centralized rubric scale descriptions system.

## Overview

All operational definitions for the VCSCI evaluation rubric are stored in a single source of truth:

**[data/rubric-scale-descriptions.json](../data/rubric-scale-descriptions.json)**

This JSON file contains:
- General scale definitions (scores 1-5) applicable across all dimensions
- Dimension-specific descriptions for each score level
- Both Spanish and English versions
- Structured data for programmatic access

## File Structure

```json
{
  "version": "1.0.0",
  "scale": {
    "5": { "label": "Excelente", "label_en": "Excellent", ... },
    "4": { "label": "Bien", ... },
    ...
  },
  "dimensions": {
    "clarity": {
      "name_es": "Claridad",
      "name": "Clarity",
      "description_es": "...",
      "levels": {
        "5": { "text": "...", "text_en": "..." },
        ...
      }
    },
    ...
  }
}
```

## Usage Examples

### 1. In Web Interfaces

The HTML evaluation interface can load and display rubric descriptions:

```javascript
// Load rubric
const response = await fetch('../data/rubric-scale-descriptions.json');
const rubric = await response.json();

// Get description for a specific dimension and score
const dimension = 'clarity';
const score = 4;
const description = rubric.dimensions[dimension].levels[score.toString()].text;

// Display to user
console.log(description);
```

**Example**: [examples/hexagonal-rating-with-descriptions.html](../examples/hexagonal-rating-with-descriptions.html)

### 2. In Analysis Scripts

Scripts can compile evaluations into narrative text:

```bash
# Compile evaluation from scores
node scripts/compile-evaluation-text.js --scores 5,3,3,4,5,4

# Compile from case file
node scripts/compile-evaluation-text.js --case req-001_v1.0.0_default-v1_01

# Output in HTML format
node scripts/compile-evaluation-text.js --scores 5,3,3,4,5,4 --format html

# English output
node scripts/compile-evaluation-text.js --scores 5,3,3,4,5,4 --lang en
```

Output example:

```
*Funciona bien, pero se puede mejorar. Mejoras menores opcionales.*

**VCSCI Score: 4.17/5.0 (Bien)**

**Claridad**: El pictograma tiene líneas nítidas y limpias sin artefactos visuales. El contraste es alto y los elementos se distinguen inmediatamente. No hay ruido visual. Escala perfectamente a cualquier tamaño. La calidad técnica es profesional y lista para uso en producción.

**Reconocibilidad**: El pictograma es reconocible con consideración breve (2-3 segundos). El significado principal es claro aunque pueden existir interpretaciones alternativas menores. Utiliza elementos visuales comunes...

[...]
```

### 3. In Report Generation

The generate-report script can include dimension-specific descriptions in reports:

```javascript
const rubric = require('../data/rubric-scale-descriptions.json');

function getDimensionDescription(dimension, score, lang = 'es') {
  const textKey = lang === 'en' ? 'text_en' : 'text';
  return rubric.dimensions[dimension].levels[score.toString()][textKey];
}

// Use in report
const clarityDesc = getDimensionDescription('clarity', 5, 'es');
```

### 4. Validation

The rubric descriptions file is validated using JSON Schema:

```bash
# Validate structure
ajv validate -s schemas/rubric-descriptions.schema.json -d data/rubric-scale-descriptions.json
```

Schema ensures:
- All 6 dimensions are present
- Each dimension has descriptions for levels 1-5
- Both Spanish and English versions exist
- Version follows semantic versioning

## Updating Descriptions

### Process

1. Edit [data/rubric-scale-descriptions.json](../data/rubric-scale-descriptions.json)
2. Validate with schema: `ajv validate -s schemas/rubric-descriptions.schema.json -d data/rubric-scale-descriptions.json`
3. Update version number if making breaking changes
4. Test in web interface: open [examples/hexagonal-rating-with-descriptions.html](../examples/hexagonal-rating-with-descriptions.html)
5. Commit changes

### Versioning

Follow semantic versioning:
- **Major** (2.0.0): Restructure format, remove dimensions
- **Minor** (1.1.0): Add new dimension, add new language
- **Patch** (1.0.1): Fix typos, clarify wording

## Benefits of Centralization

1. **Single Source of Truth**: One place to update all rubric text
2. **Consistency**: Same descriptions used across all interfaces
3. **Bilingual**: Spanish and English in sync
4. **Programmatic Access**: Easy to query and compile
5. **Validation**: Schema ensures completeness
6. **Version Control**: Track changes over time
7. **Reusability**: Use in web UI, scripts, reports, papers

## Related Files

- **[docs/rubric.md](rubric.md)**: Human-readable rubric documentation
- **[schemas/rubric-descriptions.schema.json](../schemas/rubric-descriptions.schema.json)**: Validation schema
- **[scripts/compile-evaluation-text.js](../scripts/compile-evaluation-text.js)**: Compilation script
- **[examples/hexagonal-rating-with-descriptions.html](../examples/hexagonal-rating-with-descriptions.html)**: Interactive demo

## Next Steps

- [ ] Integrate with production evaluation interface
- [ ] Add descriptions to automated email reports
- [ ] Generate printable reference sheets from JSON
- [ ] Translate to additional languages (Portuguese, French)
- [ ] Create mobile-optimized version

---

**Note**: Always reference the JSON file programmatically. Do not hard-code rubric text in multiple places.
