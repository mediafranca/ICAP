# Pictograms Directory

This directory stores generated pictogram outputs organized by case_id.

## Structure

Each case has its own subdirectory containing output files:

```
pictograms/
├── req-001_v1.0.0_default-v1_01/
│   ├── output.svg
│   ├── preview.png
│   └── meta.json
├── req-002_v1.0.0_default-v1_01/
│   ├── output.svg
│   ├── preview.png
│   └── meta.json
└── ...
```

## Files

### output.svg
The generated pictogram in SVG format. This is the primary artifact.

### preview.png (optional)
Rasterized preview of the SVG for quick viewing and sharing.
Recommended size: 512x512px or 1024x1024px.

### meta.json (optional)
Copy of generation metadata for convenience. The authoritative metadata is in `cases/{case_id}.json`.

## File Naming

- Directory name must match the `case_id`
- Main file must be named `output.svg`
- Preview should be named `preview.png` or `preview.jpg`

## Git Considerations

Depending on the number and size of files:
- **Small datasets** (< 50 SVGs): Commit to git
- **Medium datasets** (50-200): Consider Git LFS
- **Large datasets** (> 200): Store externally, track only metadata

See [../docs/data-handling.md](../docs/data-handling.md) for guidance.
