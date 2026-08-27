# Repository guide

This repository contains a compact Chinese-language book laid out for a 5 × 8 inch page. The source of truth is `main.tex`; `assets/cover.pdf` and the font files under `fonts/` are required inputs.

## Working rules

- Use XeLaTeX. The document depends on `fontspec` and `xeCJK` and is not expected to compile with pdfLaTeX.
- Run commands from the repository root so relative paths to fonts and the cover continue to resolve.
- Write generated files to `build/`. Do not commit auxiliary files or a newly generated root-level PDF unless the task explicitly asks for a release artifact.
- Preserve the 5 × 8 inch geometry, bundled font choices, two-sided running heads, and opening cover unless a request explicitly changes the book design.
- Treat prose edits as editorial changes: preserve wording, punctuation, paragraph order, and intentional whitespace unless they are in scope. Do not silently rewrite the manuscript while changing layout code.
- Keep reusable layout behavior in named macros such as `\StoryParagraph`, `\NarrativeBreak`, and `\UnprintedPause`; avoid repeated one-off formatting in the body.
- Files are UTF-8. Keep Chinese text directly readable rather than replacing it with escaped code points.

## Validation

For TeX or manuscript changes, compile twice:

```bash
mkdir -p build
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
xelatex -interaction=nonstopmode -halt-on-error -output-directory=build main.tex
```

Then check `build/main.log` for errors and serious layout warnings. When a change affects pagination, spacing, fonts, headers, the cover, or other visual output, inspect the resulting `build/main.pdf` as well. If XeLaTeX or PDF inspection tools are unavailable, report the missing verification instead of claiming the output is valid.

## Project skills

Project-specific workflows live under `.agents/skills/`:

- `edit-manuscript`: editing prose and paragraph structure without damaging TeX syntax or editorial intent.
- `build-xelatex`: compiling the book and diagnosing build failures.
- `inspect-pdf`: checking page size, font embedding, pagination, and visual regressions in the produced PDF.

Load the relevant `SKILL.md` before performing one of these workflows.
