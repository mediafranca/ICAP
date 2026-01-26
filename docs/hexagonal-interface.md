# Hexagonal Evaluation Interface

## Concept

The 6 evaluation dimensions form a perfect hexagon when all scores are at maximum (5). This provides:

- **Visual intuition**: Shape shows quality profile at a glance
- **Balance assessment**: Perfect hexagon = balanced excellence
- **Weakness identification**: Indentations show weak dimensions
- **Comparative analysis**: Overlay multiple pictograms to compare

## The Six Dimensions

```
                    Clarity (12 o'clock)
                         /\
                        /  \
                       /    \
    Recognizability   /      \   Semantic
    (10 o'clock)     /        \  Transparency
                    /          \ (2 o'clock)
                   /            \
                  |    center    |
                   \            /
                    \          /
    Cognitive        \        /   Pragmatic
    Accessibility     \      /    Fit
    (8 o'clock)        \    /     (4 o'clock)
                        \  /
                         \/
                Cultural Adequacy (6 o'clock)
```

## Visual Design

### Hexagon Properties

- **Center**: Origin (0,0), represents score of 0
- **Each vertex**: Distance from center represents score (1-5)
- **Perfect hexagon**: All vertices at distance 5
- **Filled area**: Colored shape showing current scores
- **Grid lines**: Concentric hexagons at 1, 2, 3, 4, 5

### Color Scheme

```
Score 5 (Excellent)    : #2ecc71 (green)
Score 4 (Good)         : #95e1d3 (light green)
Score 3 (Acceptable)   : #f39c12 (orange)
Score 2 (Below Avg)    : #e74c3c (red-orange)
Score 1 (Poor)         : #c0392b (red)

Grid lines             : #ecf0f1 (light gray)
Axis labels            : #2c3e50 (dark gray)
```

### Interactive Features

1. **Hover**: Show exact score and dimension name
2. **Click dimension**: Show anchoring examples for that dimension
3. **Toggle**: Show/hide grid, labels, or comparison overlays
4. **Export**: Save as SVG or PNG

## Implementation

### SVG-Based Interface

```html
<svg viewBox="0 0 400 400" width="400" height="400">
  <!-- Grid (concentric hexagons) -->
  <g class="grid">
    <polygon points="..." fill="none" stroke="#ecf0f1" />
    <!-- Repeat for scores 1-5 -->
  </g>

  <!-- Axes (lines from center to vertices) -->
  <g class="axes">
    <line x1="200" y1="200" x2="200" y2="50" stroke="#bdc3c7" />
    <!-- Repeat for all 6 dimensions -->
  </g>

  <!-- Data shape -->
  <polygon
    points="..."
    fill="#3498db"
    fill-opacity="0.3"
    stroke="#2980b9"
    stroke-width="2"
  />

  <!-- Dimension labels -->
  <g class="labels">
    <text x="200" y="40" text-anchor="middle">Clarity</text>
    <!-- Repeat for all 6 dimensions -->
  </g>

  <!-- Score indicators (dots on vertices) -->
  <g class="scores">
    <circle cx="..." cy="..." r="5" fill="#2980b9" />
    <!-- Repeat for all 6 dimensions -->
  </g>
</svg>
```

### Hexagon Coordinate Calculation

For a regular hexagon with center at (cx, cy) and radius r:

```javascript
function hexagonVertex(index, radius, centerX, centerY) {
  // index: 0-5 (6 vertices)
  // Start at top (12 o'clock) and go clockwise
  const angleRad = (Math.PI / 3) * index - (Math.PI / 2);
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad)
  };
}

// Dimension mapping
const dimensions = [
  'clarity',                    // 0: top (12 o'clock)
  'semantic_transparency',      // 1: top-right (2 o'clock)
  'pragmatic_fit',              // 2: bottom-right (4 o'clock)
  'cultural_adequacy',          // 3: bottom (6 o'clock)
  'cognitive_accessibility',    // 4: bottom-left (8 o'clock)
  'recognizability'             // 5: top-left (10 o'clock)
];
```

### Score to Position

```javascript
function scoreToPosition(dimensionIndex, score, maxScore = 5) {
  const maxRadius = 150; // pixels from center
  const radius = (score / maxScore) * maxRadius;
  return hexagonVertex(dimensionIndex, radius, 200, 200);
}

// Generate polygon points
function generateHexagonPath(scores) {
  return dimensions
    .map((dim, i) => scoreToPosition(i, scores[dim] || 0))
    .map(p => `${p.x},${p.y}`)
    .join(' ');
}
```

## Use Cases

### 1. Individual Evaluation Interface

**During evaluation:**
- Evaluator sees pictogram on left
- Hexagonal widget on right starts as flat/collapsed
- As evaluator rates each dimension, hexagon grows
- Visual feedback shows progress and balance

