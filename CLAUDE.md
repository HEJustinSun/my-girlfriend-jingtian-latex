# Claude Code guide

Read and follow `AGENTS.md`; it is the canonical repository guide.

## Repository map

- `main.tex`: document preamble, layout macros, metadata, and manuscript body.
- `assets/cover.pdf`: first page, included at its native page size.
- `fonts/`: bundled Source Han fonts and their licenses.
- `.agents/skills/`: focused instructions for manuscript editing, XeLaTeX builds, and PDF inspection.
- `build/`: ignored build output.

Before editing, inspect the relevant part of `main.tex` and load the matching project skill. Prefer a focused patch over broad reformatting: line wrapping or punctuation-only churn makes prose review difficult. After source changes, use the two-pass XeLaTeX command in `AGENTS.md` and summarize any verification that could not be run locally.
