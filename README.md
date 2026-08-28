# 我的女友景甜 · International Editions

同一部作品，十二种语言，统一为 5 × 8 英寸的可搜索 PDF。每个版本都有本地化封面、书名、作者名、页眉、PDF 语言标记与元数据，并使用适合该文字系统的嵌入字体。

One story, twelve language editions, and one reproducible 5 × 8 inch PDF pipeline. Every edition includes a localized live-text cover, running title, PDF language tag and metadata, plus embedded fonts selected for its writing system.

## Editions

| Locale | Language | Edition source | Release PDF |
| --- | --- | --- | --- |
| `zh-CN` | 简体中文 | `editions/zh-CN.tex` | `dist/my-girlfriend-jing-tian-zh-CN.pdf` |
| `zh-Hant` | 繁體中文 | `editions/zh-Hant.tex` | `dist/my-girlfriend-jing-tian-zh-Hant.pdf` |
| `en-US` | English | `editions/en-US.tex` | `dist/my-girlfriend-jing-tian-en-US.pdf` |
| `es-ES` | Español | `editions/es-ES.tex` | `dist/my-girlfriend-jing-tian-es-ES.pdf` |
| `fr-FR` | Français | `editions/fr-FR.tex` | `dist/my-girlfriend-jing-tian-fr-FR.pdf` |
| `ru-RU` | Русский | `editions/ru-RU.tex` | `dist/my-girlfriend-jing-tian-ru-RU.pdf` |
| `ar` | العربية | `editions/ar.tex` | `dist/my-girlfriend-jing-tian-ar.pdf` |
| `ja-JP` | 日本語 | `editions/ja-JP.tex` | `dist/my-girlfriend-jing-tian-ja-JP.pdf` |
| `ko-KR` | 한국어 | `editions/ko-KR.tex` | `dist/my-girlfriend-jing-tian-ko-KR.pdf` |
| `de-DE` | Deutsch | `editions/de-DE.tex` | `dist/my-girlfriend-jing-tian-de-DE.pdf` |
| `pt-BR` | Português do Brasil | `editions/pt-BR.tex` | `dist/my-girlfriend-jing-tian-pt-BR.pdf` |
| `hi-IN` | हिन्दी | `editions/hi-IN.tex` | `dist/my-girlfriend-jing-tian-hi-IN.pdf` |

This set covers all six official UN languages and major East Asian, European, South Asian, and Latin American readerships.

## Build

[Tectonic 0.17.0](https://github.com/tectonic-typesetting/tectonic/releases/tag/tectonic%400.17.0) is the reference engine. Bundled Source Han and Noto fonts keep builds independent of the host operating system.

Build one edition:

```bash
./scripts/build-edition.sh ja-JP
```

Build and verify the complete release set:

```bash
./scripts/build-all.sh
./scripts/verify-editions.py
```

Set `TECTONIC=/absolute/path/to/tectonic` when the executable is not on `PATH`. PDFs are written to `dist/`; intermediate files and logs go to `build/editions/`.

The complete QA pass also requires Python 3, [Poppler](https://poppler.freedesktop.org/), qpdf, and the pinned `pypdf` dependency. On macOS, install the native tools with `brew install poppler qpdf`; on Ubuntu, use `sudo apt-get install poppler-utils qpdf python3-venv`. Then create the isolated verifier environment once:

```bash
python3 -m venv .tools/pdf-qa
.tools/pdf-qa/bin/pip install --require-hashes --requirement scripts/requirements-pdf-qa.txt
TECTONIC=/absolute/path/to/tectonic ./scripts/build-all.sh
.tools/pdf-qa/bin/python scripts/verify-editions.py
```

## Quality contract

`scripts/verify-editions.py` treats the Simplified Chinese source as the structural reference and checks that every locale preserves exactly:

- 272 story paragraphs, including every original spacing value;
- 5 printed narrative breaks and 2 unprinted pauses;
- the same semantic block order across all twelve editions.

For a complete PDF set it additionally checks PDF integrity; every page's MediaBox, CropBox, and rotation; searchable text on every body page; embedded subset fonts with Unicode maps; language metadata; the exact localized cover label; a unique body-page-1 destination; and both TeX and engine logs for missing glyphs, duplicate destinations, font substitutions, or overflow warnings. GitHub Actions runs the same build and verification from a clean Linux environment.

## Translation and review status

The Simplified Chinese text is the source edition at commit `0d064f6ce5c6f02a2e89edc6004b56723e8042be`.

The English translation was contributed by [@arlott-hsu](https://github.com/arlott-hsu) in the original commits retained from PR #87, then lightly copy-edited for this shared edition. The other translated editions are AI-assisted first editions and are explicitly marked as awaiting native-speaker literary review in their source headers. Corrections are welcome; please keep paragraph boundaries and spacing parameters unchanged so editions remain structurally comparable.

## Project layout

```text
content/<locale>.tex       translated story blocks only
editions/<locale>.tex      stable build entry points
tex/locales/<locale>.tex   language, fonts, metadata, and cover copy
tex/book.tex               shared trim size, typography, headers, and PDF behavior
tex/cover.tex              shared live-text translated cover
fonts/                     reproducible regional fonts and their licenses
scripts/                   build and verification entry points
```

The original `main.tex`, original outlined Chinese cover, and the English contributor files remain available for compatibility and provenance.