**Benefits:**
- Immediate visual feedback
- Encourages balanced evaluation
- Makes incomplete ratings obvious

### 2. Case Comparison

**Overlay multiple cases:**
- Base case: Solid blue hexagon
- Comparison 1: Dotted red hexagon
- Comparison 2: Dashed green hexagon

**Use for:**
- Comparing different pipeline versions
- Before/after iteration
- Style profile comparison

### 3. Aggregate Visualization

**Show mean scores:**
- Solid hexagon: Mean scores
- Shaded band: ± 1 standard deviation
- Individual cases: Faint background hexagons

**Use for:**
- Model-level evaluation reports
- Pipeline performance summaries
- Phrase-level aggregates

### 4. Dashboard Summary

**Grid of hexagons:**
- One small hexagon per case
- Color-coded by overall VCSCI score
- Click to expand details

**Use for:**
- Batch evaluation overview
- Quality control screening
- Identifying outliers

## Interactive Rating Widget

### Step-by-Step Evaluation

```
Step 1: Clarity
[Pictogram display]
[Hexagon starts flat]
Rate clarity: ○ 1  ○ 2  ○ 3  ○ 4  ○ 5
[Hexagon's "Clarity" vertex extends as you select]

Step 2: Recognizability
[Same pictogram]
[Hexagon shows clarity score, ready for recognizability]
Rate recognizability: ○ 1  ○ 2  ○ 3  ○ 4  ○ 5
[Hexagon's "Recognizability" vertex extends]

... continue for all 6 dimensions ...

Step 7: Overall Decision
[Complete hexagon displayed]
[Summary stats shown]
Decision:
○ Accept
○ Accept with edits
○ Reject
```

### Benefits

1. **Gamification**: Growing the hexagon is satisfying
2. **Consistency**: Visual feedback helps maintain standards
3. **Awareness**: Easy to spot if you're being too harsh/lenient
4. **Completion**: Clear when evaluation is done

## Technical Implementation

### React Component Example

```jsx
function HexagonRating({ scores }) {
  const points = generateHexagonPath(scores);

  return (
    <svg viewBox="0 0 400 400" className="hexagon-chart">
      <HexagonGrid maxRadius={150} />
      <HexagonAxes />
      <polygon
        points={points}
        fill="rgba(52, 152, 219, 0.3)"
        stroke="#2980b9"
        strokeWidth="2"
      />
      <DimensionLabels />
      <ScoreDots scores={scores} />
    </svg>
  );
}
```

### D3.js Visualization

```javascript
const svg = d3.select('#hexagon')
  .append('svg')
  .attr('viewBox', '0 0 400 400');

// Add grid
svg.selectAll('.grid-line')
  .data([1, 2, 3, 4, 5])
  .enter()
  .append('polygon')
  .attr('points', d => hexagonPoints(d * 30))
  .attr('fill', 'none')
  .attr('stroke', '#ecf0f1');

// Add data polygon with animation
svg.append('polygon')
  .attr('points', generateHexagonPath(scores))
  .attr('fill', 'rgba(52, 152, 219, 0.3)')
  .attr('stroke', '#2980b9')
  .attr('stroke-width', 2)
  .transition()
  .duration(1000)
  .attr('points', generateHexagonPath(newScores));
```

## Accessibility Considerations

### For Visual Impairments

- **Alt text**: Describe hexagon shape and scores
- **Data table**: Provide table view as alternative
- **High contrast mode**: Increase stroke width and contrast
- **Screen reader**: Announce scores as they're entered

### For Cognitive Accessibility

- **Simple colors**: Clear good/bad color coding
- **Labels**: Short, clear dimension names
- **Grid lines**: Help judge distances
- **Tooltips**: Explain what each dimension means

## Export and Sharing

### PNG Export
High-resolution image for reports and presentations

### SVG Export
Vector format for papers and scalable displays

### JSON Data
```json
{
  "case_id": "req-001_v1.0.0_default-v1_01",
  "scores": {
    "clarity": 4,
    "recognizability": 5,
    "semantic_transparency": 3,
    "pragmatic_fit": 4,
    "cultural_adequacy": 4,
    "cognitive_accessibility": 5
  },
  "vcsci_score": 4.17,
  "visualization": "hexagon"
}
```

## Future Enhancements

1. **Animation**: Smooth transitions between scores
2. **Comparison mode**: Overlay multiple hexagons
3. **Time-series**: Show evolution across iterations
4. **3D view**: Depth shows confidence/agreement
5. **Mobile gesture**: Swipe to navigate dimensions
6. **AR view**: Display hexagon over physical pictogram

## References

- [Radar Charts in D3.js](https://www.d3-graph-gallery.com/spider)
- [Chart.js Radar Charts](https://www.chartjs.org/docs/latest/charts/radar.html)
- [Spider Diagrams for Multi-criteria Evaluation](https://en.wikipedia.org/wiki/Radar_chart)
