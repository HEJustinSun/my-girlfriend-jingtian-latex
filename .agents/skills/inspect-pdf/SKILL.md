---
name: inspect-pdf
description: Inspect the compiled book PDF for page geometry, cover handling, font embedding, pagination, headers, spacing, and visual regressions. Use after changes that can affect rendered output or when reviewing a supplied build.
---

# Inspect PDF

Inspect `build/main.pdf` after a successful two-pass build, or use the PDF path supplied by the user. Prefer objective metadata checks plus rendered-page review.

1. Use `pdfinfo` (or an equivalent tool) to confirm the expected page count and that body pages are 5 × 8 inches (360 × 576 points). The included cover may need separate attention because `fitpaper=true` preserves its page size.
2. Use `pdffonts` to confirm fonts are embedded and that Chinese glyphs are not being substituted or omitted.
3. Render affected pages to images with `pdftoppm`, `mutool draw`, or an available equivalent. Inspect the cover, first body page, pages around each change, and at least one typical odd/even spread.
4. Check for clipped text, blank or duplicated pages, stranded short lines, collisions, unexpected header/footer changes, uneven narrative breaks, and suspiciously large gaps.

Compare against the tracked root PDF when it is a meaningful baseline, but do not overwrite it merely to perform a comparison. Report which pages were inspected and distinguish confirmed defects from subjective typography observations.
