---
name: build-xelatex
description: Build and troubleshoot this repository's XeLaTeX book. Use when compiling main.tex, validating TeX changes, or diagnosing missing packages, fonts, assets, and layout warnings.
---

# Build XeLaTeX

Run from the repository root and keep all generated files in `build/`:

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
```

The second pass stabilizes references and PDF metadata. A successful process exit is necessary but not sufficient: inspect `build/main.log` for `!`, `LaTeX Error`, missing characters, font substitution, and overfull or underfull boxes. Judge box warnings in context; report their page or line and visually inspect them rather than hiding warnings globally.

The build requires the bundled fonts and `assets/cover.pdf`. Do not replace those inputs or install unrelated dependencies to conceal a path error. If the engine or a package is missing, identify it precisely and stop; do not fall back to pdfLaTeX.

Never move auxiliary output into the repository root. A generated PDF is a review artifact unless the user explicitly requests updating a tracked release PDF.
