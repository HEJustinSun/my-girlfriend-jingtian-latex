#!/usr/bin/env python3
"""Build the XeLaTeX edition of *The Billionaire's $50 Million Bride*.

``screenplay.md`` is the single source of truth. This script parses its
block grammar (parts, episodes, sluglines, character cues, dialogue,
action, transitions) into semantic LaTeX macros, writes ``main.tex``, and
hands compilation to ``~/.claude/scripts/texcompile.sh`` with the XeLaTeX
engine (xeCJK is XeTeX-only).

Usage::

    python3 build.py            # regenerate main.tex, compile, place PDF
    python3 build.py --tex-only # regenerate main.tex, skip compilation

Stdlib only, no third-party dependencies.
"""

from __future__ import annotations

import argparse
import logging
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE_MD = HERE / "screenplay.md"
TEX_FILE = HERE / "main.tex"
PDF_OUTPUT = HERE / "五千万美元新娘.pdf"
TEXCOMPILE = Path.home() / ".claude" / "scripts" / "texcompile.sh"

logger = logging.getLogger("build")

# --------------------------------------------------------------------------
# Block grammar of screenplay.md
# --------------------------------------------------------------------------

RE_PART = re.compile(r"^# (第[一二三四]部分)　(.+)$")
RE_EPISODE = re.compile(r"^# EPISODE (\d+) — (.+)$")
RE_H2 = re.compile(r"^## (.+)$")
RE_H3 = re.compile(r"^### (.+)$")
RE_SCENE = re.compile(r"^\*\*(\d+)\. (.+)\*\*$")
RE_TRANSITION = re.compile(r"^\*\*\*(.+)\*\*\*$")
RE_BOLD_LINE = re.compile(r"^\*\*([^*]+)\*\*$")
RE_CUE_PAREN = re.compile(r"^\*\*([^*]+)\*\*（(.+)）$")
RE_META = re.compile(r"^\*\*([^*]+)\*\*：(.*)$")
RE_BULLET = re.compile(r"^-\s+(.+)$")
RE_NUMBERED = re.compile(r"^\d+\.\s+(.+)$")

TEX_SPECIALS = {
    "\\": r"\textbackslash{}",
    "{": r"\{",
    "}": r"\}",
    "$": r"\$",
    "&": r"\&",
    "#": r"\#",
    "_": r"\_",
    "%": r"\%",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
}
_DOLLAR_SENTINEL = "\x00"
_CNDASH_SENTINEL = "\x01"
#: Chinese 破折号. U+2014 is classed as Latin in the preamble so that English
#: sluglines keep their spacing; this macro puts it back in the CJK class.
CN_DASH = "——"


def tex_escape(text: str) -> str:
    """Escape a plain-text run for LaTeX.

    Pandoc emits literal dollar signs as ``\\$``; those are unescaped first
    so the generic pass does not turn them into ``\\textbackslash{}$``.

    :param text: Raw markdown text with no inline markup.
    :returns: A LaTeX-safe string.
    """
    text = text.replace(r"\$", _DOLLAR_SENTINEL)
    text = text.replace(CN_DASH, _CNDASH_SENTINEL)
    escaped = "".join(TEX_SPECIALS.get(char, char) for char in text)
    escaped = escaped.replace(_CNDASH_SENTINEL, r"\CNdash{}")
    return escaped.replace(_DOLLAR_SENTINEL, r"\$")


def split_blocks(markdown: str) -> list[str]:
    """Split markdown into blank-line-separated blocks.

    :param markdown: Full document text.
    :returns: Non-empty blocks in document order.
    """
    return [b for b in (chunk.strip() for chunk in markdown.split("\n\n")) if b]


# --------------------------------------------------------------------------
# Rendering
# --------------------------------------------------------------------------


def render_front_matter(blocks: list[str]) -> str:
    """Render the cover and specification pages from the leading blocks.

    :param blocks: Blocks appearing before the first ``#`` heading.
    :returns: LaTeX for the cover page and the specification page.
    """
    titles: list[str] = []
    specs: list[tuple[str, str]] = []
    tagline = ""
    for block in blocks:
        meta = RE_META.match(block)
        bold = RE_BOLD_LINE.match(block)
        if meta:
            specs.append((meta.group(1), meta.group(2)))
        elif bold and specs:
            tagline = bold.group(1)
        elif bold:
            titles.append(bold.group(1))

    def take(index: int) -> str:
        return tex_escape(titles[index]) if index < len(titles) else ""

    spec_rows = "\n".join(
        rf"  \SpecRow{{{tex_escape(k)}}}{{{tex_escape(v)}}}" for k, v in specs
    )
    return "\n".join(
        [
            r"\CoverPage",
            rf"  {{{take(0)}}}",
            rf"  {{{take(1)}}}",
            rf"  {{{take(2)}}}",
            rf"  {{{take(3)}}}",
            rf"  {{{tex_escape(tagline)}}}",
            "",
            r"\begin{SpecPage}",
            spec_rows,
            r"\end{SpecPage}",
        ]
    )


def _flush_list(buffer: list[str], ordered: bool) -> list[str]:
    """Close an accumulated bullet or numbered list.

    :param buffer: Already-escaped item bodies.
    :param ordered: Whether to emit a numbered rather than bulleted list.
    :returns: LaTeX lines for the list, or an empty list when nothing buffered.
    """
    if not buffer:
        return []
    env = "Numbers" if ordered else "Bullets"
    lines = [rf"\begin{{{env}}}"]
    lines += [rf"  \item {item}" for item in buffer]
    lines.append(rf"\end{{{env}}}")
    buffer.clear()
    return lines


