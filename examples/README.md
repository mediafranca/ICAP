# VCSCI Examples

This directory contains interactive demos and example files for the VCSCI evaluation framework.

## 🚀 Quick Start

**[Open the Interactive Index](index.html)** - Navegación visual de todos los ejemplos con explicación completa de VCSCI.

The index provides:

- Visual explanation of what VCSCI is
- Interactive cards for all demos
- Links to data examples
- Complete workflow diagram
- Quick access to all resources

## Interactive Demos

### 1. Hexagonal Rating with Gradient Interpolation ✨ NEW

**File:** [hexagonal-rating-gradient.html](hexagonal-rating-gradient.html)

**Features:**
- 🎨 **Gradient color interpolation** - Each vertex has its own color with radial gradients
- ✨ Canvas 2D rendering with smooth color blending between dimensions
- 📖 Live rubric descriptions as you rate (from centralized JSON)
- 📝 Compiled evaluation (overall) showing all 6 paragraphs
- 📥 JSON export with gradient metadata
- 🌓 Dark theme optimized for visual impact
- 🎭 Lexend typography for optimal readability

**Unique color per dimension:**

- Clarity: Red (#ff6b6b)
- Semantic Transparency: Yellow (#ffd93d)
- Pragmatic Fit: Green (#6bcf7f)
- Cultural Adequacy: Blue (#4d96ff)
- Cognitive Accessibility: Purple (#9b59b6)
- Recognizability: Orange (#ff8c42)

**Technical approach:**
Uses Canvas 2D with radial gradients from center to simulate per-vertex color interpolation. Each triangular segment from the center to two adjacent vertices gets its own gradient, creating a smooth color blend effect across the hexagon.

### 2. Hexagonal Rating with Descriptions

**File:** [hexagonal-rating-with-descriptions.html](hexagonal-rating-with-descriptions.html)

**Features:**
- ✨ Real-time hexagonal visualization using SVG
- 📖 Live rubric descriptions (from centralized JSON)
- 📝 Compiled evaluation (overall) with all 6 paragraphs
- 📥 One-click JSON export with complete transparency
- 🎨 Lexend typography
- 🌐 Bilingual support (Spanish/English)
- 🌟 Light theme for professional environments

**How to use:**

1. Open HTML file in browser
2. Adjust 6 rating sliders (1-5)
3. Watch hexagon update in real-time
4. See dimension descriptions on right
5. Review compiled evaluation at bottom
6. Export JSON with full rubric transparency

### 3. Original Hexagonal Demo

**File:** [hexagonal-rating-demo.html](hexagonal-rating-demo.html)

Basic hexagonal rating interface without rubric integration (legacy version).

### 3. Visualization Comparison

**File:** [visualization-comparison.html](visualization-comparison.html)

Compare 6 different visualization styles for multi-dimensional ratings:

- Hexagon/radar (recommended)
- Horizontal bars
- Circle grid
- Heatmap
- Gauge meters
- Star ratings

### 4. Metadata Visualizer

**File:** [metadata-visualizer.html](metadata-visualizer.html)

Extract and visualize VCSCI metadata embedded in SVG pictograms.

**Features:**

- Drag & drop SVG files
- Extract embedded metadata
- Display hexagonal visualization
- Show complete chain of thought

## Example Data

### Exported Evaluation Example

**File:** [exported-evaluation-example.json](exported-evaluation-example.json)

Complete example of JSON exported from the hexagonal interface, showing:

- Metadata (date, version, source)
- Individual scores for each dimension
- VCSCI composite score
- Overall assessment with label and description
- Complete dimension evaluations (bilingual)
- Compiled evaluation with all paragraphs
- Full text narrative
- Rubric transparency note

**Use cases:**

- Reference format for custom tools
- Dataset publication template
- Research reproducibility
- API integration example

### Toy Example

**Directory:** [toy-example/](toy-example/)

Complete working example demonstrating the full evaluation workflow:

- Case definition JSON
- SVG pictogram with embedded metadata
- Sidecar metadata JSON
- Demonstrates entire chain: input → generation → evaluation → storage

## Development

All examples load data from:

- `../data/rubric-scale-descriptions.json` - Centralized rubric definitions
- `../schemas/` - JSON schemas for validation
- `../style/` - Style profile configurations

## Browser Compatibility

All HTML examples work in modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

No build step required - just open in a browser!

## Contributing

To add new examples:

1. Create HTML/JSON file in this directory
2. Document in this README
3. Reference from main project README
4. Add to CI validation if applicable

---

**For complete documentation**, see:

- [Main README](../README.md)
- [Hexagonal Interface Documentation](../docs/hexagonal-interface.md)
- [Rubric Descriptions Usage](../docs/rubric-descriptions-usage.md)
