# VCSCI Examples

This directory contains interactive demonstrations and example files for the VCSCI evaluation framework.

---

## 🌐 Interactive Demos

### Hexagonal Rating Interface (Bilingual)

**File:** [hexagonal-rating-with-descriptions.html](hexagonal-rating-with-descriptions.html)

The primary evaluation interface for VCSCI pictogram assessment.

**Features:**

- ✨ Real-time hexagonal visualization using SVG
- 📖 Live rubric descriptions from centralized JSON
- 🌐 **Bilingual support** (Spanish/English)
- 🎨 **Score-based colour system** (1-5 ratings mapped to colours)
- 📝 Compiled evaluation with all 6 dimension paragraphs
- 📥 One-click JSON export with complete transparency
- 🎭 Lexend typography for optimal readability
- 🌟 Light theme for professional environments

**Colour System (Score-Based):**

Colours are assigned by **score level** (1-5), not by dimension:

| Score | Label (EN)     | Label (ES)   | Colour     | Hex     |
| ----- | -------------- | ------------ | ---------- | ------- |
| 1     | Not Functional | No funcional | Red        | #dc2626 |
| 2     | Insufficient   | Insuficiente | Orange     | #ea580c |
| 3     | Works          | Funciona     | Yellow     | #ffd93d |
| 4     | Good           | Bien         | Lime Green | #84cc16 |
| 5     | Excellent      | Excelente    | Dark Green | #16a34a |

This creates a consistent visual language where lower scores are warm colours (red/orange) and higher scores are cool colours (green).

**How to use:**

1. Open HTML file in browser
2. Adjust 6 rating sliders (1-5) for each dimension
3. Watch hexagon update in real-time with colour-coded vertices
4. See dimension descriptions update on the right panel
5. Review compiled evaluation at bottom
6. Export JSON with full rubric transparency

---

### Metadata Visualizer

**File:** [metadata-visualizer.html](metadata-visualizer.html)

Extract and visualize VCSCI metadata embedded in SVG pictograms.

**Features:**

- 📤 Drag & drop SVG files
- 🔍 Extract embedded metadata
- 📊 Display hexagonal visualization
- 🧠 Show complete chain of thought
- 📋 Display provenance information

**How to use:**

1. Open HTML file in browser
2. Drag an SVG file with embedded VCSCI metadata onto the drop zone
3. View extracted scores and complete evaluation
4. Inspect the full chain of thought and generation process

---

## 📂 Example Data

### Exported Evaluation Example

**File:** [exported-evaluation-example.json](exported-evaluation-example.json)

Complete example of JSON exported from the hexagonal interface.

**Contains:**

- Metadata (evaluation date, version, interface type, case ID)
- Individual scores for each of 6 dimensions
- VCSCI composite score (0-5)
- Overall assessment with bilingual labels and descriptions
- Complete dimension evaluations (Spanish and English)
- Compiled evaluation with coloured paragraphs
- Full text narrative
- Visualization metadata (colour system)
- Rubric transparency note

**Use cases:**

- Reference format for custom evaluation tools
- Dataset publication template
- Research reproducibility standard
- API integration example

---

### Canonical SVG with Varied Scores

**File:** [test-canonical-varied-scores.svg](test-canonical-varied-scores.svg)

Test SVG pictogram with embedded VCSCI metadata.

**Scores:** 5, 4, 4, 5, 4, 5 (VCSCI: 4.5)

**Purpose:**

- Validate metadata visualizer functionality
- Test metadata extraction
- Demonstrate SVG embedding format
- Serve as integration test case

---

### Toy Example (Complete Workflow)

**Directory:** [toy-example/](toy-example/)

Complete working example demonstrating the full VCSCI evaluation workflow for the phrase **"Voy a hacer mi cama"** (I'm going to make my bed).

**Contains:**

- `case.json` - Case definition with phrase and metadata
- `semantic-analysis.json` - Semantic breakdown and NSM analysis
- `visual-structure.json` - Visual composition elements
- `pictogram.svg` - Generated SVG with embedded metadata
- `metadata.json` - Sidecar metadata file
- `vcsci-evaluation.json` - Complete evaluation with perfect scores (5.0/5.0)
- `README.md` - Detailed explanation of the workflow

**Demonstrates:**

- Input → Generation → Evaluation → Storage chain
- Metadata embedding in SVG
- Bilingual evaluation structure
- Score-based colour system
- Rubric transparency

---

## 🛠 Technical Details

### Data Sources

All examples load data from:

- `../data/rubric-scale-descriptions.json` - Centralized bilingual rubric definitions
- `../locales/es.json` - Spanish translations
- `../locales/en.json` - English translations
- `../schemas/` - JSON schemas for validation
- `../style/` - Style profile configurations

### Colour System

The new **score-based colour system** applies colours to scores (1-5) rather than dimensions:

```javascript
// Get colour for a score
const score = 5;
const rubric = loadRubric();
const color = rubric.scale[score].color;  // "#16a34a" (dark green)
```

This ensures consistent visual feedback where performance level is immediately apparent from colour:

- 🔴 Red (1) = Not functional
- 🟠 Orange (2) = Insufficient
- 🟡 Yellow (3) = Works
- 🟢 Lime (4) = Good
- 🟢 Dark green (5) = Excellent

### Browser Compatibility

All HTML examples work in modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

No build step required - just open in a browser!

---

## 📚 Documentation

For complete documentation, see:

- [Main README](../README.md) - Project overview and quick start
- [Hexagonal Interface Documentation](../docs/hexagonal-interface.md) - Interface design details
- [Rubric Documentation](../docs/rubric.md) - Evaluation criteria and scale definitions
- [Rubric Descriptions Usage](../docs/rubric-descriptions-usage.md) - How to use centralized rubric
- [Canonical Example](../docs/canonical-example.md) - Detailed walkthrough
- [i18n Guide](../locales/README.md) - Internationalisation guidelines

---

## 🤝 Contributing

To add new examples:

1. Create HTML/JSON file in this directory
2. Follow existing naming conventions
3. Document thoroughly in this README
4. Reference from main project README
5. Ensure bilingual support where applicable
6. Add to CI validation if applicable

---

**Version:** 1.0.0 (Updated 2026-01-27)
**Colour System:** Score-based (v2.0)
