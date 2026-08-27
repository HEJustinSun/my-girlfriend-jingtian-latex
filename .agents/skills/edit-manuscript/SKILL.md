---
name: edit-manuscript
description: Edit the Chinese prose, paragraph sequence, or narrative breaks in main.tex while preserving editorial intent and valid TeX. Use for copy edits, additions, removals, and manuscript restructuring; not for layout-only work.
---

# Edit Manuscript

Work in the document body between `\begin{document}` and `\end{document}`. Read enough surrounding prose to preserve the local rhythm and paragraph-spacing pattern before changing text.

- Put ordinary paragraphs in `\StoryParagraph{<space>}{<text>}`. Preserve the existing spacing argument unless the requested edit changes pacing or layout.
- Use `\NarrativeBreak` only for a visible centered separator and `\UnprintedPause` only for a blank narrative pause. Do not approximate them with manual `\vspace` in the manuscript.
- Preserve Chinese punctuation, names, numbers, and deliberate repetition. Make no stylistic rewrites beyond the requested editorial scope.
- Escape TeX-special characters introduced as literal prose: `#`, `$`, `%`, `&`, `_`, `{`, `}`, `~`, `^`, and `\`. Do not escape ordinary Chinese punctuation.
- Avoid rewrapping unaffected paragraphs or changing the preamble during a prose-only task.

Review the diff specifically for dropped or duplicated paragraphs and unbalanced braces. Then follow the repository's two-pass XeLaTeX validation. Visually inspect pages around changed text because small prose edits can repaginate the rest of the book.
