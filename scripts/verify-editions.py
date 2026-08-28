#!/usr/bin/env python3
"""Validate multilingual source parity and, when present, release PDFs."""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:  # CI can use qpdf when pypdf is unavailable.
    PdfReader = None


ROOT = Path(__file__).resolve().parents[1]
LOCALE_FILE = ROOT / "editions" / "locales.txt"
EXPECTED_SIZE = (360.0, 576.0)
FORBIDDEN_LOG_PATTERNS = (
    "Missing character:",
    "destination with the same identifier",
    "Token not allowed in a PDF string",
    "Undefined control sequence",
    "LaTeX Error:",
    "LaTeX Warning:",
    "LaTeX Font Warning:",
    "Package fancyhdr Warning:",
    "Package fontspec Warning:",
    "Package hyperref Warning:",
    "Overfull \\hbox",
    "Overfull \\vbox",
)


def locales() -> list[str]:
    return [
        line.strip()
        for line in LOCALE_FILE.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]


def semantic_signature(path: Path) -> list[tuple[str, str]]:
    signature: list[tuple[str, str]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        paragraph = re.match(r"^\\StoryParagraph\{([0-9.]+)\}\{", line)
        if paragraph:
            signature.append(("paragraph", paragraph.group(1)))
        elif line == r"\NarrativeBreak":
            signature.append(("break", ""))
        elif line == r"\UnprintedPause":
            signature.append(("pause", ""))
    return signature


def run(command: list[str]) -> str:
    return subprocess.run(
        command,
        cwd=ROOT,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    ).stdout


def verify_sources(edition_ids: list[str]) -> None:
    reference = semantic_signature(ROOT / "content" / "zh-CN.tex")
    expected_counts = {"paragraph": 272, "break": 5, "pause": 2}
    actual_counts = {
        kind: sum(item_kind == kind for item_kind, _ in reference)
        for kind in expected_counts
    }
    if actual_counts != expected_counts:
        raise AssertionError(f"zh-CN semantic counts: {actual_counts}")

    for edition in edition_ids:
        for relative in (
            Path("editions") / f"{edition}.tex",
            Path("tex/locales") / f"{edition}.tex",
            Path("content") / f"{edition}.tex",
        ):
            if not (ROOT / relative).is_file():
                raise AssertionError(f"missing {relative}")
        signature = semantic_signature(ROOT / "content" / f"{edition}.tex")
        if signature != reference:
            raise AssertionError(f"semantic structure differs for {edition}")


def verify_pdf(edition: str, pdf_path: Path) -> None:
    qpdf = shutil.which("qpdf")
    pdfinfo = shutil.which("pdfinfo")
    pdffonts = shutil.which("pdffonts")
    pdftotext = shutil.which("pdftotext")
    required = {"pdfinfo": pdfinfo, "pdffonts": pdffonts, "pdftotext": pdftotext}
    missing = [name for name, path in required.items() if path is None]
    if missing:
        raise AssertionError("missing PDF QA tools: " + ", ".join(missing))
    if qpdf is None and PdfReader is None:
        raise AssertionError("PDF structure QA requires qpdf or pypdf")

    if qpdf is not None:
        run([qpdf, "--check", str(pdf_path)])
    info = run([pdfinfo, str(pdf_path)])
    size_match = re.search(r"Page size:\s+([0-9.]+) x ([0-9.]+) pts", info)
    if not size_match:
        raise AssertionError(f"cannot read page size for {edition}")
    size = tuple(float(value) for value in size_match.groups())
    if any(abs(actual - expected) > 0.1 for actual, expected in zip(size, EXPECTED_SIZE)):
        raise AssertionError(f"wrong page size for {edition}: {size}")
    if not re.search(r"^Title:\s+\S", info, re.MULTILINE):
        raise AssertionError(f"missing PDF title for {edition}")
    if not re.search(r"^Author:\s+\S", info, re.MULTILINE):
        raise AssertionError(f"missing PDF author for {edition}")

    fonts = run([pdffonts, str(pdf_path)]).splitlines()[2:]
    if not fonts or any(line.split()[-5:-2] != ["yes", "yes", "yes"] for line in fonts):
        raise AssertionError(f"fonts are not embedded with Unicode maps for {edition}")

    extracted = run([pdftotext, str(pdf_path), "-"])
    if len(extracted.strip()) < 500:
        raise AssertionError(f"too little extractable text for {edition}")

    if PdfReader is not None:
        reader = PdfReader(pdf_path)
        language = str(reader.trailer["/Root"].get("/Lang", ""))
        if language != edition:
            raise AssertionError(f"wrong PDF language for {edition}: {language!r}")
        if str(reader.trailer["/Root"].get("/PageMode", "")) != "/UseNone":
            raise AssertionError(f"wrong PDF page mode for {edition}")
        labels = reader.page_labels
        if len(labels) < 2 or labels[0] == "1" or labels[1] != "1":
            raise AssertionError(f"wrong cover/body page labels for {edition}: {labels[:2]}")
        page_destinations = [
            reader.get_destination_page_number(destination)
            for name, destination in reader.named_destinations.items()
            if name.startswith("page.")
        ]
        if page_destinations.count(1) != 1 or 0 in page_destinations:
            raise AssertionError(f"cover/body page destinations are not unique for {edition}")

    log_path = ROOT / "build" / "editions" / edition / f"{edition}.log"
    if not log_path.is_file():
        raise AssertionError(f"missing build log for {edition}")
    log = log_path.read_text(encoding="utf-8", errors="replace")
    violations = [pattern for pattern in FORBIDDEN_LOG_PATTERNS if pattern in log]
    if violations:
        raise AssertionError(f"{edition} log warnings: {', '.join(violations)}")


def main() -> int:
    edition_ids = locales()
    verify_sources(edition_ids)
    pdf_directory = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "dist")
    pdf_paths = [
        pdf_directory / f"my-girlfriend-jing-tian-{edition}.pdf"
        for edition in edition_ids
    ]
    existing = [path.exists() for path in pdf_paths]
    if any(existing) and not all(existing):
        missing = [str(path) for path, present in zip(pdf_paths, existing) if not present]
        raise AssertionError("partial PDF set; missing: " + ", ".join(missing))
    if all(existing):
        for edition, path in zip(edition_ids, pdf_paths):
            verify_pdf(edition, path)

    print(f"Verified {len(edition_ids)} source editions" + (" and PDFs" if all(existing) else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