def render_body(blocks: list[str]) -> str:
    """Render every block from the first heading onward.

    :param blocks: Blocks starting at ``# 第一部分``.
    :returns: The LaTeX body.
    :raises ValueError: If a block matches no known production.
    """
    out: list[str] = []
    pending: list[str] = []
    pending_ordered = False
    cue: tuple[str, str] | None = None

    def flush() -> None:
        nonlocal pending_ordered
        out.extend(_flush_list(pending, pending_ordered))
        pending_ordered = False

    for block in blocks:
        bullet = RE_BULLET.match(block)
        numbered = RE_NUMBERED.match(block)
        if bullet or numbered:
            ordered = numbered is not None
            if pending and ordered != pending_ordered:
                flush()
            pending_ordered = ordered
            body = (numbered or bullet).group(1)  # type: ignore[union-attr]
            pending.append(tex_escape(body))
            continue
        flush()

        if cue is not None:
            out.append(rf"\Dialogue{{{tex_escape(block)}}}")
            cue = None
            continue

        out.append(render_block(block))
        cue_match = RE_CUE_PAREN.match(block) or RE_BOLD_LINE.match(block)
        if cue_match and not RE_SCENE.match(block) and ":" not in cue_match.group(1):
            cue = (cue_match.group(1), "")

    flush()
    return "\n".join(line for line in out if line)


def render_block(block: str) -> str:
    """Map one non-list block to its LaTeX macro.

    :param block: A single markdown block.
    :returns: The rendered LaTeX line.
    :raises ValueError: If the block matches no known production.
    """
    if match := RE_PART.match(block):
        label, title = tex_escape(match.group(1)), tex_escape(match.group(2))
        return rf"\PartPage{{{label}}}{{{title}}}"
    if match := RE_EPISODE.match(block):
        return rf"\Episode{{{match.group(1)}}}{{{tex_escape(match.group(2))}}}"
    if match := RE_H3.match(block):
        return rf"\SubHead{{{tex_escape(match.group(1))}}}"
    if match := RE_H2.match(block):
        return rf"\SectionHead{{{tex_escape(match.group(1))}}}"
    if match := RE_SCENE.match(block):
        return rf"\Scene{{{match.group(1)}}}{{{tex_escape(match.group(2))}}}"
    if match := RE_TRANSITION.match(block):
        return rf"\Transition{{{tex_escape(match.group(1))}}}"
    if match := RE_CUE_PAREN.match(block):
        name, paren = match.group(1), match.group(2)
        return rf"\CueP{{{tex_escape(name)}}}{{{tex_escape(paren)}}}"
    if match := RE_BOLD_LINE.match(block):
        inner = match.group(1)
        if ":" in inner:
            return rf"\Insert{{{tex_escape(inner)}}}"
        return rf"\Cue{{{tex_escape(inner)}}}"
    if match := RE_META.match(block):
        label, body = match.group(1), match.group(2)
        macro = "Beat" if label.startswith("EP") else "EpisodeMeta"
        return rf"\{macro}{{{tex_escape(label)}}}{{{tex_escape(body)}}}"
    if block.startswith(("#", "*", "-")):
        raise ValueError(f"unhandled structural block: {block[:80]!r}")
    return rf"\Action{{{tex_escape(block)}}}"


def build_tex(markdown: str) -> str:
    """Assemble the complete ``main.tex`` document.

    :param markdown: Contents of ``screenplay.md``.
    :returns: The full LaTeX source.
    """
    blocks = split_blocks(markdown)
    split_at = next(i for i, b in enumerate(blocks) if b.startswith("#"))
    preamble = (HERE / "preamble.tex").read_text(encoding="utf-8")
    return "\n".join(
        [
            preamble.rstrip(),
            "",
            r"\begin{document}",
            render_front_matter(blocks[:split_at]),
            "",
            r"\TableOfContents",
            "",
            r"\StartBody",
            render_body(blocks[split_at:]),
            "",
            r"\end{document}",
            "",
        ]
    )


def compile_pdf() -> None:
    """Compile ``main.tex`` with XeLaTeX and move the PDF to its final name.

    :raises SystemExit: If ``texcompile.sh`` reports a failure.
    """
    result = subprocess.run(
        [str(TEXCOMPILE), "--engine", "xelatex", str(TEX_FILE)],
        capture_output=True,
        text=True,
        check=False,
    )
    sys.stdout.write(result.stdout)
    sys.stderr.write(result.stderr)
    if result.returncode != 0:
        raise SystemExit(f"texcompile.sh failed with exit code {result.returncode}")
    produced = TEX_FILE.with_suffix(".pdf")
    if not produced.exists():
        raise SystemExit("compilation reported success but main.pdf is missing")
    shutil.move(str(produced), str(PDF_OUTPUT))
    logger.info("PDF written to %s", PDF_OUTPUT.name)


def main() -> None:
    """Parse arguments, regenerate ``main.tex``, and optionally compile."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--tex-only",
        action="store_true",
        help="regenerate main.tex without running XeLaTeX",
    )
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="[build] %(message)s")

    markdown = SOURCE_MD.read_text(encoding="utf-8")
    tex = build_tex(markdown)
    TEX_FILE.write_text(tex, encoding="utf-8")
    logger.info("wrote %s (%d lines)", TEX_FILE.name, tex.count("\n") + 1)
    if not args.tex_only:
        compile_pdf()


if __name__ == "__main__":
    main()
